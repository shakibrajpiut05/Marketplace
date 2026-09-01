import express from "express";
import {
  googleAuth,
  completeGoogleSignup,
  resendSignupVerification,
  changeSignupEmail,
  forgotPassword,
  resetPassword,
  loginUser,
  registerUser,
  resendVerificationEmail,
  verifyEmail,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authRateLimiter } from "../middleware/rateLimit.middleware.js";

const router = express.Router();

router.post("/register", authRateLimiter, registerUser);
router.post("/login", authRateLimiter, loginUser);
router.post("/google", authRateLimiter, googleAuth);
router.post("/google/complete-signup", authRateLimiter, completeGoogleSignup);
router.get("/verify-email", authRateLimiter, verifyEmail);
router.post("/resend-verification", protect, resendVerificationEmail);
router.post("/resend-signup-verification", authRateLimiter, resendSignupVerification);
router.post("/change-signup-email", authRateLimiter, changeSignupEmail);
router.post("/forgot-password", authRateLimiter, forgotPassword);
router.post("/reset-password", authRateLimiter, resetPassword);

export default router;
