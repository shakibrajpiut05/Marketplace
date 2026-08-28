import express from "express";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { uploadDocument } from "../middleware/upload.middleware.js";

import {
  createListing,
  getActiveListings,
  getListingById,
  getSellerListings,
  updateSellerListing,
  updateSellerListingStatus,
} from "../controllers/listing.controller.js";

const router = express.Router();

router.get("/", getActiveListings);

router.get(
  "/seller",
  protect,
  authorize("seller"),
  getSellerListings,
);

router.get("/:listingId", getListingById);

router.post(
  "/",
  protect,
  authorize("seller"),
  uploadDocument.single("document"),
  createListing,
);

router.patch(
  "/:listingId",
  protect,
  authorize("seller"),
  updateSellerListing,
);

router.patch(
  "/:listingId/status",
  protect,
  authorize("seller"),
  updateSellerListingStatus,
);

export default router;