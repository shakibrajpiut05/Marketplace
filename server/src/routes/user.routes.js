import express from "express";
import User from "../models/User.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/profile", protect, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

router.patch("/profile", protect, async (req, res) => {
  try {
    if (req.user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin profiles are managed by EPR Nexus and cannot be edited here",
      });
    }

    const { name, phone } = req.body || {};
    if (!name?.trim() || !phone?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name and phone number are required",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.name = name.trim();
    user.phone = phone.trim();
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return res.status(500).json({ success: false, message: "Failed to update profile" });
  }
});

export default router;
