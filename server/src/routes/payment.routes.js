import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { uploadDocument } from "../middleware/upload.middleware.js";
import {
  getPaymentForDeal,
  initiatePayment,
  updatePaymentStatus,
  downloadPaymentProof,
} from "../controllers/payment.controller.js";

const router = express.Router();

router.get("/deal/:dealId", protect, authorize("buyer", "seller", "admin"), getPaymentForDeal);
router.post("/deal/:dealId/initiate", protect, authorize("buyer"), uploadDocument.single("paymentProof"), initiatePayment);
router.get("/:paymentId/proof", protect, authorize("buyer", "seller", "admin"), downloadPaymentProof);
router.patch("/:paymentId/status", protect, authorize("admin"), updatePaymentStatus);

export default router;
