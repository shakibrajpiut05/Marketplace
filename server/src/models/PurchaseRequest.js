import mongoose from "mongoose";

const purchaseRequestSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SellerListing",
      required: true,
      index: true,
    },

    quantity: {
      type: Number,
      required: [true, "Requested quantity is required"],
      min: [0, "Quantity cannot be negative"],
    },

    contactPerson: {
      type: String,
      required: [true, "Contact person is required"],
      trim: true,
    },

    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },

    gstNumber: {
      type: String,
      required: [true, "GST number is required"],
      trim: true,
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
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
        "pending",
        "reviewing",
        "matched",
        "negotiating",
        "approved",
        "rejected",
        "completed",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },

    rejectionReason: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const PurchaseRequest = mongoose.model(
  "PurchaseRequest",
  purchaseRequestSchema
);

export default PurchaseRequest;