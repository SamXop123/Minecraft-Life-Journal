import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireApiKey } from "@/lib/requireApiKey";
import World from "@/models/World";
import WorldActivity from "@/models/WorldActivity";
import { normalizeDate } from "@/lib/utils/normalizeDate";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    await connectDB();

    const decoded = await requireApiKey(req);

    const { worldId, playtimeMinutes } = await req.json();

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
      // Mark as played
      existing.played = true;
      
      // Increment playtime if provided
      if (playtimeMinutes && typeof playtimeMinutes === "number" && playtimeMinutes > 0) {
        existing.playtimeMinutes += playtimeMinutes;
      }
      
      await existing.save();
      return NextResponse.json({
        message: "Activity updated successfully",
        activity: existing,
      });
    }

    const playtime = (playtimeMinutes && typeof playtimeMinutes === "number" && playtimeMinutes > 0) ? playtimeMinutes : 0;

    const activity = await WorldActivity.create({
      worldId,
      date,
      played: true,
      memoryCount: 0,
      playtimeMinutes: playtime,
    });

    return NextResponse.json(
      {
        message: "Activity recorded successfully",
        activity,
      },
      { status: 201 }
    );
  } catch (error) {
    if (
      error.message === "Unauthorized" ||
      error.message === "Invalid or expired API Key"
    ) {
      return NextResponse.json(
        { message: error.message },
        { status: 401 }
      );
    }

    console.error("Companion activity recording error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
