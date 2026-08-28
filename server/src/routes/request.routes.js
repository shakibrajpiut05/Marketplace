import express from "express";

import {
  protect,
} from "../middleware/auth.middleware.js";

import {
  authorize,
} from "../middleware/role.middleware.js";

import {
  createPurchaseRequest,
  getAdminPurchaseRequests,
  reviewPurchaseRequest,
  getSellerPurchaseRequests,
  getBuyerPurchaseRequests,
} from "../controllers/request.controller.js";
import {
  getAdminNegotiations,
  getMessageUnreadCount,
  getNegotiationMessages,
  sendNegotiationMessage,
  setAdminOffer,
  acceptAdminOffer,
} from "../controllers/negotiation.controller.js";

const router = express.Router();

// Buyer creates a request
router.post(
  "/",
  protect,
  authorize("buyer"),
  createPurchaseRequest
);

// Admin views requests
router.get(
  "/admin",
  protect,
  authorize("admin"),
  getAdminPurchaseRequests
);

router.get(
  "/seller",
  protect,
  authorize("seller"),
  getSellerPurchaseRequests
);

router.get(
  "/buyer",
  protect,
  authorize("buyer"),
  getBuyerPurchaseRequests
);

// Admin negotiation center
router.get("/admin/negotiations", protect, authorize("admin"), getAdminNegotiations);
router.get("/messages/unread-count", protect, getMessageUnreadCount);
router.get("/:requestId/messages", protect, getNegotiationMessages);
router.post("/:requestId/messages", protect, sendNegotiationMessage);
router.patch("/admin/:requestId/offer", protect, authorize("admin"), setAdminOffer);
router.post("/:requestId/accept-offer", protect, authorize("buyer"), acceptAdminOffer);

// Admin reviews request
router.patch(
  "/admin/:requestId",
  protect,
  authorize("admin"),
  reviewPurchaseRequest
);

export default router;