export const requireVerifiedUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (req.user.role === "admin") {
    return next();
  }

  if (!req.user.emailVerified) {
    return res.status(403).json({
      success: false,
      code: "EMAIL_VERIFICATION_REQUIRED",
      message: "Please verify your email before using marketplace services",
    });
  }

  if (req.user.kycStatus !== "approved") {
    return res.status(403).json({
      success: false,
      code: "USER_VERIFICATION_REQUIRED",
      message:
        req.user.kycStatus === "rejected"
          ? "Your verification was rejected. Please re-upload your verification documents."
          : "Your verification is pending. Please wait for admin approval.",
    });
  }

  next();
};
