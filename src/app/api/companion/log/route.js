import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireApiKey } from "@/lib/requireApiKey";
import World from "@/models/World";
import Memory from "@/models/Memory";
import Coordinate from "@/models/Coordinate";
import WorldActivity from "@/models/WorldActivity";
import { normalizeDate } from "@/lib/utils/normalizeDate";

export const runtime = "nodejs";

// Regex helper to extract chat text and advancements
function parseLogLine(msg) {
  // 1. Check for standard Chat message:
  // E.g., "[15:10:42] [Render thread/INFO]: [System] [CHAT] <SamXop123> #journal message"
  // E.g., "[CHAT] <SamXop123> #journal message"
  // E.g., "<SamXop123> #journal message"
  const chatRegex = /(?:\[CHAT\]|<)\s*<?([a-zA-Z0-9_]{3,16})>?\s*(.*)$/;
  const chatMatch = msg.match(chatRegex);
  if (chatMatch) {
    return {
      type: "chat",
      sender: chatMatch[1],
      content: chatMatch[2].trim(),
    };
  }

  // 2. Check for Advancement message:
  // E.g., "[15:12:15] [Render thread/INFO]: [System] [CHAT] SamXop123 has made the advancement [Monster Hunter]"
  // E.g., "SamXop123 has made the advancement [Monster Hunter]"
  const advancementRegex = /(?:\[CHAT\]|\s|^)\s*([a-zA-Z0-9_]{3,16})\s+has\s+made\s+the\s+advancement\s+\[([^\]]+)\]/;
  const advMatch = msg.match(advancementRegex);
  if (advMatch) {
    return {
      type: "advancement",
      sender: advMatch[1],
      advancement: advMatch[2].trim(),
    };
  }

  return { type: "unknown", content: msg.trim() };
}

// Keyword-based memory categorizer
function categorizeMemory(text) {
  const lowercase = text.toLowerCase();
  if (lowercase.includes("died") || lowercase.includes("death") || lowercase.includes("killed") || lowercase.includes("slain")) {
    return "death";
  }
  if (lowercase.includes("built") || lowercase.includes("build") || lowercase.includes("house") || lowercase.includes("farm") || lowercase.includes("base") || lowercase.includes("project")) {
    return "build";
  }
  if (lowercase.includes("lol") || lowercase.includes("haha") || lowercase.includes("joke") || lowercase.includes("funny") || lowercase.includes("troll")) {
    return "funny";
  }
  if (lowercase.includes("love") || lowercase.includes("sad") || lowercase.includes("emotional") || lowercase.includes("feel") || lowercase.includes("rip") || lowercase.includes("miss")) {
    return "emotional";
  }
  return "achievement"; // fallback default
}

// Keyword-based coordinate categorizer
function categorizeCoordinate(label) {
  const lowercase = label.toLowerCase();
  if (lowercase.includes("base") || lowercase.includes("home") || lowercase.includes("house")) {
    return "base";
  }
  if (lowercase.includes("structure") || lowercase.includes("fortress") || lowercase.includes("monument") || lowercase.includes("temple") || lowercase.includes("village") || lowercase.includes("city") || lowercase.includes("spawner")) {
    return "structure";
  }
  if (lowercase.includes("diamond") || lowercase.includes("gold") || lowercase.includes("iron") || lowercase.includes("mine") || lowercase.includes("resource") || lowercase.includes("emerald") || lowercase.includes("ore")) {
    return "resource";
  }
  if (lowercase.includes("portal") || lowercase.includes("nether") || lowercase.includes("end")) {
    return "portal";
  }
  if (lowercase.includes("poi") || lowercase.includes("marker") || lowercase.includes("waypoint") || lowercase.includes("view") || lowercase.includes("lookout")) {
    return "poi";
  }
  return "other";
}

export async function POST(req) {
  try {
    await connectDB();

    const decoded = await requireApiKey(req);
    const { worldId, message, clipboard } = await req.json();

    if (!worldId || !message) {
      return NextResponse.json(
        { message: "worldId and message are required" },
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

    let logInfo = parseLogLine(message);

    // Fallback: If strict parser fails but message has #journal or #coords, parse it anyway
    if (logInfo.type === "unknown") {
      const idx = message.indexOf("#");
      if (idx !== -1) {
        const keywordPart = message.substring(idx).trim();
        if (
          keywordPart.toLowerCase().startsWith("#journal") ||
          keywordPart.toLowerCase().startsWith("#coords")
        ) {
          logInfo = {
            type: "chat",
            sender: "Player",
            content: keywordPart,
          };
        }
      }
    }

    // Fallback: If strict parser fails for advancement but message contains the phrase
    if (logInfo.type === "unknown" && message.includes("has made the advancement")) {
      const advRegex = /has\s+made\s+the\s+advancement\s+\[([^\]]+)\]/;
      const match = message.match(advRegex);
      if (match) {
        logInfo = {
          type: "advancement",
          advancement: match[1].trim(),
        };
      }
    }

    // 1. Process Advancement
    if (logInfo.type === "advancement") {
      const title = logInfo.advancement;
      const description = `Unlocked the advancement: [${title}]`;
      const category = "achievement";

      const memory = await Memory.create({
        worldId,
        title,
        category,
        description,
        memoryDate: new Date(),
        source: "auto_advancement",
      });

      // Update Activity
      const date = normalizeDate();
      await WorldActivity.findOneAndUpdate(
        { worldId, date },
        { $inc: { memoryCount: 1 }, $set: { played: true } },
        { upsert: true, new: true }
      );

      return NextResponse.json(
        { message: "Logged advancement memory", memory },
        { status: 201 }
      );
    }

    // 2. Process Chat Commands
    if (logInfo.type === "chat") {
      const content = logInfo.content;

      // Handle #journal
      if (content.toLowerCase().startsWith("#journal")) {
        const text = content.replace(/^#journal\s*/i, "").trim();

        if (!text) {
          return NextResponse.json(
            { message: "Journal text cannot be empty" },
            { status: 400 }
          );
        }

        const category = categorizeMemory(text);
        const title = text.length > 45 ? `${text.slice(0, 42)}...` : text;

        const memory = await Memory.create({
          worldId,
          title,
          category,
          description: text,
          memoryDate: new Date(),
          source: "manual",
        });

        // Update Activity
        const date = normalizeDate();
        await WorldActivity.findOneAndUpdate(
          { worldId, date },
          { $inc: { memoryCount: 1 }, $set: { played: true } },
          { upsert: true, new: true }
        );

        return NextResponse.json(
          { message: "Logged journal memory", memory },
          { status: 201 }
        );
      }

      // Handle #coords
      if (content.toLowerCase().startsWith("#coords")) {
        const payloadStr = content.replace(/^#coords\s*/i, "").trim();

        let label = "";
        let x, y, z;

        // Try manual parsing (checking for 3 numbers at the end)
        const manualRegex = /^(.*?)\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)$/;
        const manualMatch = payloadStr.match(manualRegex);

        if (manualMatch) {
          label = manualMatch[1].trim();
          x = Number(manualMatch[2]);
          y = Number(manualMatch[3]);
          z = Number(manualMatch[4]);
        } else if (clipboard) {
          // Fallback: check clipboard content
          // Matches standard Minecraft tp commands: e.g. "/tp @s 10 20 30" or "/execute... tp @s 10 20 30"
          const tpRegex = /(?:tp\s+@s\s+|tp\s+)(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/i;
          const tpMatch = clipboard.match(tpRegex);

          if (tpMatch) {
            label = payloadStr || "Waypoint";
            x = Number(tpMatch[1]);
            y = Number(tpMatch[2]);
            z = Number(tpMatch[3]);
          }
        }

        // If coordinates could not be parsed
        if (x === undefined || y === undefined || z === undefined) {
          return NextResponse.json(
            {
              message:
                "Could not parse coordinates. Make sure you typed X Y Z coordinates at the end of the message or pressed F3+C to copy your location first.",
            },
            { status: 400 }
          );
        }

        const category = categorizeCoordinate(label);

        const coordinate = await Coordinate.create({
          worldId,
          label,
          x,
          y,
          z,
          category,
        });

        // Mark today as played (saving coords is gameplay activity!)
        const date = normalizeDate();
        await WorldActivity.findOneAndUpdate(
          { worldId, date },
          { $set: { played: true } },
          { upsert: true }
        );

        return NextResponse.json(
          { message: `Saved coordinate: ${label} (${x}, ${y}, ${z})`, coordinate },
          { status: 201 }
        );
      }
    }

    // Default: Ignore other lines
    return NextResponse.json({ message: "Message ignored", ignored: true }, { status: 200 });
  } catch (error) {
    if (
      error.message === "Unauthorized" ||
      error.message === "Invalid or expired API Key"
    ) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }

    console.error("Companion log processing error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
