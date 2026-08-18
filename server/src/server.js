import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import { PORT, CLIENT_URL } from "./config/env.js";
import { connectDB } from "./config/db.js";
import documentRoutes from "./routes/document.routes.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import listingRoutes from "./routes/listing.routes.js";
import requestRoutes from "./routes/request.routes.js";
import dealRoutes from "./routes/deal.routes.js";
import requirementRoutes from "./routes/requirement.routes.js";
import matchingRoutes from "./routes/matching.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

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
  })
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "../uploads")
  )
);
app.use("/api/requests", requestRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/requirements",requirementRoutes);
app.use("/api/matching",matchingRoutes);

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

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

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});