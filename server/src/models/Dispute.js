import mongoose from "mongoose";

const evidenceSchema = new mongoose.Schema(
  {
    note: { type: String, trim: true, maxlength: 3000 },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      default: null,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const disputeSchema = new mongoose.Schema(
  {
    dealId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deal",
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
    openedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    openedByRole: {
      type: String,
      enum: ["buyer", "seller"],
      required: true,
    },
    reason: {
      type: String,
      enum: [
        "payment",
        "quantity",
        "quality_or_compliance",
        "delivery_or_transfer",
        "documentation",
        "communication",
        "other",
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 5000,
    },
    evidence: { type: [evidenceSchema], default: [] },
    status: {
      type: String,
      enum: [
        "open",
        "under_review",
        "waiting_buyer",
        "waiting_seller",
        "escalated",
        "resolved",
        "rejected",
      ],
      default: "open",
      index: true,
    },
    resolution: {
      type: String,
      trim: true,
      default: "",
      maxlength: 5000,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    resolvedAt: { type: Date, default: null },
    lastRespondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    lastRespondedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

disputeSchema.index({ dealId: 1, status: 1 });
disputeSchema.index(
  { dealId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["open", "under_review", "waiting_buyer", "waiting_seller", "escalated"] },
    },
  },
);
disputeSchema.index({ buyerId: 1, status: 1, createdAt: -1 });
disputeSchema.index({ sellerId: 1, status: 1, createdAt: -1 });

export default mongoose.model("Dispute", disputeSchema);
