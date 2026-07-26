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
      if (field === "memoryDate" && body.memoryDate !== undefined) {
        const newYMD = typeof body.memoryDate === "string"
          ? body.memoryDate.split("T")[0]
          : new Date(body.memoryDate).toISOString().split("T")[0];

        const oldYMD = memory.memoryDate
          ? new Date(memory.memoryDate).toISOString().split("T")[0]
          : "";

        if (newYMD && newYMD === oldYMD) {
          // Calendar date (YYYY-MM-DD) is unchanged; preserve existing memoryDate timestamp and time component
        } else if (newYMD) {
          // Calendar date changed; preserve time-of-day component from original memoryDate or createdAt
          const origDate = memory.memoryDate || memory.createdAt || new Date();
          const origTimeStr = new Date(origDate).toISOString().split("T")[1];
          const combined = new Date(`${newYMD}T${origTimeStr}`);
          memory.memoryDate = isNaN(combined.getTime()) ? new Date(body.memoryDate) : combined;
        }
      } else if (body[field] !== undefined) {
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
