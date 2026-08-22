import express from "express";

import {
  getAdminReport,
} from "../controllers/report.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get(
  "/admin",
  protect,
  getAdminReport
);

export default router;