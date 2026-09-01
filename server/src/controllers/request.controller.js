import mongoose from "mongoose";

import PurchaseRequest from "../models/PurchaseRequest.js";
import SellerListing from "../models/SellerListing.js";
import Deal from "../models/Deal.js";
import {
  createNotification,
  notifyDealStatusChange,
} from "../services/notification.service.js";
import { createActivityLog } from "../services/activityLog.service.js";
import { sendTransactionEmail } from "../services/email.service.js";
import { CLIENT_URL } from "../config/env.js";

const roundMoney = (value) => Math.round(Number(value) * 100) / 100;

const parsePositiveNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
};

const parseNonNegativeNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
};

const buildOffer = ({
  quantity,
  creditPricePerUnit,
  serviceFee,
  version,
  note = "",
  issuedBy,
  expiresAt = null,
  sentAt = new Date(),
}) => {
  const price = parsePositiveNumber(creditPricePerUnit);
  const commission = parseNonNegativeNumber(serviceFee);
  const qty = parsePositiveNumber(quantity);

  if (!qty || price === null || commission === null) return null;

  const creditSubtotal = roundMoney(qty * price);
  const finalAmount = roundMoney(creditSubtotal + commission);

  return {
    version,
    creditPricePerUnit: roundMoney(price),
    creditSubtotal,
    serviceFee: roundMoney(commission),
    finalAmount,
    currency: "INR",
    sentAt,
    expiresAt,
    lastUpdatedBy: issuedBy,
    note: String(note || "").trim(),
    status: "sent",
  };
};

export const createPurchaseRequest = async (req, res) => {
  try {
    if (req.user.role !== "buyer") {
      return res.status(403).json({
        success: false,
        message: "Only buyers can create purchase requests",
        code: "BUYER_ONLY",
      });
    }

    const {
      listingId,
      quantity,
      contactPerson,
      companyName,
      email,
      gstNumber,
      phone,
      notes,
    } = req.body || {};

    if (!listingId || !mongoose.Types.ObjectId.isValid(listingId)) {
      return res.status(400).json({
        success: false,
        message: "A valid listingId is required",
      });
    }

    const listing = await SellerListing.findOne({
      _id: listingId,
      status: "active",
      validTill: { $gte: new Date() },
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "This credit listing is no longer available",
      });
    }

    const parsedQuantity = parsePositiveNumber(quantity);

    if (!parsedQuantity) {
      return res.status(400).json({
        success: false,
        message: "Requested quantity must be a valid positive number",
      });
    }

    const availableQuantity =
      Number(listing.quantity || 0) - Number(listing.reservedQuantity || 0);

    if (parsedQuantity > availableQuantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${Math.max(0, availableQuantity)} MT is currently available`,
      });
    }

    const requiredFields = {
      contactPerson,
      companyName,
      email,
      gstNumber,
      phone,
    };

    for (const [field, value] of Object.entries(requiredFields)) {
      if (!String(value || "").trim()) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`,
        });
      }
    }

    const purchaseRequest = await PurchaseRequest.create({
      buyerId: req.user._id,
      listingId: listing._id,
      quantity: parsedQuantity,
      contactPerson: contactPerson.trim(),
      companyName: companyName.trim(),
      email: email.trim().toLowerCase(),
      gstNumber: gstNumber.trim(),
      phone: phone.trim(),
      notes: String(notes || "").trim(),
      status: "pending",
    });

    const admin = await (await import("../models/User.js")).default
      .findOne({ role: "admin", isActive: true })
      .select("_id")
      .lean();

    if (admin?._id) {
      await createNotification({
        recipient: admin._id,
        actor: req.user._id,
        type: "purchase_request_created",
        title: "New buyer credit request",
        message: `A buyer requested ${parsedQuantity} MT of ${listing.category || "EPR credits"}.`,
        entityType: "request",
        entityId: purchaseRequest._id,
        metadata: {
          quantity: parsedQuantity,
          category: listing.category,
        },
      });
    }

    return res.status(201).json({
      success: true,
      message: "Purchase request submitted successfully",
      request: purchaseRequest,
    });
  } catch (error) {
    console.error("Create purchase request error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit purchase request",
    });
  }
};

export const getAdminPurchaseRequests = async (req, res) => {
  try {
    const requests = await PurchaseRequest.find()
      .populate("buyerId", "name company email phone role")
      .populate({
        path: "listingId",
        select:
          "category quantity totalQuantity price location complianceYear validTill reservedQuantity sellerId",
        populate: {
          path: "sellerId",
          select: "name company email phone",
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get admin purchase requests error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch purchase requests",
    });
  }
};

/*
 * ADMIN: create or revise the current quotation.
 *
 * Buyers never provide commercial terms here.
 * Every revision creates a new immutable history version.
 */
export const issuePurchaseRequestOffer = async (req, res) => {
  try {
    const { requestId } = req.params;
    const {
      creditPricePerUnit,
      serviceFee,
      commissionAmount,
      expiresAt,
      note = "",
    } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({
        success: false,
        message: "A valid requestId is required",
      });
    }

    const request = await PurchaseRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Purchase request not found",
      });
    }

    const existingDeal = await Deal.findOne({ requestId: request._id }).select("_id status quotationVersion").lean();

    if (existingDeal) {
      return res.status(409).json({
        success: false,
        message: "This request already has a deal. A new quotation cannot be issued.",
        code: "DEAL_ALREADY_EXISTS",
        dealId: existingDeal._id,
      });
    }

    if (["completed", "cancelled", "rejected"].includes(request.status)) {
      return res.status(409).json({
        success: false,
        message: `A quotation cannot be issued for a ${request.status} request`,
        code: "REQUEST_NOT_QUOTABLE",
      });
    }

    const price = parsePositiveNumber(creditPricePerUnit);
    const commissionInput =
      serviceFee !== undefined ? serviceFee : commissionAmount;
    const commission = parseNonNegativeNumber(commissionInput);

    if (price === null) {
      return res.status(400).json({
        success: false,
        message: "Credit price must be a valid positive number",
        code: "INVALID_CREDIT_PRICE",
      });
    }

    if (commission === null) {
      return res.status(400).json({
        success: false,
        message: "EPR Nexus commission must be a valid non-negative amount",
        code: "INVALID_COMMISSION_AMOUNT",
      });
    }

    let parsedExpiry = null;
    if (expiresAt) {
      parsedExpiry = new Date(expiresAt);
      if (
        Number.isNaN(parsedExpiry.getTime()) ||
        parsedExpiry.getTime() <= Date.now()
      ) {
        return res.status(400).json({
          success: false,
          message: "Quotation expiry must be a valid future date",
          code: "INVALID_QUOTATION_EXPIRY",
        });
      }
    }

    const nextVersion =
      Math.max(
        Number(request.offer?.version || 0),
        ...(request.offerHistory || []).map((item) =>
          Number(item.version || 0),
        ),
      ) + 1;

    const now = new Date();

    if (request.offer && request.offer.version > 0) {
      const previousHistory = request.offerHistory.find(
        (item) => Number(item.version) === Number(request.offer.version),
      );

      if (previousHistory && previousHistory.status === "sent") {
        previousHistory.status = "superseded";
      }

      if (request.offer.status === "sent" || request.offer.status === "draft") {
        request.offer.status = "superseded";
      }
    }

    const offer = buildOffer({
      quantity: request.quantity,
      creditPricePerUnit: price,
      serviceFee: commission,
      version: nextVersion,
      note,
      issuedBy: req.user._id,
      expiresAt: parsedExpiry,
      sentAt: now,
    });

    request.offer = offer;

    request.offerHistory.push({
      version: offer.version,
      creditPricePerUnit: offer.creditPricePerUnit,
      creditSubtotal: offer.creditSubtotal,
      serviceFee: offer.serviceFee,
      finalAmount: offer.finalAmount,
      currency: offer.currency,
      sentAt: offer.sentAt,
      expiresAt: offer.expiresAt,
      note: offer.note,
      issuedBy: req.user._id,
      acceptedAt: null,
      status: "sent",
    });

    request.status = "offer_sent";
    request.rejectionReason = "";
    await request.save();

    await createActivityLog({
      actorId: req.user._id,
      action: "purchase_request_offer_issued",
      entityType: "purchase_request",
      entityId: request._id,
      before: {
        offerVersion:
          request.offerHistory.length > 1
            ? request.offerHistory[request.offerHistory.length - 2]?.version ||
              null
            : null,
      },
      after: {
        offerVersion: offer.version,
        creditPricePerUnit: offer.creditPricePerUnit,
        creditSubtotal: offer.creditSubtotal,
        serviceFee: offer.serviceFee,
        finalAmount: offer.finalAmount,
      },
      metadata: {
        quantity: request.quantity,
        note: offer.note,
      },
    });

    await createNotification({
      recipient: request.buyerId,
      actor: req.user._id,
      type: "quotation_sent",
      title: `Quotation #${offer.version} is ready`,
      message: `EPR Nexus sent quotation #${offer.version}. Total amount: ₹${offer.finalAmount.toLocaleString("en-IN")}.`,
      entityType: "request",
      entityId: request._id,
      metadata: {
        quotationVersion: offer.version,
        finalAmount: offer.finalAmount,
      },
    });

    // Email is best-effort and must never make a successfully issued quotation fail.
    try {
      await sendTransactionEmail({
        to: request.email,
        subject:
          offer.version === 1
            ? "Your EPR Nexus quotation is ready"
            : `Your EPR Nexus quotation #${offer.version} has been revised`,
        title:
          offer.version === 1
            ? "Your quotation is ready"
            : `Quotation #${offer.version} is ready`,
        message:
          `EPR Nexus has issued quotation #${offer.version} for ${request.quantity} MT. ` +
          `Total payable amount: ₹${offer.finalAmount.toLocaleString("en-IN")}.`,
        actionText: "Review quotation",
        actionUrl: `${CLIENT_URL}/buyer?section=quotations`,
      });
    } catch (emailError) {
      console.error(
        "Quotation email delivery failed:",
        emailError?.message || emailError,
      );
    }

    return res.status(200).json({
      success: true,
      message:
        offer.version === 1
          ? "Quotation sent successfully"
          : `Quotation #${offer.version} sent successfully`,
      request,
      offer,
    });
  } catch (error) {
    console.error("Issue purchase request offer error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to issue quotation",
    });
  }
};

/*
 * BUYER: accept the currently sent quotation.
 *
 * Acceptance locks the exact commercial terms and creates the deal in
 * payment_coordination. It does NOT mean payment has been received.
 */
export const acceptPurchaseRequestOffer = async (req, res) => {
  try {
    const { requestId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({
        success: false,
        message: "A valid requestId is required",
      });
    }

    const request = await PurchaseRequest.findOne({
      _id: requestId,
      buyerId: req.user._id,
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Purchase request not found",
      });
    }

    const existingDeal = await Deal.findOne({ requestId: request._id }).select("_id status quotationVersion").lean();

    if (existingDeal) {
      return res.status(409).json({
        success: false,
        message: "A deal already exists for this request. This quotation is no longer actionable.",
        deal: existingDeal,
        code: "DEAL_ALREADY_EXISTS",
      });
    }

    if (["completed", "cancelled", "rejected"].includes(request.status)) {
      return res.status(409).json({
        success: false,
        message: `This request is already ${request.status}`,
        code: "REQUEST_NOT_ACCEPTABLE",
      });
    }

    const offer = request.offer;

    if (
      request.status !== "offer_sent" ||
      !offer ||
      !offer.version ||
      offer.finalAmount == null
    ) {
      return res.status(409).json({
        success: false,
        message: "There is no active quotation available to accept",
        code: "NO_ACTIVE_QUOTATION",
      });
    }
    if (offer.expiresAt && new Date(offer.expiresAt).getTime() <= Date.now()) {
      offer.status = "expired";

      const historyItem = request.offerHistory.find(
        (item) => Number(item.version) === Number(offer.version),
      );
      if (historyItem) historyItem.status = "expired";

      await request.save();

      return res.status(409).json({
        success: false,
        message:
          "This quotation has expired. Please wait for a revised quotation.",
        code: "QUOTATION_EXPIRED",
      });
    }

    const quantity = parsePositiveNumber(request.quantity);
    const agreedPrice = parsePositiveNumber(offer.creditPricePerUnit);
    const commissionAmount = parseNonNegativeNumber(offer.serviceFee);

    if (!quantity || agreedPrice === null || commissionAmount === null) {
      return res.status(400).json({
        success: false,
        message: "The quotation contains invalid commercial terms",
        code: "INVALID_QUOTATION_TERMS",
      });
    }

    const listing = await SellerListing.findOneAndUpdate(
      {
        _id: request.listingId,
        status: "active",
        validTill: { $gte: new Date() },
        $expr: {
          $gte: [
            {
              $subtract: ["$quantity", { $ifNull: ["$reservedQuantity", 0] }],
            },
            quantity,
          ],
        },
      },
      {
        $inc: {
          reservedQuantity: quantity,
        },
      },
      { new: true },
    );

    if (!listing) {
      return res.status(409).json({
        success: false,
        message:
          "The requested inventory is no longer available at the time of quotation acceptance",
        code: "INSUFFICIENT_INVENTORY",
      });
    }

    const creditSubtotal = roundMoney(quantity * agreedPrice);
    const finalAmount = roundMoney(creditSubtotal + commissionAmount);
    const acceptedAt = new Date();

    const historyItem = request.offerHistory.find(
      (item) => Number(item.version) === Number(offer.version),
    );

    try {
      const deal = await Deal.create({
        requestId: request._id,
        requirementId: null,
        matchedListingId: listing._id,
        listingId: listing._id,
        buyerId: request.buyerId,
        sellerId: listing.sellerId,
        quantity,
        agreedPrice,
        commissionRate: 0,
        commissionAmount,
        serviceFee: commissionAmount,
        creditSubtotal,
        finalAmount,
        commercialTerms: {
          quantity,
          agreedPrice,
          creditSubtotal,
          commissionAmount,
          finalAmount,
          currency: "INR",
          quotationVersion: offer.version,
          lockedAt: acceptedAt,
        },
        commercialTermsLocked: true,
        commercialTermsLockedAt: acceptedAt,
        quotationVersion: offer.version,
        inventoryReserved: true,
        status: "payment_coordination",
        paymentStatus: "pending",
        notes: `Quotation #${offer.version} accepted by buyer. Commercial terms are locked.`,
      });

      offer.status = "accepted";
      offer.acceptedAt = acceptedAt;

      if (historyItem) {
        historyItem.status = "accepted";
        historyItem.acceptedAt = acceptedAt;
      }

      request.acceptedOfferVersion = offer.version;
      request.acceptedOfferSnapshot = {
        creditPricePerUnit: agreedPrice,
        creditSubtotal,
        serviceFee: commissionAmount,
        finalAmount,
        currency: "INR",
        version: offer.version,
        acceptedAt,
      };
      request.status = "offer_accepted";
      await request.save();

      await createActivityLog({
        actorId: req.user._id,
        action: "purchase_request_offer_accepted",
        entityType: "purchase_request",
        entityId: request._id,
        before: {
          status: "offer_sent",
          offerVersion: offer.version,
        },
        after: {
          status: request.status,
          offerVersion: offer.version,
          dealId: deal._id,
        },
        metadata: {
          quantity,
          agreedPrice,
          creditSubtotal,
          commissionAmount,
          finalAmount,
        },
      });

      await notifyDealStatusChange({
        deal,
        status: deal.status,
        paymentStatus: deal.paymentStatus,
        actor: req.user._id,
      });

      return res.status(200).json({
        success: true,
        message: `Quotation #${offer.version} accepted. Deal moved to payment coordination.`,
        request,
        deal,
      });
    } catch (error) {
      await SellerListing.updateOne(
        { _id: listing._id },
        { $inc: { reservedQuantity: -quantity } },
      );
      throw error;
    }
  } catch (error) {
    console.error("Accept purchase request offer error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to accept quotation",
    });
  }
};

export const reviewPurchaseRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, rejectionReason } = req.body || {};

    const allowedStatuses = [
      "reviewing",
      "matched",
      "negotiating",
      "approved",
      "rejected",
      "cancelled",
    ];

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({
        success: false,
        message: "A valid requestId is required",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request status",
      });
    }

    if (status === "rejected" && !String(rejectionReason || "").trim()) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const request = await PurchaseRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Purchase request not found",
      });
    }

    if (["completed", "cancelled"].includes(request.status)) {
      return res.status(409).json({
        success: false,
        message: `A ${request.status} request cannot be changed`,
        code: "REQUEST_TERMINAL",
      });
    }

    /*
     * Approval no longer creates a deal.
     * Admin approval means the request is commercially ready for a quotation.
     * The deal is created only after the buyer accepts a quotation.
     */
    if (
      status === "approved" &&
      (!request.offer || request.offer.status !== "sent")
    ) {
      request.status = "approved";
      request.rejectionReason = "";
      await request.save();

      await createActivityLog({
        actorId: req.user._id,
        action: "purchase_request_approved",
        entityType: "purchase_request",
        entityId: request._id,
        before: { status: "reviewing" },
        after: { status: "approved" },
        metadata: {
          buyerId: request.buyerId,
          listingId: request.listingId,
          quantity: request.quantity,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Purchase request approved. Issue a quotation to the buyer.",
        request,
      });
    }

    const previousStatus = request.status;
    const previousRejectionReason = request.rejectionReason || "";

    request.status = status;
    request.rejectionReason =
      status === "rejected" ? String(rejectionReason).trim() : "";

    if (status === "cancelled") {
      request.offer.status =
        request.offer?.status === "sent" ? "cancelled" : request.offer?.status;

      const activeHistory = request.offerHistory.find(
        (item) => item.status === "sent",
      );
      if (activeHistory) activeHistory.status = "cancelled";
    }

    await request.save();

    await createActivityLog({
      actorId: req.user._id,
      action:
        status === "rejected"
          ? "purchase_request_rejected"
          : status === "cancelled"
            ? "purchase_request_cancelled"
            : "purchase_request_updated",
      entityType: "purchase_request",
      entityId: request._id,
      before: {
        status: previousStatus,
        rejectionReason: previousRejectionReason,
      },
      after: {
        status: request.status,
        rejectionReason: request.rejectionReason || "",
      },
      metadata: {
        buyerId: request.buyerId,
        listingId: request.listingId,
        quantity: request.quantity,
        companyName: request.companyName,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Purchase request updated successfully",
      request,
    });
  } catch (error) {
    console.error("Review purchase request error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update purchase request",
    });
  }
};

export const getSellerPurchaseRequests = async (req, res) => {
  try {
    const requests = await PurchaseRequest.find()
      .populate("buyerId", "name company")
      .populate({
        path: "listingId",
        match: { sellerId: req.user._id },
        select:
          "category quantity totalQuantity price location complianceYear validTill reservedQuantity sellerId",
      })
      .sort({ createdAt: -1 })
      .lean();

    const sellerRequests = requests
      .filter((request) => request.listingId)
      .map((request) => ({
        _id: request._id,
        buyer: { company: "Verified Buyer" },
        listing: {
          _id: request.listingId._id,
          category: request.listingId.category,
          price: request.listingId.price,
          quantityAvailable: request.listingId.quantity,
          reservedQuantity: request.listingId.reservedQuantity || 0,
          location: request.listingId.location,
          complianceYear: request.listingId.complianceYear,
          validTill: request.listingId.validTill,
        },
        requestedQuantity: request.quantity,
        notes: request.notes || "",
        status: request.status,
        createdAt: request.createdAt,
        rejectionReason: request.rejectionReason || "",
        offer: request.offer || null,
        offerHistory: request.offerHistory || [],
      }));

    return res.status(200).json({
      success: true,
      count: sellerRequests.length,
      requests: sellerRequests,
    });
  } catch (error) {
    console.error("Get seller purchase requests error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch seller purchase requests",
    });
  }
};

export const getBuyerPurchaseRequests = async (req, res) => {
  try {
    const requests = await PurchaseRequest.find({
      buyerId: req.user._id,
    })
      .populate({
        path: "listingId",
        select:
          "category quantity totalQuantity price location complianceYear validTill reservedQuantity",
      })
      .sort({ createdAt: -1 })
      .lean();

    const buyerRequests = requests.map((request) => ({
      _id: request._id,
      listing: request.listingId
        ? {
            _id: request.listingId._id,
            category: request.listingId.category,
            quantity: request.listingId.quantity,
            totalQuantity:
              request.listingId.totalQuantity ?? request.listingId.quantity,
            reservedQuantity: request.listingId.reservedQuantity || 0,
            price: request.listingId.price,
            location: request.listingId.location,
            complianceYear: request.listingId.complianceYear,
            validTill: request.listingId.validTill,
          }
        : null,
      requestedQuantity: request.quantity,
      companyName: request.companyName,
      contactPerson: request.contactPerson,
      notes: request.notes || "",
      status: request.status,
      rejectionReason: request.rejectionReason || "",
      offer: request.offer || null,
      offerHistory: request.offerHistory || [],
      acceptedOfferVersion: request.acceptedOfferVersion || null,
      acceptedOfferSnapshot: request.acceptedOfferSnapshot || null,
      createdAt: request.createdAt,
    }));

    return res.status(200).json({
      success: true,
      count: buyerRequests.length,
      requests: buyerRequests,
    });
  } catch (error) {
    console.error("Get buyer purchase requests error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch buyer purchase requests",
    });
  }
};
