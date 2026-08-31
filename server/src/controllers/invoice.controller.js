import mongoose from "mongoose";
import Invoice from "../models/Invoice.js";
import Deal from "../models/Deal.js";

const isParticipant = (deal, user) =>
  user.role === "admin" ||
  String(deal.buyerId) === String(user._id) ||
  String(deal.sellerId) === String(user._id);

export const getInvoiceForDeal = async (req, res) => {
  try {
    const { dealId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(dealId)) return res.status(400).json({ success: false, message: "A valid dealId is required" });
    const deal = await Deal.findById(dealId).lean();
    if (!deal) return res.status(404).json({ success: false, message: "Deal not found", code: "DEAL_NOT_FOUND" });
    if (!isParticipant(deal, req.user)) return res.status(403).json({ success: false, message: "You are not authorized to view this invoice", code: "FORBIDDEN_DEAL" });

    const invoice = await Invoice.findOne({ dealId })
      .populate("buyerId", "name company email phone")
      .populate("sellerId", "name company email phone")
      .lean();

    return res.json({ success: true, invoice });
  } catch (error) {
    console.error("Get invoice error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch invoice" });
  }
};
