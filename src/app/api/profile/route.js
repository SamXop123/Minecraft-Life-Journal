import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";
import User from "@/models/User";

const PROFILE_FIELDS =
  "username email displayName realName age country experienceLevel favoriteGameModes favoriteActivities bio avatarUrl joinedAt createdAt";

export async function GET(req) {
  try {
    await connectDB();

    const decoded = await requireAuth(req);

    const user = await User.findById(decoded.userId).select(PROFILE_FIELDS);

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ profile: user }, { status: 200 });
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

    console.error("Get profile error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  try {
    await connectDB();

    const decoded = await requireAuth(req);
    const body = await req.json();

    console.log("[PATCH /api/profile] userId:", decoded.userId);
    console.log("[PATCH /api/profile] body:", JSON.stringify(body));

    const allowedFields = [
      "displayName",
      "realName",
      "age",
      "country",
      "experienceLevel",
      "favoriteGameModes",
      "favoriteActivities",
      "bio",
      "avatarUrl",
    ];

    // Build the update object from only fields present in the body
    const updateData = {};
    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    console.log("[PATCH /api/profile] updateData:", JSON.stringify(updateData));

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { $set: updateData },
      { new: true }
    ).select(PROFILE_FIELDS);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    console.log("[PATCH /api/profile] saved OK, displayName:", user.displayName);

    return NextResponse.json(
      { message: "Profile updated successfully", profile: user },
      { status: 200 }
    );
  } catch (error) {
    if (
      error.message === "Unauthorized" ||
      error.message === "Invalid or expired token"
    ) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }

    console.error("[PATCH /api/profile] error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
