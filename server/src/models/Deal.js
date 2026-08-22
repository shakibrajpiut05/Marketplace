import mongoose from "mongoose";

const dealSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseRequest",
      default: null,
      index: true,
    },

    inventoryReserved: {
      type: Boolean,
      default: false,
      index: true,
    },

    requirementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BuyerRequirement",
      default: null,
      index: true,
    },

    matchedListingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SellerListing",
      default: null,
      index: true,
    },

    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SellerListing",
      required: true,
      index: true,
    },

    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    agreedPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    commissionRate: {
      type: Number,
      default: 0,
      min: 0,
    },

    commissionAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "matched",
        "negotiating",
        "terms_agreed",
        "payment_coordination",
        "completed",
        "cancelled",
      ],
      default: "matched",
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "initiated", "received", "failed"],
      default: "pending",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const Deal = mongoose.model("Deal", dealSchema);

export default Deal;
