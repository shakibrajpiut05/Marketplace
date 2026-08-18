import mongoose from "mongoose";

const buyerRequirementSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      required: [true, "Credit type is required"],
      trim: true,
    },

    quantity: {
      type: Number,
      required: [true, "Required quantity is required"],
      min: [0, "Quantity cannot be negative"],
    },

    budget: {
      type: Number,
      required: [true, "Budget is required"],
      min: [0, "Budget cannot be negative"],
    },

    location: {
      type: String,
      trim: true,
      default: "",
    },

    matchedListingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SellerListing",
      default: null,
    },

    complianceYear: {
      type: String,
      required: [true, "Compliance year is required"],
      trim: true,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: [
        2000,
        "Notes cannot exceed 2000 characters",
      ],
    },

    status: {
      type: String,
      enum: [
        "open",
        "matching",
        "matched",
        "closed",
        "cancelled",
      ],
      default: "open",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

const BuyerRequirement = mongoose.model(
  "BuyerRequirement",
  buyerRequirementSchema,
);

export default BuyerRequirement;