import nodemailer from "nodemailer";

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  return transporter;
}

export function isEmailConfigured() {
  return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

/**
 * Send a verification code email via Gmail SMTP.
 * @param {{to: string, username: string, code: string}} params - Email payload.
 * @returns {Promise<void>}
 */
export async function sendVerificationCodeEmail({ to, username, code }) {
  if (!isEmailConfigured()) {
    throw new Error(
      "Email is not configured. Add GMAIL_USER and GMAIL_APP_PASSWORD to .env.local."
    );
  }

  const appName = process.env.EMAIL_FROM_NAME || "Minecraft Life Journal";
  const fromAddress = process.env.EMAIL_FROM || process.env.GMAIL_USER;
  const transporterInstance = getTransporter();

  await transporterInstance.sendMail({
    from: `${appName} <${fromAddress}>`,
    to,
    subject: `${appName} verification code`,
    text: [
      `Hi ${username || "there"},`,
      "",
      `Your verification code is: ${code}`,
      "",
      "This code will expire in 10 minutes.",
      "If you did not create this account, you can ignore this email.",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 420px; margin: 0 auto; color: #1f2937;">
        <h2 style="margin-bottom: 12px;">Verify your email</h2>
        <p style="margin-bottom: 16px;">Hi ${username || "there"},</p>
        <p style="margin-bottom: 16px;">
          Use this 6-digit code to verify your Minecraft Life Journal account:
        </p>
        <div style="font-size: 28px; font-weight: 700; letter-spacing: 8px; text-align: center; padding: 16px; background: #f3f4f6; border-radius: 12px; margin-bottom: 16px;">
          ${code}
        </div>
        <p style="margin-bottom: 8px;">This code will expire in 10 minutes.</p>
        <p style="color: #6b7280; font-size: 14px;">If you did not create this account, you can ignore this email.</p>
      </div>
    `,
  });
}
