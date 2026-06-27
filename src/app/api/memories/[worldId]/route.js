import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";
import World from "@/models/World";
import Memory from "@/models/Memory";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const decoded = await requireAuth(req);

    const { worldId } = await params;

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

    const { searchParams } = new URL(req.url);
    const showDeleted = searchParams.get("deleted") === "true";

    const query = { worldId };
    if (showDeleted) {
      query.isDeleted = true;
    } else {
      query.isDeleted = { $ne: true };
    }

    const memories = await Memory.find(query).sort({ memoryDate: 1 });

    return NextResponse.json({ memories }, { status: 200 });
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

    console.error("Fetch memories error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
