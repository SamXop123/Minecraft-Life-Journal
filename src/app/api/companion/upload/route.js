import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireApiKey } from "@/lib/requireApiKey";
import { uploadImage } from "@/lib/cloudinary";
import World from "@/models/World";
import Memory from "@/models/Memory";
import WorldActivity from "@/models/WorldActivity";
import { normalizeDate } from "@/lib/utils/normalizeDate";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB (screenshots can be high resolution)

export async function POST(req) {
  try {
    await connectDB();

    const decoded = await requireApiKey(req);

    const formData = await req.formData();
    const file = formData.get("file");
    const worldId = formData.get("worldId");

    if (!file) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 }
      );
    }

    if (!worldId) {
      return NextResponse.json(
        { message: "worldId is required" },
        { status: 400 }
      );
    }

    // Verify world exists and belongs to user
    const world = await World.findById(worldId);
    if (!world) {
      return NextResponse.json({ message: "World not found" }, { status: 404 });
    }
    if (world.userId.toString() !== decoded.userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { message: "Only image files are allowed" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: "File size must not exceed 8MB" },
        { status: 400 }
      );
    }

    const title = formData.get("title") || "Screenshot Captured";
    const description = formData.get("description") || "Automatically captured in-game screenshot.";
    const category = formData.get("category") || "achievement";

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const imageUrl = await uploadImage(buffer);

    // Create the Memory document in database
    const memory = await Memory.create({
      worldId,
      title,
      category,
      description,
      imageUrl,
      memoryDate: new Date(),
      source: "auto_screenshot",
    });

    // Record activity for today
    const date = normalizeDate();
    await WorldActivity.findOneAndUpdate(
      { worldId, date },
      { $inc: { memoryCount: 1 }, $set: { played: true } },
      { upsert: true }
    );

    return NextResponse.json(
      {
        message: "Screenshot uploaded and logged successfully",
        memory,
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

    console.error("Companion upload error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
