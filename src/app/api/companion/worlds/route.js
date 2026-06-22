import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireApiKey } from "@/lib/requireApiKey";
import World from "@/models/World";

export const runtime = "nodejs";

export async function GET(req) {
  try {
    await connectDB();

    const decoded = await requireApiKey(req);

    // Fetch the user's worlds, sorting by creation date (newest first)
    const worlds = await World.find({ userId: decoded.userId })
      .select("_id name mcVersion mode startedAt endedAt")
      .sort({ createdAt: -1 });

    return NextResponse.json({ worlds }, { status: 200 });
  } catch (error) {
    if (
      error.message === "Unauthorized" ||
      error.message === "Invalid or expired API Key"
    ) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }

    console.error("Companion fetch worlds error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
