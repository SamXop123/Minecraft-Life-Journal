import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SALT_ROUNDS = 10;

/**
 * Hash a plain-text password using bcryptjs.
 * @param {string} password - The plain-text password to hash.
 * @returns {Promise<string>} The hashed password.
 */
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}

/**
 * Compare a plain-text password against a hashed password.
 * @param {string} password - The plain-text password.
 * @param {string} hashedPassword - The stored hashed password.
 * @returns {Promise<boolean>} Whether the passwords match.
 */
export async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate a short-lived JWT access token.
 * @param {object} payload - Data to encode in the token.
 * @returns {string} Signed JWT access token (expires in 15 minutes).
 */
export function generateAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });
}

/**
 * Generate a long-lived JWT refresh token.
 * @param {object} payload - Data to encode in the token.
 * @returns {string} Signed JWT refresh token (expires in 7 days).
 */
export function generateRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
}

/**
 * Verify and decode a JWT access token.
 * @param {string} token - The JWT access token to verify.
 * @returns {object} The decoded payload.
 * @throws {Error} If the token is invalid or expired.
 */
export function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}

/**
 * Verify and decode a JWT refresh token.
 * @param {string} token - The JWT refresh token to verify.
 * @returns {object} The decoded payload.
 * @throws {Error} If the token is invalid or expired.
 */
export function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

/**
 * Attach the refresh token cookie to a NextResponse instance.
 * @param {import("next/server").NextResponse} response - Response to mutate.
 * @param {string} refreshToken - Signed refresh token.
 * @returns {import("next/server").NextResponse} The same response instance.
 */
export function attachRefreshTokenCookie(response, refreshToken) {
  response.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });

  return response;
}
