import mongoose from "mongoose";

const userVerificationSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      maxlength: 200,
    },

    cpcbProfileFileName: {
      type: String,
      required: true,
      trim: true,
    },

    cpcbProfileFileUrl: {
      type: String,
      required: true,
      trim: true,
    },

    mimeType: {
      type: String,
      required: true,
    },

    fileSize: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    rejectionReason: {
      type: String,
      trim: true,
      default: "",
      maxlength: 1000,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

userVerificationSchema.index({ owner: 1, createdAt: -1 });
userVerificationSchema.index({ status: 1, createdAt: -1 });

const UserVerification = mongoose.model(
  "UserVerification",
  userVerificationSchema,
);

export default UserVerification;
