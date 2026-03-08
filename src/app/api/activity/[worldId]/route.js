import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";
import WorldActivity from "@/models/WorldActivity";
import { normalizeDate } from "@/lib/utils/normalizeDate";

export async function GET(req, { params }) {
  try {
    await connectDB();

    await requireAuth(req);

    const { worldId } = await params;

    if (!worldId) {
      return NextResponse.json(
        { message: "worldId is required" },
        { status: 400 }
      );
    }

    const today = normalizeDate();
    const sixMonthsAgo = new Date(today);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const activity = await WorldActivity.find({
      worldId,
      date: { $gte: sixMonthsAgo },
    }).sort({ date: 1 });

    return NextResponse.json({ activity });
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

    console.error("Heatmap data error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
