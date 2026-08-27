import User from "../models/User.js";
import UserVerification from "../models/UserVerification.js";
import { createActivityLog } from "../services/activityLog.service.js";
import { createNotifications } from "../services/notification.service.js";

export const getMyVerification = async (req, res) => {
  try {
    const submission = await UserVerification.findOne({
      owner: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      verification: submission,
      user: {
        id: req.user._id,
        name: req.user.name,
        company: req.user.company || "",
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        emailVerified: Boolean(req.user.emailVerified),
        kycStatus: req.user.kycStatus,
        verifiedBadge: Boolean(req.user.verifiedBadge),
      },
    });
  } catch (error) {
    console.error("Get my verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load verification status",
    });
  }
};

export const submitVerification = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "CPCB portal profile screenshot is required",
      });
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "CPCB profile verification must be a JPG, PNG or WEBP screenshot",
      });
    }

    if (!req.user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before submitting verification documents",
      });
    }

    const { companyName } = req.body || {};

    if (!companyName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Business/company name is required",
      });
    }

    if (!req.user.phone?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required before submitting verification",
      });
    }

    const existingPending = await UserVerification.findOne({
      owner: req.user._id,
      status: "pending",
    });

    if (existingPending) {
      return res.status(409).json({
        success: false,
        message: "Your verification is already under review",
      });
    }

    const submission = await UserVerification.create({
      owner: req.user._id,
      companyName: companyName.trim(),
      cpcbProfileFileName: req.file.originalname,
      cpcbProfileFileUrl: `/uploads/documents/${req.file.filename}`,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      status: "pending",
    });

    await User.findByIdAndUpdate(req.user._id, {
      company: companyName.trim(),
      kycStatus: "pending",
      kycRejectionReason: "",
      kycSubmittedAt: new Date(),
      verifiedBadge: false,
    });

    const admins = await User.find({
      role: "admin",
      isActive: true,
    }).select("_id");

    await createNotifications({
      recipients: admins.map((admin) => admin._id),
      actor: req.user._id,
      type: "kyc_submitted",
      title: "New user verification submitted",
      message: `${req.user.name} submitted verification as a ${req.user.role}.`,
      entityType: "kyc",
      entityId: submission._id,
      metadata: {
        role: req.user.role,
        companyName: companyName.trim(),
      },
    });

    await createActivityLog({
      actorId: req.user._id,
      action: "kyc_submitted",
      entityType: "kyc_document",
      entityId: submission._id,
      before: null,
      after: {
        status: submission.status,
        companyName: submission.companyName,
        fileName: submission.cpcbProfileFileName,
      },
      metadata: {
        role: req.user.role,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Verification documents submitted. Please wait for admin approval.",
      verification: submission,
    });
  } catch (error) {
    console.error("Submit verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit verification",
    });
  }
};

export const getPendingVerifications = async (req, res) => {
  try {
    const submissions = await UserVerification.find({
      status: "pending",
    })
      .populate(
        "owner",
        "name company email phone role emailVerified kycStatus verifiedBadge authProvider",
      )
      .sort({ createdAt: -1 });

    const documents = submissions.map((submission) => ({
      _id: submission._id,
      owner: submission.owner,
      type: "cpcb_profile_screenshot",
      fileName: submission.cpcbProfileFileName,
      fileUrl: submission.cpcbProfileFileUrl,
      mimeType: submission.mimeType,
      fileSize: submission.fileSize,
      verificationStatus: submission.status,
      rejectionReason: submission.rejectionReason,
      verifiedBy: submission.reviewedBy,
      verifiedAt: submission.reviewedAt,
      companyName: submission.companyName,
      createdAt: submission.createdAt,
      updatedAt: submission.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (error) {
    console.error("Get pending verifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending user verifications",
    });
  }
};

export const reviewVerification = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { status, rejectionReason } = req.body || {};

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be approved or rejected",
      });
    }

    if (status === "rejected" && !rejectionReason?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const submission = await UserVerification.findById(documentId);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Verification submission not found",
      });
    }

    if (submission.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "This verification submission has already been reviewed",
      });
    }

    const user = await User.findById(submission.owner);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User associated with this verification was not found",
      });
    }

    const previous = {
      status: submission.status,
      rejectionReason: submission.rejectionReason || "",
      userKycStatus: user.kycStatus,
    };

    submission.status = status;
    submission.rejectionReason =
      status === "rejected" ? rejectionReason.trim() : "";
    submission.reviewedBy = req.user._id;
    submission.reviewedAt = new Date();

    await submission.save();

    if (status === "approved") {
      user.kycStatus = "approved";
      user.kycRejectionReason = "";
      user.verifiedBadge = true;
    } else {
      user.kycStatus = "rejected";
      user.kycRejectionReason = submission.rejectionReason || "";
      user.verifiedBadge = false;
    }

    await user.save();

    await createActivityLog({
      actorId: req.user._id,
      action: status === "approved" ? "kyc_approved" : "kyc_rejected",
      entityType: "kyc_document",
      entityId: submission._id,
      before: previous,
      after: {
        status: submission.status,
        rejectionReason: submission.rejectionReason,
        userKycStatus: user.kycStatus,
      },
      metadata: {
        ownerId: user._id,
        role: user.role,
        companyName: submission.companyName,
        fileName: submission.cpcbProfileFileName,
      },
    });

    await createNotifications({
      recipients: [user._id],
      actor: req.user._id,
      type: status === "approved" ? "kyc_approved" : "kyc_rejected",
      title:
        status === "approved"
          ? "Verification approved"
          : "Verification rejected",
      message:
        status === "approved"
          ? "Your EPR Nexus verification has been approved. Full marketplace functionality is now available."
          : `Your verification was rejected. Reason: ${submission.rejectionReason}`,
      entityType: "kyc",
      entityId: submission._id,
      metadata: {
        role: user.role,
        rejectionReason: submission.rejectionReason,
      },
    });

    return res.status(200).json({
      success: true,
      message:
        status === "approved"
          ? "User verification approved successfully"
          : "User verification rejected successfully",
      verification: submission,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        kycStatus: user.kycStatus,
        verifiedBadge: user.verifiedBadge,
      },
    });
  } catch (error) {
    console.error("Review verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to review user verification",
    });
  }
};
