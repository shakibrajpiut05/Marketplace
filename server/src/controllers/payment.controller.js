import mongoose from "mongoose";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Deal from "../models/Deal.js";
import Payment from "../models/Payment.js";
import Invoice from "../models/Invoice.js";
import User from "../models/User.js";
import { createActivityLog } from "../services/activityLog.service.js";
import { createNotifications } from "../services/notification.service.js";

const ALLOWED_METHODS = new Set(["bank_transfer", "upi", "other"]);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PAYMENT_UPLOAD_ROOT = path.resolve(__dirname, "../../uploads/documents");
const PAYMENT_TRANSITIONS = {
  pending: new Set(["pending", "initiated"]),
  initiated: new Set(["initiated", "received", "failed"]),
  failed: new Set(["failed", "initiated"]),
  received: new Set(["received"]),
};

const getDealForUser = async (dealId, user) => {
  if (!mongoose.Types.ObjectId.isValid(dealId)) return null;
  const query = { _id: dealId };
  if (user.role === "buyer") query.buyerId = user._id;
  if (user.role === "seller") query.sellerId = user._id;
  return Deal.findOne(query)
    .populate("buyerId", "name company email phone")
    .populate("sellerId", "name company email phone")
    .populate("listingId", "category location complianceYear validTill price")
    .lean();
};

const getDealTotal = (deal) =>
  Number(deal?.commercialTerms?.finalAmount ?? deal?.finalAmount ?? 0);

const buildInvoiceNumber = () => {
  const year = new Date().getFullYear();
  return `EPR-INV-${year}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
};

const ensureInvoice = async (deal) => {
  const existing = await Invoice.findOne({ dealId: deal._id })
    .populate("buyerId", "name company email phone")
    .populate("sellerId", "name company email phone");
  if (existing) return existing;

  const quantity = Number(deal.quantity || 0);
  const unitPrice = Number(deal.agreedPrice || 0);
  const subtotal = Number(deal.creditSubtotal ?? quantity * unitPrice);
  const serviceFee = Number(deal.serviceFee ?? deal.commissionAmount ?? 0);
  const total = getDealTotal(deal);

  try {
    const created = await Invoice.create({
      dealId: deal._id,
      invoiceNumber: buildInvoiceNumber(),
      status: "issued",
      currency: deal.commercialTerms?.currency || "INR",
      sellerId: deal.sellerId?._id || deal.sellerId,
      buyerId: deal.buyerId?._id || deal.buyerId,
      items: [
        {
          description: `${deal.listingId?.category || "EPR credit"} — EPR credit purchase`,
          quantity,
          unitPrice,
          amount: Math.round(subtotal * 100) / 100,
        },
      ],
      subtotal: Math.round(subtotal * 100) / 100,
      serviceFee: Math.round(serviceFee * 100) / 100,
      total: Math.round(total * 100) / 100,
      notes: "Generated from the locked commercial terms of the EPR Nexus deal.",
    });

    return created.populate([
      { path: "buyerId", select: "name company email phone" },
      { path: "sellerId", select: "name company email phone" },
    ]);
  } catch (error) {
    if (error?.code === 11000) {
      return Invoice.findOne({ dealId: deal._id })
        .populate("buyerId", "name company email phone")
        .populate("sellerId", "name company email phone");
    }
    throw error;
  }
};

export const getPaymentForDeal = async (req, res) => {
  try {
    const deal = await getDealForUser(req.params.dealId, req.user);
    if (!deal && req.user.role !== "admin") {
      return res.status(404).json({ success: false, message: "Deal not found", code: "DEAL_NOT_FOUND" });
    }
    const adminDeal = deal || (await Deal.findById(req.params.dealId).lean());
    if (!adminDeal) {
      return res.status(404).json({ success: false, message: "Deal not found", code: "DEAL_NOT_FOUND" });
    }

    let payment = await Payment.findOne({ dealId: adminDeal._id }).lean();

    // Completed deals are only valid after payment confirmation. Repair the
    // payment record on read for older deals that were completed while the
    // payment status remained stale.
    if (adminDeal.status === "completed" && payment && payment.status !== "received") {
      const repaired = await Payment.findByIdAndUpdate(
        payment._id,
        {
          $set: {
            status: "received",
            receivedAt: payment.receivedAt || new Date(),
          },
        },
        { new: true },
      ).lean();
      payment = repaired || payment;
    }

    // The invoice belongs to the deal, not to the payment attempt.
    // Create it on first authorized view so buyers/sellers can review the
    // locked commercial terms before recording a payment attempt.
    let invoice = await Invoice.findOne({ dealId: adminDeal._id })
      .populate("buyerId", "name company email phone")
      .populate("sellerId", "name company email phone")
      .lean();

    if (!invoice && getDealTotal(adminDeal) > 0) {
      const generatedInvoice = await ensureInvoice(adminDeal);
      invoice = generatedInvoice?.toObject
        ? generatedInvoice.toObject()
        : generatedInvoice;
    }

    if (adminDeal.status === "completed" && invoice && invoice.status !== "paid") {
      const paidInvoice = await Invoice.findByIdAndUpdate(
        invoice._id,
        {
          $set: {
            status: "paid",
            paidAt: invoice.paidAt || new Date(),
          },
        },
        { new: true },
      ).lean();
      invoice = paidInvoice || invoice;
    }

    return res.json({
      success: true,
      payment,
      invoice,
      amount: getDealTotal(adminDeal),
      currency: adminDeal.commercialTerms?.currency || "INR",
    });
  } catch (error) {
    console.error("Get payment error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch payment details" });
  }
};

export const initiatePayment = async (req, res) => {
  try {
    const { dealId } = req.params;
    const { method = "bank_transfer", reference = "", notes = "" } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(dealId)) {
      return res.status(400).json({ success: false, message: "A valid dealId is required", code: "INVALID_DEAL_ID" });
    }
    if (req.user.role !== "buyer") {
      return res.status(403).json({ success: false, message: "Only the buyer can initiate payment", code: "BUYER_REQUIRED" });
    }
    if (!ALLOWED_METHODS.has(method)) {
      return res.status(400).json({ success: false, message: "Invalid payment method", code: "INVALID_PAYMENT_METHOD" });
    }
    if (!String(reference || "").trim()) {
      return res.status(400).json({ success: false, message: "UTR / transaction reference is required", code: "PAYMENT_REFERENCE_REQUIRED" });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Payment screenshot is required", code: "PAYMENT_PROOF_REQUIRED" });
    }

    const deal = await Deal.findOne({ _id: dealId, buyerId: req.user._id });
    if (!deal) return res.status(404).json({ success: false, message: "Deal not found", code: "DEAL_NOT_FOUND" });
    if (["completed", "cancelled"].includes(deal.status)) {
      return res.status(409).json({ success: false, message: "This deal is no longer payable", code: "DEAL_NOT_PAYABLE" });
    }
    if (!["terms_agreed", "payment_coordination"].includes(deal.status)) {
      return res.status(409).json({ success: false, message: "Payment can only be initiated after commercial terms are agreed", code: "PAYMENT_TOO_EARLY" });
    }

    const previousStatus = deal.paymentStatus;
    const previousDealStatus = deal.status;
    if (!PAYMENT_TRANSITIONS[previousStatus]?.has("initiated")) {
      return res.status(409).json({ success: false, message: `Payment cannot be initiated from ${previousStatus}`, code: "INVALID_PAYMENT_TRANSITION" });
    }

    const amount = getDealTotal(deal);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(409).json({ success: false, message: "Deal has an invalid payable amount", code: "INVALID_PAYMENT_AMOUNT" });
    }

    const now = new Date();
    let payment;
    try {
      payment = await Payment.findOneAndUpdate(
        { dealId: deal._id },
        {
          $set: {
            amount,
            currency: deal.commercialTerms?.currency || "INR",
            method,
            status: "initiated",
            reference: String(reference || "").trim(),
            notes: String(notes || "").trim(),
            proofFileName: req.file.originalname || req.file.filename,
            proofFileUrl: `/uploads/documents/${req.file.filename}`,
            proofMimeType: req.file.mimetype || "",
            proofFileSize: Number(req.file.size || 0),
            proofSubmittedAt: now,
            initiatedAt: now,
            failedAt: null,
          },
          $setOnInsert: { dealId: deal._id },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      );
    } catch (error) {
      if (error?.code === 11000) {
        payment = await Payment.findOneAndUpdate(
          { dealId: deal._id },
          { $set: { amount, method, status: "initiated", reference: String(reference || "").trim(), notes: String(notes || "").trim(), proofFileName: req.file.originalname || req.file.filename, proofFileUrl: `/uploads/documents/${req.file.filename}`, proofMimeType: req.file.mimetype || "", proofFileSize: Number(req.file.size || 0), proofSubmittedAt: now, initiatedAt: now, failedAt: null } },
          { new: true },
        );
      } else throw error;
    }

    if (deal.status === "terms_agreed") deal.status = "payment_coordination";
    deal.paymentStatus = "initiated";
    await deal.save();

    const invoice = await ensureInvoice(deal);

    await createActivityLog({
      actorId: req.user._id,
      action: "payment_initiated",
      entityType: "deal",
      entityId: deal._id,
      before: { status: previousDealStatus, paymentStatus: previousStatus },
      after: { status: deal.status, paymentStatus: deal.paymentStatus },
      metadata: { amount, method, reference: payment.reference },
    });

    await createNotifications({
      recipients: [deal.sellerId],
      actor: req.user._id,
      type: "payment_initiated",
      title: "Payment initiated",
      message: `Payment has been initiated for your EPR credit deal (${deal.quantity} MT). EPR Nexus will confirm receipt after verification.`,
      entityType: "deal",
      entityId: deal._id,
      metadata: { amount, method },
    });

    const admins = await User.find({ role: "admin", isActive: true }).select("_id").lean();
    if (admins.length) {
      await createNotifications({
        recipients: admins.map((admin) => admin._id),
        actor: req.user._id,
        type: "payment_proof_submitted",
        title: "Payment proof submitted",
        message: `Buyer submitted ${method.replaceAll("_", " ")} payment proof for the ${deal.quantity} MT deal. Review the UTR and screenshot before confirming payment.`,
        entityType: "deal",
        entityId: deal._id,
        metadata: { amount, method, reference: payment.reference, paymentId: payment._id },
      });
    }

    return res.status(200).json({ success: true, message: "Payment proof submitted", payment, invoice, deal });
  } catch (error) {
    console.error("Initiate payment error:", error);
    return res.status(500).json({ success: false, message: "Failed to initiate payment", code: "PAYMENT_INITIATION_FAILED" });
  }
};

export const downloadPaymentProof = async (req, res) => {
  try {
    const { paymentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({ success: false, message: "A valid paymentId is required" });
    }

    const payment = await Payment.findById(paymentId).lean();
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found", code: "PAYMENT_NOT_FOUND" });

    const deal = await Deal.findById(payment.dealId).lean();
    if (!deal) return res.status(404).json({ success: false, message: "Deal not found", code: "DEAL_NOT_FOUND" });

    const allowed = req.user.role === "admin" ||
      (req.user.role === "buyer" && String(deal.buyerId) === String(req.user._id)) ||
      (req.user.role === "seller" && String(deal.sellerId) === String(req.user._id));
    if (!allowed) return res.status(403).json({ success: false, message: "You are not authorized to view this payment proof", code: "FORBIDDEN" });

    if (!payment.proofFileUrl) {
      return res.status(404).json({ success: false, message: "Payment screenshot not found", code: "PAYMENT_PROOF_MISSING" });
    }

    const filename = path.basename(payment.proofFileUrl);
    const filePath = path.resolve(PAYMENT_UPLOAD_ROOT, filename);
    if (!filePath.startsWith(`${PAYMENT_UPLOAD_ROOT}${path.sep}`) || !fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: "Payment screenshot file is no longer available", code: "PAYMENT_PROOF_FILE_MISSING" });
    }

    return res.sendFile(filePath, {
      headers: {
        "Content-Disposition": `inline; filename="${encodeURIComponent(payment.proofFileName || filename)}"`,
      },
    });
  } catch (error) {
    console.error("Download payment proof error:", error);
    return res.status(500).json({ success: false, message: "Failed to load payment proof" });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { status, notes = "" } = req.body || {};
    if (req.user.role !== "admin") return res.status(403).json({ success: false, message: "Only admins can confirm payment", code: "ADMIN_REQUIRED" });
    if (!mongoose.Types.ObjectId.isValid(paymentId)) return res.status(400).json({ success: false, message: "A valid paymentId is required" });
    if (!Object.prototype.hasOwnProperty.call(PAYMENT_TRANSITIONS, status) && !["received", "failed", "initiated"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid payment status" });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found", code: "PAYMENT_NOT_FOUND" });
    const deal = await Deal.findById(payment.dealId);
    if (!deal) return res.status(404).json({ success: false, message: "Deal not found", code: "DEAL_NOT_FOUND" });

    if (!PAYMENT_TRANSITIONS[payment.status]?.has(status)) {
      return res.status(409).json({ success: false, message: `Invalid payment transition from ${payment.status} to ${status}`, code: "INVALID_PAYMENT_TRANSITION" });
    }
    if (status === "received" && !["terms_agreed", "payment_coordination"].includes(deal.status)) {
      return res.status(409).json({ success: false, message: "Payment cannot be confirmed before terms are agreed", code: "PAYMENT_TOO_EARLY" });
    }

    const previous = payment.status;
    payment.status = status;
    payment.notes = String(notes || "").trim() || payment.notes;
    payment.confirmedBy = req.user._id;
    if (status === "received") payment.receivedAt = new Date();
    if (status === "failed") payment.failedAt = new Date();
    await payment.save();

    deal.paymentStatus = status;
    if (status === "received" && deal.status === "terms_agreed") deal.status = "payment_coordination";
    await deal.save();

    const invoice = await Invoice.findOne({ dealId: deal._id });
    if (invoice && status === "received") {
      invoice.status = "paid";
      invoice.paidAt = new Date();
      await invoice.save();
    }

    await createActivityLog({
      actorId: req.user._id,
      action: "payment_status_changed",
      entityType: "deal",
      entityId: deal._id,
      before: { paymentStatus: previous },
      after: { paymentStatus: status },
      metadata: { paymentId: payment._id, amount: payment.amount, notes: payment.notes },
    });

    await createNotifications({
      recipients: [deal.buyerId, deal.sellerId],
      actor: req.user._id,
      type: status === "received" ? "payment_received" : "deal_status_changed",
      title: status === "received" ? "Payment received" : `Payment ${status}`,
      message: status === "received"
        ? `Payment of ${deal.finalAmount} INR has been confirmed for your EPR credit deal.`
        : `Payment for your EPR credit deal is now ${status}.`,
      entityType: "deal",
      entityId: deal._id,
      metadata: { paymentStatus: status, amount: payment.amount },
    });

    return res.json({ success: true, message: `Payment marked ${status}`, payment, invoice, deal });
  } catch (error) {
    console.error("Update payment status error:", error);
    return res.status(500).json({ success: false, message: "Failed to update payment status" });
  }
};
