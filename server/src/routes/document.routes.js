import express from "express";

import { protect } from "../middleware/auth.middleware.js";
import {
  uploadDocument,
} from "../middleware/upload.middleware.js";

import {
  uploadKycDocument,
} from "../controllers/document.controller.js";

const router = express.Router();

router.post(
  "/kyc",
  protect,
  uploadDocument.single("document"),
  uploadKycDocument
);

export default router;