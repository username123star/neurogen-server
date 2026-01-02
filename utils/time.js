/**
 * TIME UTILITIES (UTC-SAFE)
 * ------------------------
 * No state, no globals, no side effects.
 * Used by engines and prompts for consistency.
 */

/**
 * Returns current UTC time in structured form
 */
function getNow() {
  const now = new Date();

  return {
    iso: now.toISOString(),                  // 2026-01-02T12:34:56.000Z
    date: now.toUTCString().slice(0, 16),    // Fri, 02 Jan 2026
    time: now.toUTCString().slice(17, 25),   // 12:34:56
    timestamp: now.getTime(),                // milliseconds
  };
}

/**
 * Returns today's date in YYYY-MM-DD (API friendly)
 */
function getTodayISO() {
  return new Date().toISOString().split("T")[0];
}

/**
 * Checks if a fixture time is in the future (UTC)
 */
function isFuture(isoDateTime) {
  if (!isoDateTime) return false;
  return new Date(isoDateTime).getTime() > Date.now();
}

module.exports = {
  getNow,
  getTodayISO,
  isFuture,
};
