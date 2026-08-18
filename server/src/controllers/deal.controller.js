import mongoose from "mongoose";

import Deal from "../models/Deal.js";
import PurchaseRequest from "../models/PurchaseRequest.js";
import SellerListing from "../models/SellerListing.js";

export const createDeal = async (req, res) => {
  try {
    const {
      requestId,
      agreedPrice,
      commissionRate = 2,
      notes = "",
    } = req.body || {};

    if (
      !requestId ||
      !mongoose.Types.ObjectId.isValid(requestId)
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid requestId is required",
      });
    }

    const request =
      await PurchaseRequest.findById(requestId)
        .populate(
          "buyerId",
          "name company email"
        )
        .populate(
          "listingId",
          "sellerId category quantity price location validTill"
        );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Purchase request not found",
      });
    }

    if (request.status !== "matched") {
      return res.status(400).json({
        success: false,
        message:
          "Only matched purchase requests can be converted into a deal",
      });
    }

    const existingDeal =
      await Deal.findOne({ requestId });

    if (existingDeal) {
      return res.status(409).json({
        success: false,
        message:
          "A deal already exists for this purchase request",
        deal: existingDeal,
      });
    }

    const listing = request.listingId;

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing associated with request not found",
      });
    }

    if (
      !listing.sellerId ||
      !request.buyerId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Buyer or seller information is missing",
      });
    }

    if (
      Number(request.quantity) >
      Number(listing.quantity)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Requested quantity exceeds available listing quantity",
      });
    }

    const price = Number(
      agreedPrice ?? listing.price
    );

    const rate = Number(commissionRate);

    if (
      Number.isNaN(price) ||
      price <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Agreed price must be a valid positive number",
      });
    }

    if (
      Number.isNaN(rate) ||
      rate < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Commission rate must be a valid non-negative number",
      });
    }

    const totalValue =
      Number(request.quantity) * price;

    const commissionAmount =
      (totalValue * rate) / 100;

    const deal = await Deal.create({
      requestId: request._id,
      listingId: listing._id,
      buyerId: request.buyerId._id,
      sellerId: listing.sellerId,
      quantity: request.quantity,
      agreedPrice: price,
      commissionRate: rate,
      commissionAmount,
      status: "matched",
      paymentStatus: "pending",
      notes: notes.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Deal created successfully",
      deal,
    });
  } catch (error) {
    console.error(
      "Create deal error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create deal",
    });
  }
};

export const getAdminDeals = async (req, res) => {
  try {
    const deals = await Deal.find()
      .populate(
        "buyerId",
        "name company email"
      )
      .populate(
        "sellerId",
        "name company email"
      )
      .populate(
        "listingId",
        "category location complianceYear validTill"
      )
      .populate(
        "requestId",
        "quantity status notes createdAt"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: deals.length,
      deals,
    });
  } catch (error) {
    console.error(
      "Get admin deals error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch deals",
    });
  }
};

export const updateDealStatus = async (
  req,
  res
) => {
  try {
    const { dealId } = req.params;
    const { status, paymentStatus } =
      req.body || {};

    const allowedStatuses = [
      "matched",
      "negotiating",
      "terms_agreed",
      "payment_coordination",
      "completed",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid deal status",
      });
    }

    const deal =
      await Deal.findById(dealId);

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: "Deal not found",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Prevent invalid backwards movement
    |--------------------------------------------------------------------------
    */

    const statusOrder = [
      "matched",
      "negotiating",
      "terms_agreed",
      "payment_coordination",
      "completed",
    ];

    if (
      deal.status !== "cancelled" &&
      status !== "cancelled"
    ) {
      const currentIndex =
        statusOrder.indexOf(deal.status);

      const nextIndex =
        statusOrder.indexOf(status);

      if (
        currentIndex !== -1 &&
        nextIndex < currentIndex
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Deal status cannot move backwards",
        });
      }
    }

    deal.status = status;

    if (paymentStatus) {
      const allowedPaymentStatuses = [
        "pending",
        "initiated",
        "received",
        "failed",
      ];

      if (
        !allowedPaymentStatuses.includes(
          paymentStatus
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid payment status",
        });
      }

      deal.paymentStatus =
        paymentStatus;
    }

    if (status === "completed") {
      deal.completedAt = new Date();
    }

    await deal.save();

    /*
    |--------------------------------------------------------------------------
    | Keep PurchaseRequest in sync
    |--------------------------------------------------------------------------
    */

    const request =
      await PurchaseRequest.findById(
        deal.requestId
      );

    if (request) {
      const requestStatusMap = {
        matched: "matched",
        negotiating: "negotiating",
        terms_agreed: "approved",
        payment_coordination: "approved",
        completed: "completed",
        cancelled: "cancelled",
      };

      const nextRequestStatus =
        requestStatusMap[status];

      if (nextRequestStatus) {
        request.status =
          nextRequestStatus;

        await request.save();
      }
    }

    return res.status(200).json({
      success: true,
      message:
        "Deal updated successfully",
      deal,
    });
  } catch (error) {
    console.error(
      "Update deal status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update deal",
    });
  }
};

export const getSellerDeals = async (req, res) => {
  try {
    const deals = await Deal.find({
      sellerId: req.user._id,
    })
      .populate(
        "listingId",
        "category quantity price location complianceYear validTill"
      )
      .populate(
        "requestId",
        "quantity status notes createdAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    const sellerDeals = deals.map((deal) => ({
      _id: deal._id,

      listing: deal.listingId
        ? {
            _id: deal.listingId._id,
            category: deal.listingId.category,
            quantity: deal.listingId.quantity,
            price: deal.listingId.price,
            location: deal.listingId.location,
            complianceYear:
              deal.listingId.complianceYear,
            validTill:
              deal.listingId.validTill,
          }
        : null,

      quantity: deal.quantity,

      agreedPrice: deal.agreedPrice,

      commissionRate:
        deal.commissionRate,

      commissionAmount:
        deal.commissionAmount,

      status: deal.status,

      paymentStatus:
        deal.paymentStatus,

      notes: deal.notes || "",

      createdAt: deal.createdAt,

      completedAt:
        deal.completedAt || null,
    }));

    return res.status(200).json({
      success: true,
      count: sellerDeals.length,
      deals: sellerDeals,
    });
  } catch (error) {
    console.error(
      "Get seller deals error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch seller deals",
    });
  }
};

export const getBuyerDeals = async (
  req,
  res
) => {
  try {
    const deals = await Deal.find({
      buyerId: req.user._id,
    })
      .populate(
        "listingId",
        "category quantity price location complianceYear validTill"
      )
      .sort({ createdAt: -1 })
      .lean();

    const buyerDeals = deals.map((deal) => ({
      _id: deal._id,

      listing: deal.listingId
        ? {
            _id: deal.listingId._id,
            category:
              deal.listingId.category,
            quantity:
              deal.listingId.quantity,
            price:
              deal.listingId.price,
            location:
              deal.listingId.location,
            complianceYear:
              deal.listingId.complianceYear,
            validTill:
              deal.listingId.validTill,
          }
        : null,

      quantity:
        deal.quantity,

      agreedPrice:
        deal.agreedPrice,

      commissionRate:
        deal.commissionRate,

      commissionAmount:
        deal.commissionAmount,

      status:
        deal.status,

      paymentStatus:
        deal.paymentStatus,

      notes:
        deal.notes || "",

      createdAt:
        deal.createdAt,

      completedAt:
        deal.completedAt || null,
    }));

    return res.status(200).json({
      success: true,
      count: buyerDeals.length,
      deals: buyerDeals,
    });
  } catch (error) {
    console.error(
      "Get buyer deals error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch buyer deals",
    });
  }
};