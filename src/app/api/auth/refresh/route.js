import { NextResponse } from "next/server";
import { verifyRefreshToken, generateAccessToken } from "@/lib/auth";

export async function POST(req) {
  try {
    const refreshToken = req.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyRefreshToken(refreshToken);

    const accessToken = generateAccessToken({
      userId: decoded.userId,
      email: decoded.email,
    });

    return NextResponse.json({ accessToken }, { status: 200 });
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { message: "Invalid or expired refresh token" },
      { status: 401 }
    );
  }
}
