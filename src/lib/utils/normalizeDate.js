/**
 * Normalize a date to midnight UTC (strips hours, minutes, seconds, ms).
 * Ensures only one activity record per world per calendar day.
 *
 * @param {Date} [date] - The date to normalize. Defaults to now.
 * @returns {Date} The normalized date at 00:00:00.000 UTC.
 */
export function normalizeDate(date = new Date()) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}
