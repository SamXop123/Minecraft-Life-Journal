import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";
import World from "@/models/World";
import Coordinate from "@/models/Coordinate";

export async function DELETE(req, { params }) {
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

    await Coordinate.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Coordinate deleted successfully" },
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

    console.error("Coordinate delete error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
