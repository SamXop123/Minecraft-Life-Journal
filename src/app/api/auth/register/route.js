import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import {
  hashPassword,
  generateAccessToken,
  generateRefreshToken,
} from "@/lib/auth";

export async function POST(req) {
  try {
    await connectDB();

    const { username, email, password } = await req.json();

    // Validate required fields
    if (!username || !email || !password) {
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
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // Generate tokens
    const tokenPayload = { userId: user._id, email: user.email };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
        accessToken,
        refreshToken,
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
