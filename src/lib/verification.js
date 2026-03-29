import crypto from "crypto";

const DEFAULT_CODE_LENGTH = 6;
const DEFAULT_EXPIRY_MINUTES = 10;

/**
 * Generate a numeric one-time verification code.
 * @returns {string} Zero-padded verification code.
 */
export function generateVerificationCode() {
  const min = 10 ** (DEFAULT_CODE_LENGTH - 1);
  const max = 10 ** DEFAULT_CODE_LENGTH;
  return String(crypto.randomInt(min, max));
}

/**
 * Hash a verification code before storing it.
 * @param {string} code - Raw verification code.
 * @returns {string} Deterministic hash of the code.
 */
export function hashVerificationCode(code) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

/**
 * Build an expiry date for verification codes.
 * @param {number} minutes - Validity duration in minutes.
 * @returns {Date} Expiry timestamp.
 */
export function createVerificationExpiry(minutes = DEFAULT_EXPIRY_MINUTES) {
  return new Date(Date.now() + minutes * 60 * 1000);
}
