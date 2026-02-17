import { verifyAccessToken } from "@/lib/auth";

/**
 * Protect an API route by verifying the Bearer token from the Authorization header.
 *
 * @param {Request} req - The incoming request object.
 * @returns {Promise<object>} The decoded token payload (e.g. { userId, email }).
 * @throws {Error} If the token is missing, invalid, or expired.
 */
export async function requireAuth(req) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token);
    return decoded;
  } catch {
    throw new Error("Invalid or expired token");
  }
}
