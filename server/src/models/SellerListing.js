import mongoose from "mongoose";

const sellerListingSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    category: {
      type: String,
      required: [true, "Credit type is required"],
      trim: true,
    },

    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },

    complianceYear: {
      type: String,
      required: [true, "Compliance year is required"],
      trim: true,
    },

    validTill: {
      type: Date,
      required: [true, "Valid till date is required"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [
        2000,
        "Description cannot exceed 2000 characters",
      ],
      default: "",
    },

    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },

    status: {
      type: String,
      enum: [
        "pending_review",
        "active",
        "rejected",
        "expired",
        "sold",
      ],
      default: "pending_review",
      index: true,
    },

    rejectionReason: {
      type: String,
      trim: true,
      default: "",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const SellerListing = mongoose.model(
  "SellerListing",
  sellerListingSchema
);

export default SellerListing;