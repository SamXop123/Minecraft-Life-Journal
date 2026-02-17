import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";
import World from "@/models/World";
import Memory from "@/models/Memory";

export async function POST(req) {
  try {
    await connectDB();

    const decoded = await requireAuth(req);

    const { worldId, title, category, description, imageUrl, memoryDate } =
      await req.json();

    // Validate required fields
    if (!worldId || !title || !category || !memoryDate) {
      return NextResponse.json(
        { message: "worldId, title, category, and memoryDate are required" },
        { status: 400 }
      );
    }

    // Verify world exists and belongs to user
    const world = await World.findById(worldId);

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

    const memory = await Memory.create({
      worldId,
      title,
      category,
      description: description || undefined,
      imageUrl: imageUrl || undefined,
      memoryDate,
      source: "manual",
    });

    return NextResponse.json(
      {
        message: "Memory added successfully",
        memory,
      },
      { status: 201 }
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

    console.error("Memory creation error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
