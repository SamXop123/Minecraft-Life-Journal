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

    // Toggle favorite state
    memory.isFavorite = !memory.isFavorite;
    await memory.save();

    return NextResponse.json(
      {
        message: memory.isFavorite ? "Memory added to Favorites Wall" : "Memory removed from Favorites Wall",
        isFavorite: memory.isFavorite,
        memory,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    console.error("Favorite memory error:", error);
    return NextResponse.json(
      { message: "Server error toggling favorite" },
      { status: 500 }
    );
  }
}
