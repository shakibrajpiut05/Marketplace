import mongoose from "mongoose";

import PurchaseRequest from "../models/PurchaseRequest.js";
import SellerListing from "../models/SellerListing.js";
import Deal from "../models/Deal.js";
import { notifyDealStatusChange } from "../services/notification.service.js";
import { createActivityLog } from "../services/activityLog.service.js";

export const createPurchaseRequest = async (req, res) => {
  try {
    const {
      listingId,
      quantity,
      contactPerson,
      companyName,
      email,
      gstNumber,
      phone,
      notes,
    } = req.body || {};

    if (req.user.role !== "buyer") {
      return res.status(403).json({
        success: false,
        message: "Only buyers can create purchase requests",
      });
    }

    if (!listingId || !mongoose.Types.ObjectId.isValid(listingId)) {
      return res.status(400).json({
        success: false,
        message: "A valid listingId is required",
      });
    }

    const listing = await SellerListing.findOne({
      _id: listingId,
      status: "active",
      validTill: {
        $gte: new Date(),
      },
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "This credit listing is no longer available",
      });
    }

    const parsedQuantity = Number(quantity);

    if (Number.isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Requested quantity must be a valid positive number",
      });
    }

    if (parsedQuantity > listing.quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${listing.quantity} MT is currently available`,
      });
    }

    if (!contactPerson?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Contact person is required",
      });
    }

    if (!companyName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Company name is required",
      });
    }

    if (!email?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!gstNumber?.trim()) {
      return res.status(400).json({
        success: false,
        message: "GST number is required",
      });
    }

    if (!phone?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    const purchaseRequest = await PurchaseRequest.create({
      buyerId: req.user._id,
      listingId: listing._id,
      quantity: parsedQuantity,
      contactPerson: contactPerson.trim(),
      companyName: companyName.trim(),
      email: email.trim().toLowerCase(),
      gstNumber: gstNumber.trim(),
      phone: phone.trim(),
      notes: notes?.trim() || "",
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Purchase request submitted successfully",
      request: purchaseRequest,
    });
  } catch (error) {
    console.error("Create purchase request error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit purchase request",
    });
  }
};

export const getAdminPurchaseRequests = async (req, res) => {
  try {
    const requests = await PurchaseRequest.find()
      .populate("buyerId", "name company email phone role")
      .populate({
        path: "listingId",
        select:
          "category quantity price location complianceYear validTill sellerId",
        populate: {
          path: "sellerId",
          select: "name company email phone",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get admin purchase requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch purchase requests",
    });
  }
};

export const reviewPurchaseRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, rejectionReason } = req.body || {};

    const allowedStatuses = [
      "reviewing",
      "matched",
      "negotiating",
      "approved",
      "rejected",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request status",
      });
    }

    if (status === "rejected" && !rejectionReason?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const request = await PurchaseRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Purchase request not found",
      });
    }

    const previousStatus = request.status;
    const previousRejectionReason = request.rejectionReason || "";

    request.status = status;

    request.rejectionReason =
      status === "rejected" ? rejectionReason.trim() : "";

    await request.save();

    if (status === "approved") {
      const existingDeal = await Deal.findOne({
        requestId: request._id,
      });

      if (!existingDeal) {
        const listing = await SellerListing.findById(request.listingId).select(
          "sellerId category quantity price location complianceYear validTill",
        );

        if (!listing) {
          return res.status(404).json({
            success: false,
            message: "Listing associated with purchase request not found",
          });
        }

        if (!listing.sellerId) {
          return res.status(400).json({
            success: false,
            message: "Seller information is missing from listing",
          });
        }

        const quantity = Number(request.quantity);
        const agreedPrice = Number(listing.price);
        const commissionRate = 2;

        if (!Number.isFinite(quantity) || quantity <= 0) {
          return res.status(400).json({
            success: false,
            message: "Purchase request has invalid quantity",
          });
        }

        if (!Number.isFinite(agreedPrice) || agreedPrice <= 0) {
          return res.status(400).json({
            success: false,
            message: "Listing has invalid price",
          });
        }

        if (quantity > Number(listing.quantity)) {
          return res.status(400).json({
            success: false,
            message: "Requested quantity exceeds listing quantity",
          });
        }

        const totalValue = quantity * agreedPrice;

        const commissionAmount = (totalValue * commissionRate) / 100;

        const deal = await Deal.create({
          requestId: request._id,
          requirementId: null,
          matchedListingId: listing._id,
          listingId: listing._id,
          buyerId: request.buyerId,
          sellerId: listing.sellerId,
          quantity,
          agreedPrice,
          commissionRate,
          commissionAmount,
          status: "matched",
          paymentStatus: "pending",
          inventoryReserved: false,
          notes: "Created after purchase request approval by EPR Nexus.",
        });

        await notifyDealStatusChange({
          deal,
          status: deal.status,
          paymentStatus: deal.paymentStatus,
          actor: req.user?._id || null,
        });
      }
    }

    await createActivityLog({
      actorId: req.user._id,
      action:
        status === "rejected"
          ? "purchase_request_rejected"
          : "purchase_request_updated",
      entityType: "purchase_request",
      entityId: request._id,
      before: {
        status: previousStatus,
        rejectionReason: previousRejectionReason,
      },
      after: {
        status: request.status,
        rejectionReason: request.rejectionReason || "",
      },
      metadata: {
        buyerId: request.buyerId,
        listingId: request.listingId,
        quantity: request.quantity,
        companyName: request.companyName,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Purchase request updated successfully",
      request,
    });
  } catch (error) {
    console.error("Review purchase request error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update purchase request",
    });
  }
};

export const getSellerPurchaseRequests = async (req, res) => {
  try {
    const requests = await PurchaseRequest.find()
      .populate("buyerId", "name company")
      .populate({
        path: "listingId",
        match: {
          sellerId: req.user._id,
        },
        select:
          "category quantity price location complianceYear validTill sellerId",
      })
      .sort({ createdAt: -1 })
      .lean();

    const sellerRequests = requests
      .filter((request) => request.listingId)
      .map((request) => ({
        _id: request._id,

        buyer: {
          company:
            request.companyName || request.buyerId?.company || "Verified Buyer",
        },

        listing: {
          _id: request.listingId._id,
          category: request.listingId.category,
          price: request.listingId.price,
          quantityAvailable: request.listingId.quantity,
          location: request.listingId.location,
          complianceYear: request.listingId.complianceYear,
          validTill: request.listingId.validTill,
        },

        requestedQuantity: request.quantity,

        notes: request.notes || "",

        status: request.status,

        createdAt: request.createdAt,

        rejectionReason: request.rejectionReason || "",
      }));

    return res.status(200).json({
      success: true,
      count: sellerRequests.length,
      requests: sellerRequests,
    });
  } catch (error) {
    console.error("Get seller purchase requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch seller purchase requests",
    });
  }
};

export const getBuyerPurchaseRequests = async (req, res) => {
  try {
    const requests = await PurchaseRequest.find({
      buyerId: req.user._id,
    })
      .populate({
        path: "listingId",
        select: "category quantity price location complianceYear validTill",
      })
      .sort({ createdAt: -1 })
      .lean();

    const buyerRequests = requests.map((request) => ({
      _id: request._id,

      listing: request.listingId
        ? {
            _id: request.listingId._id,
            category: request.listingId.category,
            quantity: request.listingId.quantity,
            price: request.listingId.price,
            location: request.listingId.location,
            complianceYear: request.listingId.complianceYear,
            validTill: request.listingId.validTill,
          }
        : null,

      requestedQuantity: request.quantity,

      companyName: request.companyName,

      contactPerson: request.contactPerson,

      notes: request.notes || "",

      status: request.status,

      rejectionReason: request.rejectionReason || "",

      createdAt: request.createdAt,
    }));

    return res.status(200).json({
      success: true,
      count: buyerRequests.length,
      requests: buyerRequests,
    });
  } catch (error) {
    console.error("Get buyer purchase requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch buyer purchase requests",
    });
  }
};
