import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";
import World from "@/models/World";
import WorldActivity from "@/models/WorldActivity";
import { normalizeDate } from "@/lib/utils/normalizeDate";

export async function POST(req) {
  try {
    await connectDB();

    const decoded = await requireAuth(req);

    const { worldId } = await req.json();

    if (!worldId) {
      return NextResponse.json(
        { message: "worldId is required" },
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

    const date = normalizeDate();

    // Check if activity already exists for today
    const existing = await WorldActivity.findOne({ worldId, date });

    if (existing) {
      return NextResponse.json({
        message: "Activity already recorded for today",
        activity: existing,
      });
    }

    const activity = await WorldActivity.create({
      worldId,
      date,
      played: true,
      memoryCount: 0,
    });

    return NextResponse.json(
      {
        message: "Activity recorded",
        activity,
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

    console.error("Activity creation error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
