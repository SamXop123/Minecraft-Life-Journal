import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";
import World from "@/models/World";

export async function PATCH(req, { params }) {
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

    const newIsPublic = !world.isPublic;
    const updateData = { isPublic: newIsPublic };

    // If turning public and no shareToken exists, generate one
    if (newIsPublic && !world.shareToken) {
      updateData.shareToken = crypto.randomBytes(16).toString("hex");
    }

    const updatedWorld = await World.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    return NextResponse.json(
      {
        isPublic: updatedWorld.isPublic,
        shareUrl: updatedWorld.isPublic
          ? `/share/${updatedWorld.shareToken}`
          : null,
      },
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
    console.error("Toggle public error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
