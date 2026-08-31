import mongoose from "mongoose";
import BuyerRequirement from "../models/BuyerRequirement.js";
import { findMatchingListings } from "../services/matching.service.js";

export const getRequirementMatches = async (req, res) => {
  try {
    const { requirementId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(requirementId)) return res.status(400).json({ success: false, message: "Invalid requirementId" });

    const requirement = await BuyerRequirement.findById(requirementId).lean();
    if (!requirement) return res.status(404).json({ success: false, message: "Requirement not found" });

    const allowed = req.user.role === "admin" || (req.user.role === "buyer" && String(requirement.buyerId) === String(req.user._id));
    if (!allowed) return res.status(403).json({ success: false, message: "You are not allowed to view matches for this requirement" });

    if (!["open", "matching", "partially_matched"].includes(requirement.status)) {
      return res.status(200).json({ success: true, requirement, count: 0, matches: [], message: "This requirement is no longer actively seeking matches" });
    }

    const scoredMatches = await findMatchingListings(requirement, { minimumScore: 60 });
    const remaining = Number(requirement.remainingQuantity || requirement.quantity || 0);
    const matches = scoredMatches.map((match) => ({
      listingId: match.listing._id,
      seller: { id: match.listing.sellerId?._id, company: match.listing.sellerId?.company || match.listing.sellerId?.name || "Verified Seller", verifiedBadge: Boolean(match.listing.sellerId?.verifiedBadge) },
      category: match.listing.category, availableQuantity: match.availableQuantity, requestedQuantity: remaining, price: match.listing.price, budget: Number(requirement.budget || 0), location: match.listing.location, complianceYear: match.listing.complianceYear, validTill: match.listing.validTill, matchScore: match.score, quantityCoverage: Math.min(match.availableQuantity, remaining), fullQuantityMatch: match.availableQuantity >= remaining, priceWithinBudget: match.budgetMatch, locationMatch: match.locationMatch, reasons: match.reasons,
    }));

    return res.status(200).json({ success: true, requirement, count: matches.length, matches });
  } catch (error) {
    console.error("Requirement matching error:", error);
    return res.status(500).json({ success: false, message: "Failed to find matching listings" });
  }
};
