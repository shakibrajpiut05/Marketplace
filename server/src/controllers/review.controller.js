import mongoose from "mongoose";
import Deal from "../models/Deal.js";
import Review from "../models/Review.js";

const validId = (id) => mongoose.Types.ObjectId.isValid(id);

export const createReview = async (req, res) => {
  try {
    const { dealId, rating, comment = "" } = req.body || {};
    if (!validId(dealId)) {
      return res.status(400).json({ success: false, message: "A valid dealId is required" });
    }

    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be a whole number from 1 to 5" });
    }

    const text = String(comment || "").trim();
    if (text.length > 1000) {
      return res.status(400).json({ success: false, message: "Review must be 1000 characters or fewer" });
    }

    const deal = await Deal.findById(dealId).select("buyerId sellerId status").lean();
    if (!deal) return res.status(404).json({ success: false, message: "Deal not found" });
    if (deal.status !== "completed") {
      return res.status(400).json({ success: false, message: "Reviews are available only after a deal is completed" });
    }

    const reviewerId = String(req.user._id);
    const buyerId = String(deal.buyerId);
    const sellerId = String(deal.sellerId);

    if (reviewerId !== buyerId && reviewerId !== sellerId) {
      return res.status(403).json({ success: false, message: "You are not a participant in this deal" });
    }

    const revieweeId = reviewerId === buyerId ? deal.sellerId : deal.buyerId;
    const existing = await Review.findOne({ dealId, reviewerId });
    if (existing) {
      return res.status(409).json({ success: false, message: "You have already reviewed this deal" });
    }

    const review = await Review.create({
      dealId,
      reviewerId,
      revieweeId,
      rating: numericRating,
      comment: text,
    });

    const populated = await Review.findById(review._id)
      .populate("reviewerId", "name company role verifiedBadge")
      .lean();

    return res.status(201).json({ success: true, review: populated });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ success: false, message: "You have already reviewed this deal" });
    }
    console.error("Create review error:", error);
    return res.status(500).json({ success: false, message: "Unable to submit review" });
  }
};

export const getDealReviews = async (req, res) => {
  try {
    const { dealId } = req.params;
    if (!validId(dealId)) return res.status(400).json({ success: false, message: "Invalid dealId" });

    const deal = await Deal.findById(dealId).select("buyerId sellerId").lean();
    if (!deal) return res.status(404).json({ success: false, message: "Deal not found" });

    const userId = String(req.user._id);
    if (userId !== String(deal.buyerId) && userId !== String(deal.sellerId) && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "You are not allowed to view reviews for this deal" });
    }

    const reviews = await Review.find({ dealId })
      .populate("reviewerId", "name company role verifiedBadge")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, reviews });
  } catch (error) {
    console.error("Get deal reviews error:", error);
    return res.status(500).json({ success: false, message: "Unable to load deal reviews" });
  }
};

export const getUserReputation = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!validId(userId)) return res.status(400).json({ success: false, message: "Invalid userId" });

    const reviews = await Review.find({ revieweeId: userId }).select("rating").lean();
    const count = reviews.length;
    const average = count
      ? Number((reviews.reduce((sum, item) => sum + item.rating, 0) / count).toFixed(2))
      : 0;

    return res.json({ success: true, reputation: { averageRating: average, reviewCount: count } });
  } catch (error) {
    console.error("Get reputation error:", error);
    return res.status(500).json({ success: false, message: "Unable to load reputation" });
  }
};
