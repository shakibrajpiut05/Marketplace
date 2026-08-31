const VALID_ROLES = new Set(["buyer", "seller", "admin"]);

export const authorize = (...allowedRoles) => {
  const roles = allowedRoles.flat().filter(Boolean);

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        code: "AUTHENTICATION_REQUIRED",
        message: "Authentication required. Please login or signup.",
      });
    }

    if (!VALID_ROLES.has(req.user.role)) {
      return res.status(403).json({
        success: false,
        code: "INVALID_ACCOUNT_ROLE",
        message: "Your account does not have a valid authorization role.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        code: "FORBIDDEN_ROLE",
        message: "You are not authorized to perform this action.",
      });
    }

    return next();
  };
};
