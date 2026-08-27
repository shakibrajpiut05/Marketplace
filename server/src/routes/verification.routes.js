import express from "express";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { uploadDocument } from "../middleware/upload.middleware.js";
import {
  getMyVerification,
  submitVerification,
} from "../controllers/verification.controller.js";

const router = express.Router();

router.get(
  "/me",
  protect,
  authorize("buyer", "seller"),
  getMyVerification,
);

router.post(
  "/me",
  protect,
  authorize("buyer", "seller"),
  uploadDocument.single("cpcbProfile"),
  submitVerification,
);

export default router;
