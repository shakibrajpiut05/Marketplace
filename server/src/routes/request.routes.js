import express from "express";

import {
  protect,
} from "../middleware/auth.middleware.js";
import { requireVerifiedUser } from "../middleware/verifiedUser.middleware.js";

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

const router = express.Router();

// Buyer creates a request
router.post(
  "/",
  protect,
  requireVerifiedUser,
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

// Admin reviews request
router.patch(
  "/admin/:requestId",
  protect,
  authorize("admin"),
  reviewPurchaseRequest
);

export default router;