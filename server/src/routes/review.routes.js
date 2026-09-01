import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { createReview, getDealReviews, getUserReputation } from "../controllers/review.controller.js";

const router = express.Router();

router.post("/", protect, createReview);
router.get("/deal/:dealId", protect, getDealReviews);
router.get("/user/:userId/reputation", protect, getUserReputation);

export default router;
