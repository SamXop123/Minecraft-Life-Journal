import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";
import { hashApiKey } from "@/lib/requireApiKey";
import User from "@/models/User";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    await connectDB();

    const decoded = await requireAuth(req);

    // Generate 32 characters of random hex data (16 bytes) and prefix it
    const rawKey = `mlj_${crypto.randomBytes(16).toString("hex")}`;
    const hashedKey = hashApiKey(rawKey);

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      {
        $set: {
          apiKeyHash: hashedKey,
          apiKeyLastUsedAt: null, // Reset last used timestamp for new key
        },
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "API key generated successfully. Copy it now, as it won't be shown again.",
        apiKey: rawKey,
      },
      { status: 200 }
    );
  } catch (error) {
    if (
      error.message === "Unauthorized" ||
      error.message === "Invalid or expired token"
    ) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }

    console.error("API Key generation error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();

    const decoded = await requireAuth(req);

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      {
        $set: {
          apiKeyHash: "",
          apiKeyLastUsedAt: null,
        },
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "API key revoked successfully" },
      { status: 200 }
    );
  } catch (error) {
    if (
      error.message === "Unauthorized" ||
      error.message === "Invalid or expired token"
    ) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }

    console.error("API Key revocation error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
