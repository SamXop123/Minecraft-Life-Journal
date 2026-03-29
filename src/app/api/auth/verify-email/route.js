import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import {
  attachRefreshTokenCookie,
  generateAccessToken,
  generateRefreshToken,
} from "@/lib/auth";
import { hashVerificationCode } from "@/lib/verification";

export const runtime = "nodejs";

const MAX_VERIFICATION_ATTEMPTS = 5;

export async function POST(req) {
  try {
    await connectDB();

    const { email, code } = await req.json();
    const normalizedEmail = email?.toLowerCase().trim();
    const normalizedCode = code?.trim();

    if (!normalizedEmail || !normalizedCode) {
      return NextResponse.json(
        { message: "Email and verification code are required" },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(normalizedCode)) {
      return NextResponse.json(
        { message: "Verification code must be 6 digits" },
        { status: 400 }
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
        { message: "Email is already verified" },
        { status: 400 }
      );
    }

    if (
      !user.emailVerificationCodeHash ||
      !user.emailVerificationExpiresAt ||
      user.emailVerificationExpiresAt.getTime() < Date.now()
    ) {
      return NextResponse.json(
        {
          message: "This verification code has expired. Please request a new one.",
        },
        { status: 400 }
      );
    }

    const incomingCodeHash = hashVerificationCode(normalizedCode);

    if (incomingCodeHash !== user.emailVerificationCodeHash) {
      user.emailVerificationAttempts += 1;
      await user.save();

      if (user.emailVerificationAttempts >= MAX_VERIFICATION_ATTEMPTS) {
        return NextResponse.json(
          {
            message:
              "Too many incorrect attempts. Please request a new verification code.",
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { message: "Invalid verification code" },
        { status: 400 }
      );
    }

    user.isEmailVerified = true;
    user.emailVerificationCodeHash = "";
    user.emailVerificationExpiresAt = null;
    user.emailVerificationLastSentAt = null;
    user.emailVerificationAttempts = 0;
    await user.save();

    const tokenPayload = { userId: user._id, email: user.email };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    const response = NextResponse.json(
      {
        message: "Email verified successfully",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
        accessToken,
      },
      { status: 200 }
    );

    return attachRefreshTokenCookie(response, refreshToken);
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
