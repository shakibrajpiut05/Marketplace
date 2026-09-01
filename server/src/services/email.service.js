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


/**
 * Send an important transaction lifecycle email.
 *
 * This helper intentionally does not throw into the caller's business transaction:
 * email delivery is best-effort and should never roll back a successful DB operation.
 */
export async function sendTransactionEmail({
  to,
  subject,
  title,
  message,
  actionText = null,
  actionUrl = null,
}) {
  if (!to) return { sent: false, skipped: true, reason: "missing-recipient" };

  const safe = (value = "") =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const html = `
    <div style="margin:0;padding:32px 16px;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden">
        <div style="padding:22px 24px;border-bottom:1px solid #e2e8f0">
          <div style="font-size:18px;font-weight:700">EPR Nexus</div>
        </div>
        <div style="padding:28px 24px">
          <h1 style="margin:0 0 12px;font-size:22px">${safe(title)}</h1>
          <p style="margin:0 0 22px;font-size:15px;line-height:1.7;color:#475569">${safe(message)}</p>
          ${actionUrl ? `<p style="margin:0 0 22px"><a href="${safe(actionUrl)}" style="display:inline-block;padding:11px 16px;background:#0f172a;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:600">${safe(actionText || "Open EPR Nexus")}</a></p>` : ""}
          <p style="margin:26px 0 0;font-size:12px;line-height:1.6;color:#94a3b8">You are receiving this email because of activity on your EPR Nexus account.</p>
        </div>
      </div>
    </div>`;

  try {
    const info = await transporter.sendMail({
      to,
      subject,
      html,
      text: `${title}\n\n${message}${actionUrl ? `\n\n${actionText || "Open EPR Nexus"}: ${actionUrl}` : ""}`,
    });
    return { sent: true, messageId: info?.messageId || null };
  } catch (error) {
    console.error("Transaction email delivery failed:", error?.message || error);
    return { sent: false, skipped: false, error: error?.message || "email-delivery-failed" };
  }
}

