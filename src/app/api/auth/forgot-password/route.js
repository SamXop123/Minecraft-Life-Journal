import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { isEmailConfigured, sendPasswordResetEmail } from "@/lib/email";
import {
  createPasswordResetExpiry,
  generatePasswordResetToken,
  hashPasswordResetToken,
} from "@/lib/verification";

export const runtime = "nodejs";

const RESET_RESEND_COOLDOWN_SECONDS = 60;

function buildAppOrigin(req) {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  return req.nextUrl.origin;
}

export async function POST(req) {
  try {
    await connectDB();

    const { email } = await req.json();
    const normalizedEmail = email?.toLowerCase().trim();

    if (!normalizedEmail) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    if (!isEmailConfigured()) {
      return NextResponse.json(
        {
          message:
            "Password reset email is not configured yet. Add Gmail SMTP credentials in .env.local.",
        },
        { status: 500 }
      );
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json(
        {
          message:
            "If an account with that email exists, a password reset link has been sent.",
        },
        { status: 200 }
      );
    }

    const lastSentAt = user.passwordResetLastSentAt;
    const secondsSinceLastEmail = lastSentAt
      ? Math.floor((Date.now() - lastSentAt.getTime()) / 1000)
      : RESET_RESEND_COOLDOWN_SECONDS;

    if (secondsSinceLastEmail < RESET_RESEND_COOLDOWN_SECONDS) {
      const retryAfterSeconds =
        RESET_RESEND_COOLDOWN_SECONDS - secondsSinceLastEmail;

      return NextResponse.json(
        {
          message: `Please wait ${retryAfterSeconds} seconds before requesting another reset link.`,
          retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    const rawToken = generatePasswordResetToken();
    const hashedToken = hashPasswordResetToken(rawToken);

    user.passwordResetTokenHash = hashedToken;
    user.passwordResetExpiresAt = createPasswordResetExpiry();
    user.passwordResetLastSentAt = new Date();
    await user.save();

    try {
      const origin = buildAppOrigin(req);
      const resetUrl = `${origin}/reset-password?token=${rawToken}`;

      await sendPasswordResetEmail({
        to: user.email,
        username: user.username,
        resetUrl,
      });
    } catch (emailError) {
      user.passwordResetTokenHash = "";
      user.passwordResetExpiresAt = null;
      user.passwordResetLastSentAt = null;
      await user.save();

      console.error("Password reset email error:", emailError);
      return NextResponse.json(
        {
          message:
            "We could not send the reset email. Please check your Gmail SMTP setup and try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message:
          "If an account with that email exists, a password reset link has been sent.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
