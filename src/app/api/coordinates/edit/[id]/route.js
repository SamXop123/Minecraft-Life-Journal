import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";
import Coordinate from "@/models/Coordinate";
import World from "@/models/World";

export const runtime = "nodejs";

export async function PATCH(req, { params }) {
  try {
    await connectDB();

    const decoded = await requireAuth(req);
    const { id } = await params;

    const coordinate = await Coordinate.findById(id);
    if (!coordinate) {
      return NextResponse.json(
        { message: "Coordinate not found" },
        { status: 404 }
      );
    }

    // Verify world belongs to user
    const world = await World.findById(coordinate.worldId);
    if (!world || world.userId.toString() !== decoded.userId) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { label, x, y, z, category, notes } = body;

    if (label !== undefined) {
      if (!label.trim()) {
        return NextResponse.json(
          { message: "Label cannot be empty" },
          { status: 400 }
        );
      }
      coordinate.label = label.trim();
    }

    if (x !== undefined && !isNaN(Number(x))) coordinate.x = Number(x);
    if (y !== undefined && !isNaN(Number(y))) coordinate.y = Number(y);
    if (z !== undefined && !isNaN(Number(z))) coordinate.z = Number(z);

    const ALLOWED_CATEGORIES = ["base", "structure", "resource", "portal", "poi", "other"];
    if (category !== undefined && ALLOWED_CATEGORIES.includes(category)) {
      coordinate.category = category;
    }

    if (notes !== undefined) {
      coordinate.notes = notes ? String(notes).trim() : "";
    }

    await coordinate.save();

    return NextResponse.json(
      {
        message: "Coordinate updated successfully",
        coordinate,
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

    console.error("Coordinate update error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
