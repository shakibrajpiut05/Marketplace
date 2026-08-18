import path from "path";

import Document from "../models/Document.js";
import User from "../models/User.js";

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

    if (status === "approved") {
      const rejectedDocuments =
        await Document.countDocuments({
          owner: userId,
          verificationStatus: "rejected",
        });

      if (rejectedDocuments === 0) {
        await User.findByIdAndUpdate(
          userId,
          {
            kycStatus: "approved",
            verifiedBadge: true,
          },
          { new: true }
        );
      }
    } else {
      await User.findByIdAndUpdate(
        userId,
        {
          kycStatus: "rejected",
          verifiedBadge: false,
        },
        { new: true }
      );
    }

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