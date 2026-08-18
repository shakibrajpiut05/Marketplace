import express from "express";

import {
  protect,
} from "../middleware/auth.middleware.js";

import {
  authorize,
} from "../middleware/role.middleware.js";

import {
  createDeal,
  getAdminDeals,
  updateDealStatus,
  getSellerDeals,
  getBuyerDeals,
} from "../controllers/deal.controller.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("admin"),
  createDeal
);

router.get(
  "/admin",
  protect,
  authorize("admin"),
  getAdminDeals
);

router.get(
  "/seller",
  protect,
  authorize("seller"),
  getSellerDeals
);

router.patch(
  "/:dealId/status",
  protect,
  authorize("admin"),
  updateDealStatus
);

router.get(
  "/buyer",
  protect,
  authorize("buyer"),
  getBuyerDeals
);

export default router;