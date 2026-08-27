import express from "express";
import {
  googleAuth,
  completeGoogleSignup,
  resendSignupVerification,
  changeSignupEmail,
  loginUser,
  registerUser,
  resendVerificationEmail,
  verifyEmail,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleAuth);
router.post("/google/complete-signup", completeGoogleSignup);
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", protect, resendVerificationEmail);
router.post("/resend-signup-verification", resendSignupVerification);
router.post("/change-signup-email", changeSignupEmail);

export default router;
