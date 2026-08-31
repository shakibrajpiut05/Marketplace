import express from "express";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import {
  addToWatchlist,
  getWatchlist,
  getWatchlistIds,
  removeFromWatchlist,
} from "../controllers/watchlist.controller.js";

const router = express.Router();

router.use(protect, authorize("buyer"));

router.get("/", getWatchlist);
router.get("/ids", getWatchlistIds);
router.post("/", addToWatchlist);
router.delete("/:listingId", removeFromWatchlist);

export default router;
