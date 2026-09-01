import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { validateProductionConfig, PORT, CLIENT_URL, TRUST_PROXY } from "./config/env.js";
import { connectDB } from "./config/db.js";
import documentRoutes from "./routes/document.routes.js";
import verificationRoutes from "./routes/verification.routes.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import listingRoutes from "./routes/listing.routes.js";
import requestRoutes from "./routes/request.routes.js";
import dealRoutes from "./routes/deal.routes.js";
import requirementRoutes from "./routes/requirement.routes.js";
import matchingRoutes from "./routes/matching.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import activityLogRoutes from "./routes/activityLog.routes.js";
import reportRoutes from "./routes/report.routes.js";
import dealMessageRoutes from "./routes/dealMessage.routes.js";
import watchlistRoutes from "./routes/watchlist.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import invoiceRoutes from "./routes/invoice.routes.js";
import disputeRoutes from "./routes/dispute.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import { apiRateLimiter } from "./middleware/rateLimit.middleware.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";

const app = express();

validateProductionConfig();

if (TRUST_PROXY) {
  app.set("trust proxy", 1);
}

/*
|--------------------------------------------------------------------------
| Database
|--------------------------------------------------------------------------
*/

await connectDB();

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

/*
|--------------------------------------------------------------------------
| Security
|--------------------------------------------------------------------------
*/

app.use(helmet());

/*
|--------------------------------------------------------------------------
| Body Parser
|--------------------------------------------------------------------------
*/

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

/*
|--------------------------------------------------------------------------
| Logger
|--------------------------------------------------------------------------
*/

app.use(morgan("dev"));

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/
app.use("/api", apiRateLimiter);

app.use("/api/requests", requestRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/verifications", verificationRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/requirements", requirementRoutes);
app.use("/api/matching", matchingRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/activity-logs", activityLogRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/deal-messages", dealMessageRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/disputes", disputeRoutes);
app.use("/api/reviews", reviewRoutes);

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    database: "connected",
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "EPR Nexuss API is running",
  });
});

/*
|--------------------------------------------------------------------------
| 404
|--------------------------------------------------------------------------
*/

app.use(notFoundHandler);

app.use(errorHandler);

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);

  server.close(async () => {
    try {
      const mongoose = await import("mongoose");
      await mongoose.default.connection.close(false);
    } finally {
      process.exit(0);
    }
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
