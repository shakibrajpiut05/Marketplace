import express from "express";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import {
  getPendingListings,
  reviewListing,
} from "../controllers/listing.controller.js";
import {
  getPendingKycDocuments,
  reviewKycDocument,
} from "../controllers/document.controller.js";

const router = express.Router();

router.get("/dashboard", protect, authorize("admin"), (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the admin dashboard",
    user: {
      id: req.user._id,
      name: req.user.name,
      role: req.user.role,
    },
  });
});

/*
|--------------------------------------------------------------------------
| KYC queue
|--------------------------------------------------------------------------
*/

router.get("/kyc", protect, authorize("admin"), getPendingKycDocuments);

/*
|--------------------------------------------------------------------------
| Review KYC
|--------------------------------------------------------------------------
*/

router.patch(
  "/kyc/:documentId",
  protect,
  authorize("admin"),
  reviewKycDocument,
);

router.get("/listings", protect, authorize("admin"), getPendingListings);

router.patch(
  "/listings/:listingId",
  protect,
  authorize("admin"),
  reviewListing,
);

export default router;
