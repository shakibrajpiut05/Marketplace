import express from "express";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { requireVerifiedBuyer } from "../middleware/verifiedUser.middleware.js";

import {
  createRequirement,
  getBuyerRequirements,
  getAdminRequirements,
  matchRequirement,
} from "../controllers/requirement.controller.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("buyer"),
  requireVerifiedBuyer,
  createRequirement,
);

router.get(
  "/buyer",
  protect,
  authorize("buyer"),
  getBuyerRequirements,
);

router.get(
  "/admin",
  protect,
  authorize("admin"),
  getAdminRequirements,
);

router.patch(
  "/admin/:requirementId/match",
  protect,
  authorize("admin"),
  matchRequirement,
);

export default router;
