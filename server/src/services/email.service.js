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

export const sendPasswordResetEmail = async ({
  email,
  name,
  token,
}) => {
  const resetUrl = `${CLIENT_URL}/?reset-password=${encodeURIComponent(token)}`;
  const mailer = getTransporter();

  if (!mailer) {
    console.warn(
      `[EMAIL] SMTP is not configured. Password reset URL for ${email}: ${resetUrl}`,
    );
    return { sent: false, resetUrl };
  }

  await mailer.sendMail({
    from: EMAIL_FROM || SMTP_USER,
    to: email,
    subject: "Reset your EPR Nexus password",
    text: `Hi ${name},\n\nWe received a request to reset your EPR Nexus password. Open this link to choose a new password:\n${resetUrl}\n\nThis link expires in 1 hour. If you did not request a password reset, you can ignore this email.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0F1923;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="margin-bottom:8px">Reset your EPR Nexus password</h2>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Use the button below to choose a new password.</p>
        <p>
          <a href="${resetUrl}" style="display:inline-block;background:#5AC361;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:600">
            Reset Password
          </a>
        </p>
        <p style="font-size:13px;color:#6B7280">This reset link expires in 1 hour and can only be used once.</p>
        <p style="font-size:13px;color:#6B7280">If you did not request this, you can safely ignore this email.</p>
      </div>
    `,
  });

  return { sent: true, resetUrl };
};
