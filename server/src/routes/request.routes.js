import express from "express";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

import {
  getNegotiationMessages,
  sendNegotiationMessage,
  getMessageUnreadCount,
  getAdminNegotiations,
} from "../controllers/negotiation.controller.js";

import {
  createPurchaseRequest,
  getAdminPurchaseRequests,
  reviewPurchaseRequest,
  getSellerPurchaseRequests,
  getBuyerPurchaseRequests,
  issuePurchaseRequestOffer,
  acceptPurchaseRequestOffer,
} from "../controllers/request.controller.js";

const router = express.Router();

/*
 * Buyer
 */
router.post(
  "/",
  protect,
  authorize("buyer"),
  createPurchaseRequest,
);

router.get(
  "/buyer",
  protect,
  authorize("buyer"),
  getBuyerPurchaseRequests,
);

router.post(
  "/:requestId/offer/accept",
  protect,
  authorize("buyer"),
  acceptPurchaseRequestOffer,
);

router.get(
  "/messages/unread-count",
  protect,
  getMessageUnreadCount,
);

router.get(
  "/admin/negotiations",
  protect,
  authorize("admin"),
  getAdminNegotiations,
);

router.get(
  "/:requestId/messages",
  protect,
  getNegotiationMessages,
);

router.post(
  "/:requestId/messages",
  protect,
  sendNegotiationMessage,
);

/*
 * Admin
 */
router.get(
  "/admin",
  protect,
  authorize("admin"),
  getAdminPurchaseRequests,
);

router.patch(
  "/admin/:requestId/review",
  protect,
  authorize("admin"),
  reviewPurchaseRequest,
);

router.post(
  "/admin/:requestId/offer",
  protect,
  authorize("admin"),
  issuePurchaseRequestOffer,
);

/*
 * Seller
 */
router.get(
  "/seller",
  protect,
  authorize("seller"),
  getSellerPurchaseRequests,
);

export default router;
