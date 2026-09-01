import dotenv from "dotenv";
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

dotenv.config();

export const PORT = Number(process.env.PORT) || 8000;
export const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
export const NODE_ENV = process.env.NODE_ENV || "development";

export const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/eprnexuss";

export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
export const EMAIL_FROM = process.env.EMAIL_FROM;
export const SMTP_HOST = process.env.SMTP_HOST;
export const SMTP_PASS = process.env.SMTP_PASS;
export const SMTP_PORT = process.env.SMTP_PORT;
export const SMTP_USER = process.env.SMTP_USER;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

export const TRUST_PROXY = process.env.TRUST_PROXY === "1";

export const validateProductionConfig = () => {
  if (NODE_ENV !== "production") return;

  const errors = [];

  if (!JWT_SECRET || JWT_SECRET.length < 32) {
    errors.push("JWT_SECRET must be at least 32 characters in production");
  }

  if (!process.env.MONGO_URI) {
    errors.push("MONGO_URI must be explicitly configured in production");
  }

  try {
    const url = new URL(CLIENT_URL);
    if (url.protocol !== "https:") {
      errors.push("CLIENT_URL must use HTTPS in production");
    }
  } catch {
    errors.push("CLIENT_URL must be a valid URL");
  }

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !SMTP_PORT || !EMAIL_FROM) {
    errors.push("SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS and EMAIL_FROM are required in production");
  }

  if (errors.length) {
    throw new Error(`Production configuration is invalid:\n- ${errors.join("\n- ")}`);
  }
};
