import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { hashPassword } from "@/lib/auth";
import { hashPasswordResetToken } from "@/lib/verification";

export const runtime = "nodejs";

function isResetTokenValid(user) {
  return Boolean(
    user?.passwordResetTokenHash &&
      user?.passwordResetExpiresAt &&
      user.passwordResetExpiresAt.getTime() > Date.now()
  );
}

export async function GET(req) {
  try {
    await connectDB();

    const token = req.nextUrl.searchParams.get("token")?.trim();

    if (!token) {
      return NextResponse.json(
        { message: "Reset token is required" },
        { status: 400 }
      );
    }

    const hashedToken = hashPasswordResetToken(token);
    const user = await User.findOne({ passwordResetTokenHash: hashedToken });

    if (!isResetTokenValid(user)) {
      return NextResponse.json(
        { message: "This reset link is invalid or has expired." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Reset token is valid" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password validation error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();

    const { token, password } = await req.json();
    const normalizedToken = token?.trim();

    if (!normalizedToken || !password) {
      return NextResponse.json(
        { message: "Reset token and new password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const hashedToken = hashPasswordResetToken(normalizedToken);
    const user = await User.findOne({ passwordResetTokenHash: hashedToken });

    if (!isResetTokenValid(user)) {
      return NextResponse.json(
        { message: "This reset link is invalid or has expired." },
        { status: 400 }
      );
    }

    user.password = await hashPassword(password);
    user.passwordResetTokenHash = "";
    user.passwordResetExpiresAt = null;
    user.passwordResetLastSentAt = null;
    await user.save();

    return NextResponse.json(
      { message: "Password reset successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
