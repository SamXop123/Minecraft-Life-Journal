import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import World from "@/models/World";
import WorldActivity from "@/models/WorldActivity";
import { requireAuth } from "@/lib/requireAuth";

export async function GET(req, { params }) {
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

    const activities = await WorldActivity.find({ worldId: id });
    const totalPlaytimeMinutes = activities.reduce(
      (sum, act) => sum + (act.playtimeMinutes || 0),
      0
    );

    const worldObj = world.toObject();
    worldObj.playtimeMinutes = totalPlaytimeMinutes;

    return NextResponse.json({ world: worldObj }, { status: 200 });
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

    console.error("Fetch world error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    const body = await req.json();

    const isEndOperation =
      body.endReason !== undefined ||
      body.finalMessage !== undefined ||
      body.endedAt !== undefined;

    if (isEndOperation) {
      // End world operation
      if (world.endedAt) {
        return NextResponse.json(
          { message: "World has already been ended" },
          { status: 400 }
        );
      }

      world.endedAt = new Date();
      world.endReason = body.endReason || "";
      world.finalMessage = body.finalMessage || "";
      world.updatedAt = new Date();
    } else {
      // Normal field updates
      const allowedFields = ["name", "mcVersion", "seed", "mode", "type", "isPublic"];

      for (const field of allowedFields) {
        if (body[field] !== undefined) {
          world[field] = body[field];
        }
      }

      world.updatedAt = new Date();
    }

    await world.save();

    return NextResponse.json(
      {
        message: "World updated successfully",
        world,
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

    console.error("Update world error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
