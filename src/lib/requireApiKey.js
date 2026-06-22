import crypto from "crypto";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

/**
 * Hash the raw API Key using SHA-256
 * @param {string} key - The raw API key
 * @returns {string} - The SHA-256 hex digest
 */
export function hashApiKey(key) {
  return crypto.createHash("sha256").update(key).digest("hex");
}

/**
 * Protect a companion API route by verifying the X-API-Key header.
 *
 * @param {Request} req - The incoming request object.
 * @returns {Promise<object>} The user info (e.g. { userId, email }).
 * @throws {Error} If the API key is missing or invalid.
 */
export async function requireApiKey(req) {
  const apiKey = req.headers.get("x-api-key");

  if (!apiKey) {
    throw new Error("Unauthorized");
  }

  await connectDB();

  const hashedKey = hashApiKey(apiKey);
  const user = await User.findOne({ apiKeyHash: hashedKey });

  if (!user) {
    throw new Error("Invalid or expired API Key");
  }

  // Update last used timestamp in the background
  User.updateOne({ _id: user._id }, { $set: { apiKeyLastUsedAt: new Date() } }).catch((err) => {
    console.error("Failed to update API key last used timestamp:", err);
  });

  return {
    userId: user._id.toString(),
    email: user.email,
  };
}
