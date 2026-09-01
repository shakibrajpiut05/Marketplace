import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import mongoose from "mongoose";
import Document from "../models/Document.js";
import User from "../models/User.js";
import { createActivityLog } from "../services/activityLog.service.js";

export const uploadKycDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Document file is required",
      });
    }

    const { type } = req.body;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Document type is required",
      });
    }

    const allowedTypes = [
      "gst_certificate",
      "company_registration",
      "authorization",
      "other",
    ];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid document type",
      });
    }

    const fileUrl = `/uploads/documents/${req.file.filename}`;

    const document = await Document.create({
      owner: req.user._id,
      type,
      fileName: req.file.originalname,
      fileUrl,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      verificationStatus: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      document,
    });
  } catch (error) {
    console.error("Document upload error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to upload document",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get pending KYC documents
|--------------------------------------------------------------------------
*/

export const getPendingKycDocuments = async (
  req,
  res
) => {
  try {
    const documents = await Document.find({
      verificationStatus: "pending",
    })
      .populate(
        "owner",
        "name company email phone role kycStatus verifiedBadge"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (error) {
    console.error(
      "Get pending KYC error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending KYC documents",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Verify / reject KYC document
|--------------------------------------------------------------------------
*/

export const reviewKycDocument = async (
  req,
  res
) => {
  try {
    const { documentId } = req.params;
    const {
      status,
      rejectionReason,
    } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be approved or rejected",
      });
    }

    if (
      status === "rejected" &&
      !rejectionReason?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Rejection reason is required",
      });
    }

    const document =
      await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    if (
      document.verificationStatus !== "pending"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This document has already been reviewed",
      });
    }

    const previousStatus =
      document.verificationStatus;

    const previousRejectionReason =
      document.rejectionReason || "";

    document.verificationStatus = status;

    document.rejectionReason =
      status === "rejected"
        ? rejectionReason.trim()
        : "";

    document.verifiedBy = req.user._id;
    document.verifiedAt = new Date();

    await document.save();

    /*
    |--------------------------------------------------------------------------
    | Update user KYC status
    |--------------------------------------------------------------------------
    */

    const userId = document.owner;

    let userKycStatusAfter = null;
    let userVerifiedBadgeAfter = null;

    if (status === "approved") {
      const rejectedDocuments =
        await Document.countDocuments({
          owner: userId,
          verificationStatus: "rejected",
        });

      if (rejectedDocuments === 0) {
        const updatedUser =
          await User.findByIdAndUpdate(
            userId,
            {
              kycStatus: "approved",
              verifiedBadge: true,
            },
            { new: true }
          ).select("kycStatus verifiedBadge");

        userKycStatusAfter =
          updatedUser?.kycStatus || "approved";

        userVerifiedBadgeAfter =
          Boolean(updatedUser?.verifiedBadge);
      }
    } else {
      const updatedUser =
        await User.findByIdAndUpdate(
          userId,
          {
            kycStatus: "rejected",
            verifiedBadge: false,
          },
          { new: true }
        ).select("kycStatus verifiedBadge");

      userKycStatusAfter =
        updatedUser?.kycStatus || "rejected";

      userVerifiedBadgeAfter =
        Boolean(updatedUser?.verifiedBadge);
    }

    await createActivityLog({
      actorId: req.user._id,
      action:
        status === "approved"
          ? "kyc_approved"
          : "kyc_rejected",
      entityType: "kyc_document",
      entityId: document._id,
      before: {
        verificationStatus: previousStatus,
        rejectionReason: previousRejectionReason,
      },
      after: {
        verificationStatus: document.verificationStatus,
        rejectionReason:
          document.rejectionReason || "",
        userKycStatus: userKycStatusAfter,
        userVerifiedBadge: userVerifiedBadgeAfter,
      },
      metadata: {
        ownerId: document.owner,
        documentType: document.type,
        fileName: document.fileName,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Document ${status} successfully`,
      document,
    });
  } catch (error) {
    console.error(
      "Review KYC error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to review KYC document",
    });
  }
};


/*
|--------------------------------------------------------------------------
| Secure document download
|--------------------------------------------------------------------------
|
| Documents are private. Only the document owner or an admin can download
| a document through this endpoint. Dispute evidence has its own route so
| both participants can access evidence attached to their shared dispute.
|
*/

export const downloadDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid document ID",
      });
    }

    const document = await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    const isOwner = String(document.owner) === String(req.user._id);
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this document",
      });
    }

    const uploadsRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../uploads/documents");
    const requestedPath = path.resolve(uploadsRoot, path.basename(document.fileUrl || ""));

    if (!requestedPath.startsWith(`${uploadsRoot}${path.sep}`)) {
      return res.status(400).json({
        success: false,
        message: "Invalid document path",
      });
    }

    if (!fs.existsSync(requestedPath)) {
      return res.status(404).json({
        success: false,
        message: "Document file is no longer available",
      });
    }

    res.setHeader("Content-Type", document.mimeType || "application/octet-stream");
    res.setHeader("Content-Disposition", `inline; filename="${String(document.fileName || "document").replace(/[\"\r\n]/g, "_")}"`);
    res.setHeader("Cache-Control", "private, no-store");

    return res.sendFile(requestedPath);
  } catch (error) {
    console.error("Secure document download error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to download document",
    });
  }
};
