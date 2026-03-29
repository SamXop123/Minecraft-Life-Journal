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

const RESEND_COOLDOWN_SECONDS = 60;

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

    const existingEmailUser = await User.findOne({ email: normalizedEmail });
    const existingUsernameUser = await User.findOne({ username: trimmedUsername });

    if (
      existingUsernameUser &&
      existingUsernameUser.email !== normalizedEmail
    ) {
      return NextResponse.json(
        { message: "Username is already taken" },
        { status: 400 }
      );
    }

    const verificationCode = generateVerificationCode();
    const hashedCode = hashVerificationCode(verificationCode);
    const verificationExpiry = createVerificationExpiry();
    let user;
    let createdNewUser = false;

    if (existingEmailUser?.isEmailVerified) {
      return NextResponse.json(
        { message: "An account with this email already exists" },
        { status: 400 }
      );
    }

    if (existingEmailUser) {
      const lastSentAt = existingEmailUser.emailVerificationLastSentAt;
      const secondsSinceLastEmail = lastSentAt
        ? Math.floor((Date.now() - lastSentAt.getTime()) / 1000)
        : RESEND_COOLDOWN_SECONDS;

      if (secondsSinceLastEmail < RESEND_COOLDOWN_SECONDS) {
        const retryAfterSeconds =
          RESEND_COOLDOWN_SECONDS - secondsSinceLastEmail;
        return NextResponse.json(
          {
            message: `A verification code was already sent. Please wait ${retryAfterSeconds} seconds and try again.`,
            requiresVerification: true,
            email: existingEmailUser.email,
            retryAfterSeconds,
          },
          { status: 429 }
        );
      }

      existingEmailUser.emailVerificationCodeHash = hashedCode;
      existingEmailUser.emailVerificationExpiresAt = verificationExpiry;
      existingEmailUser.emailVerificationLastSentAt = new Date();
      existingEmailUser.emailVerificationAttempts = 0;
      user = existingEmailUser;
      await user.save();
    } else {
      const hashedPassword = await hashPassword(password);

      user = await User.create({
        username: trimmedUsername,
        email: normalizedEmail,
        password: hashedPassword,
        isEmailVerified: false,
        emailVerificationCodeHash: hashedCode,
        emailVerificationExpiresAt: verificationExpiry,
        emailVerificationLastSentAt: new Date(),
        emailVerificationAttempts: 0,
      });
      createdNewUser = true;
    }

    try {
      await sendVerificationCodeEmail({
        to: user.email,
        username: user.username,
        code: verificationCode,
      });
    } catch (emailError) {
      if (createdNewUser) {
        await User.findByIdAndDelete(user._id);
      }

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
      { status: createdNewUser ? 201 : 200 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
