import dotenv from "dotenv";
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

dotenv.config();

export const PORT = process.env.PORT || 8000;
export const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
export const NODE_ENV = process.env.NODE_ENV || "development";

export const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/eprnexuss";

export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
export const EMAIL_FROM = process.env.EMAIL_FROM
export const SMTP_HOST = process.env.SMTP_HOST
export const SMTP_PASS = process.env.SMTP_PASS
export const SMTP_PORT = process.env.SMTP_PORT
export const SMTP_USER = process.env.SMTP_USER
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID