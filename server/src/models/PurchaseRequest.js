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
        "offer_sent",
        "offer_accepted",
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

    // Commercial terms are controlled by EPR Nexus per request.
    offer: {
      creditPricePerUnit: { type: Number, default: null, min: 0 },
      creditSubtotal: { type: Number, default: null, min: 0 },
      serviceFee: { type: Number, default: null, min: 0 },
      finalAmount: { type: Number, default: null, min: 0 },
      currency: { type: String, default: "INR" },
      version: { type: Number, default: 0, min: 0 },
      sentAt: { type: Date, default: null },
      acceptedAt: { type: Date, default: null },
      expiresAt: { type: Date, default: null },
      lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
      note: { type: String, trim: true, default: "" },
    },

    // Immutable record of every quotation issued by EPR Nexus.
    // Buyers never create quotation versions themselves; only Admin does.
    offerHistory: [
      {
        version: { type: Number, required: true, min: 1 },
        creditPricePerUnit: { type: Number, required: true, min: 0 },
        creditSubtotal: { type: Number, required: true, min: 0 },
        serviceFee: { type: Number, required: true, min: 0 },
        finalAmount: { type: Number, required: true, min: 0 },
        currency: { type: String, default: "INR" },
        sentAt: { type: Date, required: true },
        expiresAt: { type: Date, default: null },
        note: { type: String, trim: true, default: "" },
        issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        acceptedAt: { type: Date, default: null },
      },
    ],
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