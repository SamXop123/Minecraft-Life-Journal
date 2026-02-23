import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import World from "@/models/World";
import Memory from "@/models/Memory";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { token } = await params;

    // No .select() — we need all fields including shareEnabled to check access
    const world = await World.findOne({ shareToken: token });

    console.log(`[share] lookup token=${token} →`, world ? `id=${world._id} shareEnabled=${world.shareEnabled}` : "not found");

    if (!world || !world.shareEnabled) {
      return NextResponse.json(
        { message: "Shared world not found" },
        { status: 404 }
      );
    }

    const memories = await Memory.find({ worldId: world._id })
      .sort({ memoryDate: 1 })
      .select("title category description imageUrl memoryDate createdAt");

    return NextResponse.json({ world, memories }, { status: 200 });
  } catch (error) {
    console.error("Public share fetch error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
