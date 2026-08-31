import express from "express";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { uploadDocument } from "../middleware/upload.middleware.js";

import {
  uploadKycDocument,
  getPendingKycDocuments,
  reviewKycDocument,
} from "../controllers/document.controller.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| KYC document upload
|--------------------------------------------------------------------------
|
| Both buyers and sellers need to be able to upload their verification
| documents before they are approved.
|
*/
router.post(
  "/kyc",
  protect,
  authorize("buyer", "seller"),
  uploadDocument.single("document"),
  uploadKycDocument,
);

/*
|--------------------------------------------------------------------------
| Admin verification queue
|--------------------------------------------------------------------------
*/

router.get(
  "/admin/kyc",
  protect,
  authorize("admin"),
  getPendingKycDocuments,
);

router.patch(
  "/admin/kyc/:documentId/review",
  protect,
  authorize("admin"),
  reviewKycDocument,
);

export default router;