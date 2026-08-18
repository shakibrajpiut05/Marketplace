import jwt from "jsonwebtoken";

import {
  JWT_SECRET,
} from "../config/env.js";

import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const authorization =
      req.headers.authorization;

    if (
      !authorization ||
      !authorization.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = authorization.split(" ")[1];

    const decoded = jwt.verify(
      token,
      JWT_SECRET
    );

    const user = await User.findById(
      decoded.userId
    ).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been disabled",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error(
      "Authentication error:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};