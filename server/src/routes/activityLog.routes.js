import express from "express";

import {
  getActivityLogs,
} from "../controllers/activityLog.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get(
  "/",
  protect,
  getActivityLogs
);

export default router;