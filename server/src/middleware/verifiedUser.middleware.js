export const requireVerifiedUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      code: "AUTHENTICATION_REQUIRED",
      message: "Authentication required. Please login or signup.",
    });
  }

  // Admins are trusted operators and do not require buyer/seller KYC.
  if (req.user.role === "admin") return next();

  if (!req.user.emailVerified) {
    return res.status(403).json({
      success: false,
      code: "EMAIL_VERIFICATION_REQUIRED",
      message: "Please verify your email before using marketplace services.",
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

  return next();
};

export const requireVerifiedBuyer = (req, res, next) => {
  if (req.user?.role !== "buyer") {
    return res.status(403).json({
      success: false,
      code: "BUYER_ONLY",
      message: "This action is available only to buyers.",
    });
  }

  return requireVerifiedUser(req, res, next);
};

export const requireVerifiedSeller = (req, res, next) => {
  if (req.user?.role !== "seller") {
    return res.status(403).json({
      success: false,
      code: "SELLER_ONLY",
      message: "This action is available only to sellers.",
    });
  }

  return requireVerifiedUser(req, res, next);
};
