import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import World from "@/models/World";
import Memory from "@/models/Memory";
import WorldActivity from "@/models/WorldActivity";
import User from "@/models/User";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const world = await World.findById(id).populate("userId", "username displayName");

    if (!world) {
      return NextResponse.json(
        { message: "World not found" },
        { status: 404 }
      );
    }

    if (!world.isPublic) {
      return NextResponse.json(
        { message: "This world is private" },
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

    const memories = await Memory.find({ worldId: id }).sort({
      memoryDate: 1,
    });

    return NextResponse.json({ world: worldObj, memories }, { status: 200 });
  } catch (error) {
    console.error("Public world fetch error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
