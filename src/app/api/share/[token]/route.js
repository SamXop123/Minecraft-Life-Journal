import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import World from "@/models/World";
import Memory from "@/models/Memory";
import WorldActivity from "@/models/WorldActivity";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { token } = await params;

    // No .select() — we need all fields including isPublic to check access
    const world = await World.findOne({ shareToken: token });

    console.log(`[share] lookup token=${token} →`, world ? `id=${world._id} isPublic=${world.isPublic}` : "not found");

    if (!world || !world.isPublic) {
      return NextResponse.json(
        { message: "Shared world not found" },
        { status: 404 }
      );
    }

    const activities = await WorldActivity.find({ worldId: world._id });
    const totalPlaytimeMinutes = activities.reduce(
      (sum, act) => sum + (act.playtimeMinutes || 0),
      0
    );

    const worldObj = world.toObject();
    worldObj.playtimeMinutes = totalPlaytimeMinutes;

    const memories = await Memory.find({ worldId: world._id })
      .sort({ memoryDate: 1 })
      .select("title category description imageUrl memoryDate createdAt");

    return NextResponse.json({ world: worldObj, memories }, { status: 200 });
  } catch (error) {
    console.error("Public share fetch error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
