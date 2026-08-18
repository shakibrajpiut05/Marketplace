import express from "express";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

import {
  createRequirement,
  getBuyerRequirements,
  matchRequirement,
} from "../controllers/requirement.controller.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("buyer"),
  createRequirement
);

router.get(
  "/buyer",
  protect,
  authorize("buyer"),
  getBuyerRequirements
);

router.patch(
  "/admin/:requirementId/match",
  protect,
  authorize("admin"),
  matchRequirement
);

export default router;