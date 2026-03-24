import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";
import World from "@/models/World";
import Coordinate from "@/models/Coordinate";

export async function POST(req) {
  try {
    await connectDB();

    const decoded = await requireAuth(req);

    const { worldId, label, x, y, z, category, notes } = await req.json();

    // Validate required fields
    if (!worldId || !label || x === undefined || y === undefined || z === undefined || !category) {
      return NextResponse.json(
        { message: "worldId, label, x, y, z, and category are required" },
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

    const coordinate = await Coordinate.create({
      worldId,
      label,
      x: Number(x),
      y: Number(y),
      z: Number(z),
      category,
      notes: notes || undefined,
    });

    return NextResponse.json(
      {
        message: "Coordinate saved successfully",
        coordinate,
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

    console.error("Coordinate creation error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
