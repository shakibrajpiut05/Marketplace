import BuyerRequirement from "../models/BuyerRequirement.js";
import SellerListing from "../models/SellerListing.js";

export const getRequirementMatches = async (
  req,
  res
) => {
  try {
    const { requirementId } = req.params;

    const requirement =
      await BuyerRequirement.findById(
        requirementId
      ).lean();

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

    const listings =
      await SellerListing.find({
        status: "active",

        category: {
          $regex: `^${requirement.type}$`,
          $options: "i",
        },

        price: {
          $lte: requirement.budget,
        },

        complianceYear:
          requirement.complianceYear,

        validTill: {
          $gte: new Date(),
        },

        quantity: {
          $gt: 0,
        },
      })
        .populate(
          "sellerId",
          "name company verifiedBadge"
        )
        .sort({
          price: 1,
          quantity: -1,
        })
        .lean();

    const matches = listings.map(
      (listing) => ({
        listingId: listing._id,

        seller: {
          id: listing.sellerId?._id,
          company:
            listing.sellerId?.company ||
            listing.sellerId?.name ||
            "Verified Seller",
          verifiedBadge:
            listing.sellerId?.verifiedBadge ||
            false,
        },

        category:
          listing.category,

        availableQuantity:
          listing.quantity,

        requestedQuantity:
          requirement.quantity,

        price:
          listing.price,

        budget:
          requirement.budget,

        location:
          listing.location,

        complianceYear:
          listing.complianceYear,

        validTill:
          listing.validTill,

        quantityCoverage: Math.min(
          Number(listing.quantity),
          Number(requirement.quantity)
        ),

        fullQuantityMatch:
          Number(listing.quantity) >=
          Number(requirement.quantity),

        priceWithinBudget:
          Number(listing.price) <=
          Number(requirement.budget),

        locationMatch:
          !requirement.location ||
          requirement.location === "Any Location" ||
          listing.location?.toLowerCase() ===
            requirement.location.toLowerCase(),
      })
    );

    return res.status(200).json({
      success: true,
      requirement,
      count: matches.length,
      matches,
    });
  } catch (error) {
    console.error(
      "Requirement matching error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to find matching listings",
    });
  }
};