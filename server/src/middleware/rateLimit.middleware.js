import rateLimit from "express-rate-limit";

const jsonHandler = (message, code) => (_req, res) => {
  res.status(429).json({
    success: false,
    code,
    message,
  });
};

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  // The frontend is a multi-view SPA and can legitimately issue many
  // authenticated reads while dashboards and deal rooms are open.
  // Authentication-sensitive routes have a separate stricter limiter.
  limit: 1000,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: jsonHandler(
    "Too many requests. Please try again later.",
    "RATE_LIMITED",
  ),
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  // Successful logins should not consume the failed-attempt budget.
  // This prevents normal SPA login/session flows from locking the user out.
  skipSuccessfulRequests: true,
  handler: jsonHandler(
    "Too many authentication attempts. Please try again later.",
    "AUTH_RATE_LIMITED",
  ),
});

export const sensitiveActionRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: jsonHandler(
    "Too many requests for this action. Please try again later.",
    "ACTION_RATE_LIMITED",
  ),
});
