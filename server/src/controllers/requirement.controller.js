import mongoose from "mongoose";
import BuyerRequirement from "../models/BuyerRequirement.js";
import SellerListing from "../models/SellerListing.js";

export const createRequirement = async (req, res) => {
  try {
    const {
      type,
      quantity,
      budget,
      location,
      complianceYear,
      notes,
    } = req.body || {};

    if (req.user.role !== "buyer") {
      return res.status(403).json({
        success: false,
        message: "Only buyers can post requirements",
      });
    }

    if (!type?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Credit type is required",
      });
    }

    const parsedQuantity = Number(quantity);
    const parsedBudget = Number(budget);

    if (
      Number.isNaN(parsedQuantity) ||
      parsedQuantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Required quantity must be a positive number",
      });
    }

    if (
      Number.isNaN(parsedBudget) ||
      parsedBudget <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Budget must be a positive number",
      });
    }

    if (!complianceYear?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Compliance year is required",
      });
    }

    const requirement =
      await BuyerRequirement.create({
        buyerId: req.user._id,
        type: type.trim(),
        quantity: parsedQuantity,
        budget: parsedBudget,
        location: location?.trim() || "",
        complianceYear:
          complianceYear.trim(),
        notes: notes?.trim() || "",
        status: "open",
      });

    return res.status(201).json({
      success: true,
      message:
        "Requirement posted successfully",
      requirement,
    });
  } catch (error) {
    console.error(
      "Create requirement error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create requirement",
    });
  }
};

export const getBuyerRequirements = async (
  req,
  res
) => {
  try {
    const requirements =
      await BuyerRequirement.find({
        buyerId: req.user._id,
      }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requirements.length,
      requirements,
    });
  } catch (error) {
    console.error(
      "Get buyer requirements error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch buyer requirements",
    });
  }
};

export const matchRequirement = async (
  req,
  res
) => {
  try {
    const { requirementId } = req.params;
    const { listingId } = req.body || {};

    if (
      !requirementId ||
      !mongoose.Types.ObjectId.isValid(
        requirementId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid requirementId",
      });
    }

    if (
      !listingId ||
      !mongoose.Types.ObjectId.isValid(
        listingId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid listingId is required",
      });
    }

    const requirement =
      await BuyerRequirement.findById(
        requirementId
      );

    if (!requirement) {
      return res.status(404).json({
        success: false,
        message: "Requirement not found",
      });
    }

    if (requirement.status !== "open") {
      return res.status(400).json({
        success: false,
        message:
          "Only open requirements can be matched",
      });
    }

    const listing =
      await SellerListing.findOne({
        _id: listingId,
        status: "active",
        validTill: {
          $gte: new Date(),
        },
        quantity: {
          $gt: 0,
        },
      }).populate(
        "sellerId",
        "name company verifiedBadge"
      );

    if (!listing) {
      return res.status(404).json({
        success: false,
        message:
          "Selected listing is no longer active or available",
      });
    }

    const sameCategory =
      listing.category?.toLowerCase() ===
      requirement.type?.toLowerCase();

    const withinBudget =
      Number(listing.price) <=
      Number(requirement.budget);

    const sameComplianceYear =
      listing.complianceYear ===
      requirement.complianceYear;

    const sameLocation =
      !requirement.location ||
      requirement.location === "Any Location" ||
      listing.location?.toLowerCase() ===
        requirement.location.toLowerCase();

    if (!sameCategory) {
      return res.status(400).json({
        success: false,
        message:
          "Selected listing credit type does not match the requirement",
      });
    }

    if (!withinBudget) {
      return res.status(400).json({
        success: false,
        message:
          "Selected listing price exceeds the buyer budget",
      });
    }

    if (!sameComplianceYear) {
      return res.status(400).json({
        success: false,
        message:
          "Compliance year does not match",
      });
    }

    if (!sameLocation) {
      return res.status(400).json({
        success: false,
        message:
          "Listing location does not match the requirement",
      });
    }

    requirement.matchedListingId =
      listing._id;

    requirement.status = "matched";

    await requirement.save();

    return res.status(200).json({
      success: true,
      message:
        "Seller listing matched successfully",
      requirement,
      matchedListing: {
        _id: listing._id,
        category: listing.category,
        quantity: listing.quantity,
        price: listing.price,
        location: listing.location,
        complianceYear:
          listing.complianceYear,
        validTill: listing.validTill,
        seller: {
          _id: listing.sellerId?._id,
          company:
            listing.sellerId?.company ||
            listing.sellerId?.name ||
            "Verified Seller",
          verifiedBadge:
            listing.sellerId?.verifiedBadge ||
            false,
        },
      },
    });
  } catch (error) {
    console.error(
      "Match requirement error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to match seller listing",
    });
  }
};