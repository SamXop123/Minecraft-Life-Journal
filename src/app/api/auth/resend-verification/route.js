import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { isEmailConfigured, sendVerificationCodeEmail } from "@/lib/email";
import {
  createVerificationExpiry,
  generateVerificationCode,
  hashVerificationCode,
} from "@/lib/verification";

export const runtime = "nodejs";

const RESEND_COOLDOWN_SECONDS = 60;

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
            "Email verification is not configured yet. Add Gmail SMTP credentials in .env.local.",
        },
        { status: 500 }
      );
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json(
        { message: "No account found for this email" },
        { status: 404 }
      );
    }

    if (user.isEmailVerified) {
      return NextResponse.json(
        { message: "This email is already verified" },
        { status: 400 }
      );
    }

    const lastSentAt = user.emailVerificationLastSentAt;
    const secondsSinceLastEmail = lastSentAt
      ? Math.floor((Date.now() - lastSentAt.getTime()) / 1000)
      : RESEND_COOLDOWN_SECONDS;

    if (secondsSinceLastEmail < RESEND_COOLDOWN_SECONDS) {
      const retryAfterSeconds =
        RESEND_COOLDOWN_SECONDS - secondsSinceLastEmail;
      return NextResponse.json(
        {
          message: `Please wait ${retryAfterSeconds} seconds before requesting another code.`,
          retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    const verificationCode = generateVerificationCode();
    user.emailVerificationCodeHash = hashVerificationCode(verificationCode);
    user.emailVerificationExpiresAt = createVerificationExpiry();
    user.emailVerificationLastSentAt = new Date();
    user.emailVerificationAttempts = 0;
    await user.save();

    await sendVerificationCodeEmail({
      to: user.email,
      username: user.username,
      code: verificationCode,
    });

    return NextResponse.json(
      { message: "A new verification code has been sent" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
