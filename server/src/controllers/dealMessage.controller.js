import mongoose from "mongoose";

import Deal from "../models/Deal.js";
import PurchaseRequest from "../models/PurchaseRequest.js";
import NegotiationMessage from "../models/NegotiationMessage.js";
import User from "../models/User.js";

import { createNotification } from "../services/notification.service.js";
import { createActivityLog } from "../services/activityLog.service.js";

const isObjectId = (value) =>
  mongoose.Types.ObjectId.isValid(value);

const sanitizeMessage = (value) =>
  String(value || "")
    .replace(/\s+/g, " ")
    .trim();

/*
|--------------------------------------------------------------------------
| Contact-information protection
|--------------------------------------------------------------------------
| Buyers and sellers communicate through EPR Nexus.
| Direct contact details are therefore blocked.
|--------------------------------------------------------------------------
*/

const contactPatterns = [
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,

  /@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,

  /\b(?:gmail|yahoo|outlook|hotmail|icloud|protonmail)\s*\.(?:com|in|co|net|org)\b/i,

  /(?<!\d)(?:\+?\d[\d\s().-]{6,}\d)(?!\d)/,

  /\b(?:call|text|sms|message|contact|reach|whatsapp|wa|telegram|signal|instagram|insta|linkedin)\b.{0,40}\b(?:me|us|my|number|phone|mobile|email|mail|id|handle|profile)\b/i,

  /\b(?:my|our)\s+(?:phone|mobile|contact|email|mail|whatsapp|telegram|instagram|linkedin)\b/i,

  /\b(?:phone|mobile|contact)\s*(?:number|no\.?|num)\s*(?:is|:)?\b/i,

  /\b(?:email|e-mail|mail)\s*(?:is|:)?\b/i,

  /@[A-Z0-9_]{3,}\b/i,
];

const containsDirectContact = (message) =>
  contactPatterns.some((pattern) =>
    pattern.test(message),
  );

/*
|--------------------------------------------------------------------------
| Deal access
|--------------------------------------------------------------------------
*/

const buildDealAccessFilter = (dealId, user) => {
  const filter = {
    _id: dealId,
  };

  if (user.role === "buyer") {
    filter.buyerId = user._id;
  }

  if (user.role === "seller") {
    filter.sellerId = user._id;
  }

  return filter;
};

const getDealForUser = async (dealId, user) => {
  if (!isObjectId(dealId)) {
    return null;
  }

  return Deal.findOne(
    buildDealAccessFilter(dealId, user),
  )
    .populate(
      "buyerId",
      "name company role",
    )
    .populate(
      "sellerId",
      "name company role",
    )
    .populate(
      "listingId",
      "category quantity totalQuantity price location complianceYear validTill",
    );
};

/*
|--------------------------------------------------------------------------
| GET /api/deal-messages
|--------------------------------------------------------------------------
| Returns deal/message threads available to the current user.
|
| Buyer  -> own deals
| Seller -> own deals
| Admin  -> all deals
|--------------------------------------------------------------------------
*/

export const getMessageThreads = async (
  req,
  res,
) => {
  try {
    const dealFilter = {};

    if (req.user.role === "buyer") {
      dealFilter.buyerId = req.user._id;
    }

    if (req.user.role === "seller") {
      dealFilter.sellerId = req.user._id;
    }

    const deals = await Deal.find(dealFilter)
      .populate(
        "buyerId",
        "name company",
      )
      .populate(
        "sellerId",
        "name company",
      )
      .populate(
        "listingId",
        "category quantity price location complianceYear",
      )
      .sort({
        createdAt: -1,
      })
      .lean();

    const dealsWithRequest = deals.filter(
      (deal) => deal.requestId,
    );

    const requestIds = dealsWithRequest.map(
      (deal) => deal.requestId,
    );

    let lastMessages = [];

    if (requestIds.length) {
      lastMessages =
        await NegotiationMessage.aggregate([
          {
            $match: {
              requestId: {
                $in: requestIds,
              },
              visibleToRoles: req.user.role,
            },
          },

          {
            $sort: {
              createdAt: -1,
            },
          },

          {
            $group: {
              _id: "$requestId",

              message: {
                $first: "$message",
              },

              createdAt: {
                $first: "$createdAt",
              },

              senderId: {
                $first: "$senderId",
              },

              senderRole: {
                $first: "$senderRole",
              },
            },
          },
        ]);
    }

    const latestByRequest = new Map(
      lastMessages.map((item) => [
        String(item._id),
        item,
      ]),
    );

    const threads = deals.map((deal) => ({
      dealId: deal._id,

      requestId:
        deal.requestId || null,

      status: deal.status,

      paymentStatus:
        deal.paymentStatus || "pending",

      category:
        deal.listingId?.category ||
        "EPR Credit",

      quantity: deal.quantity,

      buyer: {
        name:
          deal.buyerId?.name ||
          "Buyer",

        company:
          deal.buyerId?.company ||
          "",
      },

      seller: {
        name:
          deal.sellerId?.name ||
          "Seller",

        company:
          deal.sellerId?.company ||
          "",
      },

      latestMessage: deal.requestId
        ? latestByRequest.get(
            String(deal.requestId),
          ) || null
        : null,
    }));

    return res.status(200).json({
      success: true,

      count: threads.length,

      threads,
    });
  } catch (error) {
    console.error(
      "Get message threads error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch message threads",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET /api/deal-messages/unread-count
|--------------------------------------------------------------------------
|
| NegotiationMessage uses:
|
| readBy: [userId]
|
| It does NOT use recipientId/readAt.
|
|--------------------------------------------------------------------------
*/

export const getUnreadMessageCount = async (
  req,
  res,
) => {
  try {
    // Scope unread messages to requests the current user actually belongs to.
    // visibleToRoles alone is not an ownership check: a buyer/seller role can
    // be present on many messages belonging to other transactions.
    let requestIds = null;

    if (req.user.role === "buyer") {
      requestIds = await PurchaseRequest.find({ buyerId: req.user._id })
        .select("_id")
        .lean()
        .then((items) => items.map((item) => item._id));
    } else if (req.user.role === "seller") {
      requestIds = await PurchaseRequest.find({ sellerId: req.user._id })
        .select("_id")
        .lean()
        .then((items) => items.map((item) => item._id));
    }

    const baseMatch = {
      visibleToRoles: req.user.role,
      senderId: { $ne: req.user._id },
      readBy: { $ne: req.user._id },
    };

    if (requestIds) {
      baseMatch.requestId = { $in: requestIds };
    }

    const unreadCount = await NegotiationMessage.countDocuments(baseMatch);

    const unreadByRequest = await NegotiationMessage.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: "$requestId",
          count: { $sum: 1 },
        },
      },
    ]);

    const byRequest = {};

    unreadByRequest.forEach((item) => {
      byRequest[String(item._id)] =
        item.count;
    });

    return res.status(200).json({
      success: true,

      unreadCount,

      byRequest,
    });
  } catch (error) {
    console.error(
      "Get unread message count error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch unread message count",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET /api/deal-messages/deal/:dealId
|--------------------------------------------------------------------------
|
| Converts dealId -> requestId because the existing
| NegotiationMessage model stores requestId.
|
| Buyer:
|   sees buyer + admin messages
|
| Seller:
|   sees seller + admin messages
|
| Admin:
|   sees the complete mediation thread
|--------------------------------------------------------------------------
*/

export const getDealMessages = async (
  req,
  res,
) => {
  try {
    const { dealId } = req.params;

    if (!isObjectId(dealId)) {
      return res.status(400).json({
        success: false,

        message: "Invalid dealId",
      });
    }

    const deal = await getDealForUser(
      dealId,
      req.user,
    );

    if (!deal) {
      return res.status(404).json({
        success: false,

        message:
          "Deal not found or access denied",
      });
    }

    if (!deal.requestId) {
      return res.status(400).json({
        success: false,

        message:
          "This deal does not have an associated purchase request",
      });
    }

    const messages =
      await NegotiationMessage.find({
        requestId: deal.requestId,

        visibleToRoles:
          req.user.role,
      })
        .populate(
          "senderId",
          "name company role",
        )
        .sort({
          createdAt: 1,
        })
        .lean();

    // Opening the thread means the user has viewed it. Mark only incoming
    // messages as read; the user's own messages must never create an unread badge.
    await NegotiationMessage.updateMany(
      {
        requestId: deal.requestId,
        visibleToRoles: req.user.role,
        senderId: { $ne: req.user._id },
        readBy: { $ne: req.user._id },
      },
      {
        $addToSet: { readBy: req.user._id },
      },
    );

    return res.status(200).json({
      success: true,

      count: messages.length,

      deal: {
        _id: deal._id,

        requestId:
          deal.requestId,

        status: deal.status,

        paymentStatus:
          deal.paymentStatus,

        category:
          deal.listingId?.category ||
          "EPR Credit",

        quantity: deal.quantity,
      },

      messages,
    });
  } catch (error) {
    console.error(
      "Get deal messages error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch deal messages",
    });
  }
};

/*
|--------------------------------------------------------------------------
| POST /api/deal-messages/deal/:dealId
|--------------------------------------------------------------------------
|
| Buyer/seller:
|   message -> EPR Nexus
|
| Admin:
|   recipientRole = buyer/seller
|
| Because NegotiationMessage does not contain recipientId,
| visibility is controlled with visibleToRoles.
|--------------------------------------------------------------------------
*/

export const createDealMessage = async (
  req,
  res,
) => {
  try {
    const { dealId } = req.params;

    const message = sanitizeMessage(
      req.body?.message,
    );

    if (!isObjectId(dealId)) {
      return res.status(400).json({
        success: false,

        message: "Invalid dealId",
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,

        message: "Message is required",
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({
        success: false,

        message:
          "Message cannot exceed 2000 characters",
      });
    }

    if (containsDirectContact(message)) {
      return res.status(400).json({
        success: false,

        message:
          "For privacy and transaction security, direct contact details cannot be shared in messages. Phone numbers, email addresses, social handles, and requests to contact someone outside EPR Nexus are blocked.",
      });
    }

    const deal = await Deal.findById(
      dealId,
    )
      .populate(
        "buyerId",
        "name company role",
      )
      .populate(
        "sellerId",
        "name company role",
      )
      .populate(
        "listingId",
        "category quantity",
      );

    if (!deal) {
      return res.status(404).json({
        success: false,

        message: "Deal not found",
      });
    }

    if (!deal.requestId) {
      return res.status(400).json({
        success: false,

        message:
          "This deal does not have an associated purchase request",
      });
    }

    let recipientId = null;

    let recipientRole = null;

    let visibleToRoles = [];

    /*
     * Buyer -> Admin
     */

    if (req.user.role === "buyer") {
      if (
        String(deal.buyerId?._id) !==
        String(req.user._id)
      ) {
        return res.status(403).json({
          success: false,

          message:
            "You do not have access to this deal",
        });
      }

      recipientRole = "admin";

      visibleToRoles = [
        "buyer",
        "admin",
      ];

      const admin =
        await User.findOne({
          role: "admin",

          isActive: true,
        }).select("_id");

      recipientId =
        admin?._id || null;

      if (!recipientId) {
        return res.status(503).json({
          success: false,

          message:
            "EPR Nexus support is currently unavailable",
        });
      }
    }

    /*
     * Seller -> Admin
     */

    else if (
      req.user.role === "seller"
    ) {
      if (
        String(deal.sellerId?._id) !==
        String(req.user._id)
      ) {
        return res.status(403).json({
          success: false,

          message:
            "You do not have access to this deal",
        });
      }

      recipientRole = "admin";

      visibleToRoles = [
        "seller",
        "admin",
      ];

      const admin =
        await User.findOne({
          role: "admin",

          isActive: true,
        }).select("_id");

      recipientId =
        admin?._id || null;

      if (!recipientId) {
        return res.status(503).json({
          success: false,

          message:
            "EPR Nexus support is currently unavailable",
        });
      }
    }

    /*
     * Admin -> Buyer/Seller
     */

    else if (
      req.user.role === "admin"
    ) {
      const targetRole =
        String(
          req.body?.recipientRole ||
            "",
        ).toLowerCase();

      if (
        !["buyer", "seller"].includes(
          targetRole,
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "recipientRole must be buyer or seller",
        });
      }

      recipientRole =
        targetRole;

      visibleToRoles = [
        "admin",
        targetRole,
      ];

      recipientId =
        targetRole === "buyer"
          ? deal.buyerId?._id
          : deal.sellerId?._id;

      if (!recipientId) {
        return res.status(400).json({
          success: false,

          message:
            "Target participant could not be determined",
        });
      }
    }

    /*
     * Everything else
     */

    else {
      return res.status(403).json({
        success: false,

        message:
          "You are not authorized to send deal messages",
      });
    }

    const createdMessage =
      await NegotiationMessage.create({
        requestId:
          deal.requestId,

        senderId:
          req.user._id,

        senderRole:
          req.user.role,

        message,

        visibleToRoles,
      });

    const populatedMessage =
      await NegotiationMessage.findById(
        createdMessage._id,
      )
        .populate(
          "senderId",
          "name company role",
        )
        .lean();

    /*
     * Notify the actual target participant.
     */

    await createNotification({
      recipient: recipientId,

      actor: req.user._id,

      type: "deal_message",

      title:
        req.user.role === "admin"
          ? "EPR Nexus sent a deal update"
          : "New message sent to EPR Nexus",

      message:
        req.user.role === "admin"
          ? `EPR Nexus sent an update for your ${
              deal.listingId?.category ||
              "EPR credit"
            } deal (${deal.quantity} MT).`
          : `Your message for deal #${String(
              deal._id,
            ).slice(-6)} was sent to EPR Nexus.`,

      entityType: "deal",

      entityId:
        deal._id,

      metadata: {
        dealId:
          deal._id,

        requestId:
          deal.requestId,

        recipientRole,

        senderRole:
          req.user.role,
      },
    });

    /*
     * Audit log
     */

    await createActivityLog({
      actorId:
        req.user._id,

      action:
        "deal_message_created",

      entityType:
        "deal",

      entityId:
        deal._id,

      before: null,

      after: {
        senderRole:
          req.user.role,

        recipientRole,

        messageId:
          createdMessage._id,

        requestId:
          deal.requestId,
      },

      metadata: {
        category:
          deal.listingId?.category ||
          "EPR credit",

        quantity:
          deal.quantity,
      },
    });

    return res.status(201).json({
      success: true,

      message:
        "Message sent through EPR Nexus",

      data:
        populatedMessage,
    });
  } catch (error) {
    console.error(
      "Create deal message error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to send message",
    });
  }
};

/*
|--------------------------------------------------------------------------
| PATCH /api/deal-messages/:messageId/read
|--------------------------------------------------------------------------
|
| NegotiationMessage uses readBy[] instead of readAt.
|--------------------------------------------------------------------------
*/

export const markDealMessageRead = async (
  req,
  res,
) => {
  try {
    const { messageId } =
      req.params;

    if (!isObjectId(messageId)) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid messageId",
      });
    }

    const message = await NegotiationMessage.findOne({
      _id: messageId,
      visibleToRoles: req.user.role,
    })
      .select("requestId")
      .lean();

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found or access denied",
      });
    }

    const dealFilter = { requestId: message.requestId };
    if (req.user.role === "buyer") dealFilter.buyerId = req.user._id;
    if (req.user.role === "seller") dealFilter.sellerId = req.user._id;

    const hasAccess = await Deal.exists(dealFilter);
    if (!hasAccess && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this deal message",
      });
    }

    const updated = await NegotiationMessage.findOneAndUpdate(
      {
        _id: messageId,
        visibleToRoles: req.user.role,
      },
      {
        $addToSet: { readBy: req.user._id },
      },
      { new: true },
    );

    if (!updated) {
      return res.status(404).json({
        success: false,

        message:
          "Message not found or access denied",
      });
    }

    return res.status(200).json({
      success: true,

      message:
        "Message marked as read",
    });
  } catch (error) {
    console.error(
      "Mark deal message read error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to mark message as read",
    });
  }
};

/*
|--------------------------------------------------------------------------
| PATCH /api/deal-messages/read-all
|--------------------------------------------------------------------------
*/

export const markAllDealMessagesRead = async (
  req,
  res,
) => {
  try {
    const dealFilter = {};
    if (req.user.role === "buyer") dealFilter.buyerId = req.user._id;
    if (req.user.role === "seller") dealFilter.sellerId = req.user._id;

    const deals = await Deal.find(dealFilter).select("requestId").lean();
    const requestIds = deals.map((deal) => deal.requestId).filter(Boolean);

    if (!requestIds.length && req.user.role !== "admin") {
      return res.status(200).json({ success: true, modifiedCount: 0 });
    }

    const messageFilter = {
      visibleToRoles: req.user.role,
      readBy: { $ne: req.user._id },
    };

    if (req.user.role !== "admin") {
      messageFilter.requestId = { $in: requestIds };
    }

    const result = await NegotiationMessage.updateMany(
      messageFilter,
      { $addToSet: { readBy: req.user._id } },
    );

    return res.status(200).json({
      success: true,

      modifiedCount:
        result.modifiedCount,
    });
  } catch (error) {
    console.error(
      "Mark all deal messages read error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to mark messages as read",
    });
  }
};