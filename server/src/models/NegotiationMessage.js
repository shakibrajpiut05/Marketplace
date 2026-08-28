import mongoose from "mongoose";

const negotiationMessageSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseRequest",
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    senderRole: {
      type: String,
      enum: ["buyer", "seller", "admin"],
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    visibleToRoles: [{
      type: String,
      enum: ["buyer", "seller", "admin"],
    }],
    readBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
  },
  { timestamps: true },
);

negotiationMessageSchema.index({ requestId: 1, createdAt: 1 });

export default mongoose.model("NegotiationMessage", negotiationMessageSchema);
