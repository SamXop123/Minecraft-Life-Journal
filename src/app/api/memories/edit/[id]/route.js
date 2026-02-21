import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";
import Memory from "@/models/Memory";
import World from "@/models/World";

export async function PATCH(req, { params }) {
  try {
    await connectDB();

    const decoded = await requireAuth(req);

    const { id } = await params;

    const memory = await Memory.findById(id);

    if (!memory) {
      return NextResponse.json(
        { message: "Memory not found" },
        { status: 404 }
      );
    }

    const world = await World.findById(memory.worldId);

    if (!world || world.userId.toString() !== decoded.userId) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const allowedFields = ["title", "category", "description", "memoryDate", "imageUrl"];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        memory[field] = body[field];
      }
    }

    memory.updatedAt = new Date();

    await memory.save();

    return NextResponse.json(
      {
        message: "Memory updated successfully",
        memory,
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

    console.error("Update memory error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
