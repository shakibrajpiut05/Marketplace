import nodemailer from "nodemailer";
import {
  CLIENT_URL,
  EMAIL_FROM,
  SMTP_HOST,
  SMTP_PASS,
  SMTP_PORT,
  SMTP_USER,
} from "../config/env.js";

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: Number(SMTP_PORT || 587) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  return transporter;
};

export const sendEmailVerification = async ({
  email,
  name,
  token,
}) => {
  const verificationUrl = `${CLIENT_URL}/?verify-email=${encodeURIComponent(token)}`;
  const mailer = getTransporter();

  if (!mailer) {
    console.warn(
      `[EMAIL] SMTP is not configured. Verification URL for ${email}: ${verificationUrl}`,
    );
    return {
      sent: false,
      verificationUrl,
    };
  }

  await mailer.sendMail({
    from: EMAIL_FROM || SMTP_USER,
    to: email,
    subject: "Verify your EPR Nexus email",
    text: `Hi ${name},\n\nPlease verify your EPR Nexus email address by opening this link:\n${verificationUrl}\n\nThis link expires in 24 hours.\n\nIf you did not create this account, you can ignore this email.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0F1923;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="margin-bottom:8px">Verify your EPR Nexus email</h2>
        <p>Hi ${name},</p>
        <p>Please verify your email address to continue with EPR Nexus.</p>
        <p>
          <a href="${verificationUrl}" style="display:inline-block;background:#5AC361;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:600">
            Verify Email
          </a>
        </p>
        <p style="font-size:13px;color:#6B7280">This verification link expires in 24 hours.</p>
        <p style="font-size:13px;color:#6B7280">If you did not create this account, you can ignore this email.</p>
      </div>
    `,
  });

  return {
    sent: true,
    verificationUrl,
  };
};
