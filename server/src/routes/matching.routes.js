import express from "express";

import {
  protect,
} from "../middleware/auth.middleware.js";

import {
  authorize,
} from "../middleware/role.middleware.js";

import {
  getRequirementMatches,
} from "../controllers/matching.controller.js";

const router = express.Router();

router.get(
  "/requirements/:requirementId/matches",
  protect,
  authorize("admin"),
  getRequirementMatches
);

export default router;