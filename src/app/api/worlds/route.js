import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import World from "@/models/World";
import WorldActivity from "@/models/WorldActivity";
import { requireAuth } from "@/lib/requireAuth";

export async function GET(req) {
  try {
    await connectDB();

    const decoded = await requireAuth(req);

    const worlds = await World.find({ userId: decoded.userId }).sort({
      createdAt: -1,
    });

    // Aggregate playtime for all returned worlds
    const worldIds = worlds.map((w) => w._id);
    const playtimeAgg = await WorldActivity.aggregate([
      { $match: { worldId: { $in: worldIds } } },
      {
        $group: {
          _id: "$worldId",
          totalPlaytime: { $sum: "$playtimeMinutes" },
        },
      },
    ]);

    const playtimeMap = playtimeAgg.reduce((acc, curr) => {
      acc[curr._id.toString()] = curr.totalPlaytime;
      return acc;
    }, {});

    const worldsWithPlaytime = worlds.map((world) => {
      const worldObj = world.toObject();
      worldObj.playtimeMinutes = playtimeMap[world._id.toString()] || 0;
      return worldObj;
    });

    return NextResponse.json({ worlds: worldsWithPlaytime }, { status: 200 });
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

    console.error("Fetch worlds error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();

    const decoded = await requireAuth(req);

    const { name, mcVersion, seed, mode, type, startedAt } = await req.json();

    // Validate required fields
    if (!name || !mcVersion || !mode || !type || !startedAt) {
      return NextResponse.json(
        { message: "Name, mcVersion, mode, type, and startedAt are required" },
        { status: 400 }
      );
    }

    const world = await World.create({
      userId: decoded.userId,
      name,
      mcVersion,
      seed: seed || undefined,
      mode,
      type,
      startedAt,
      isPublic: false,
    });

    return NextResponse.json(
      {
        message: "World created successfully",
        world,
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

    console.error("World creation error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
