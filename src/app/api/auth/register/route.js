import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { hashPassword } from "@/lib/auth";
import { isEmailConfigured, sendVerificationCodeEmail } from "@/lib/email";
import {
  createVerificationExpiry,
  generateVerificationCode,
  hashVerificationCode,
} from "@/lib/verification";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    await connectDB();

    const { username, email, password } = await req.json();
    const normalizedEmail = email?.toLowerCase().trim();
    const trimmedUsername = username?.trim();

    // Validate required fields
    if (!trimmedUsername || !normalizedEmail || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { message: "Invalid email format" },
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

    const existingUsernameUser = await User.findOne({ username: trimmedUsername });
    if (existingUsernameUser) {
      return NextResponse.json(
        { message: "Username is already taken" },
        { status: 400 }
      );
    }

    const existingEmailUser = await User.findOne({ email: normalizedEmail });
    if (existingEmailUser) {
      return NextResponse.json(
        { message: "An account with this email already exists. Please log in or reset your password." },
        { status: 400 }
      );
    }

    const verificationCode = generateVerificationCode();
    const hashedCode = hashVerificationCode(verificationCode);
    const verificationExpiry = createVerificationExpiry();
    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      username: trimmedUsername,
      email: normalizedEmail,
      password: hashedPassword,
      isEmailVerified: false,
      emailVerificationCodeHash: hashedCode,
      emailVerificationExpiresAt: verificationExpiry,
      emailVerificationLastSentAt: new Date(),
      emailVerificationAttempts: 0,
    });

    try {
      await sendVerificationCodeEmail({
        to: user.email,
        username: user.username,
        code: verificationCode,
      });
    } catch (emailError) {
      await User.findByIdAndDelete(user._id);

      console.error("Verification email error:", emailError);
      return NextResponse.json(
        {
          message:
            "We could not send the verification code. Please check your Gmail SMTP setup and try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Verification code sent to your email",
        requiresVerification: true,
        email: user.email,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
