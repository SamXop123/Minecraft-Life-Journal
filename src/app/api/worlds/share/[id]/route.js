import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";
import World from "@/models/World";

export async function POST(req, { params }) {
  try {
    await connectDB();

    const decoded = await requireAuth(req);
    const { id } = await params;

    const world = await World.findById(id);

    if (!world) {
      return NextResponse.json(
        { message: "World not found" },
        { status: 404 }
      );
    }

    if (world.userId.toString() !== decoded.userId) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const shareToken = crypto.randomBytes(16).toString("hex");

    // Use findByIdAndUpdate with $set to bypass Mongoose cached-model issues
    // that can silently drop newly-added schema fields when using .save()
    await World.findByIdAndUpdate(
      id,
      { $set: { isPublic: true, shareToken } },
      { new: true }
    );

    console.log(`[share] token saved for world ${id}:`, shareToken);

    return NextResponse.json(
      { shareUrl: `/share/${shareToken}` },
      { status: 200 }
    );
  } catch (error) {
    if (
      error.message === "Unauthorized" ||
      error.message === "Invalid or expired token"
    ) {
      return NextResponse.json(
        { message: error.message },
        { status: 401 }
      );
    }

    console.error("Share generation error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
