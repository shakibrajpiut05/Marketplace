import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    type: {
      type: String,
      enum: [
        "requirement_created",
        "requirement_matched",
        "deal_created",
        "deal_status_changed",
        "payment_initiated",
        "payment_received",
        "deal_completed",
        "deal_cancelled",
        "listing_submitted",
        "listing_approved",
        "listing_rejected",
        "kyc_approved",
        "kyc_rejected",
        "negotiation_message",
        "offer_updated",
        "offer_accepted",
        "purchase_request_created",
        "quotation_sent",
        "requirement_match_found",
      ],
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    entityType: {
      type: String,
      enum: ["requirement", "deal", "listing", "request", "kyc", null],
      default: null,
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    read: {
      type: Boolean,
      default: false,
      index: true,
    },

    readAt: {
      type: Date,
      default: null,
    },

    dedupeKey: {
      type: String,
      default: null,
      sparse: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ dedupeKey: 1 }, { unique: true, sparse: true });

const Notification = mongoose.model(
  "Notification",
  notificationSchema,
);

export default Notification;