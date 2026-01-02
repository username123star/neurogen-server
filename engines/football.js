/**
 * FOOTBALL ENGINE — CRASH PROOF
 * This file MUST NEVER crash the server
 */

async function footballEngine({ message = "", fixtures = "" }) {
  try {
    const intro = "Football analysis based on logic, psychology, and probability.";

    const psychology = `
Psychology:
- Home teams play with emotional advantage
- Underdogs defend deeper under pressure
- Big teams rotate squads in low-priority fixtures
`.trim();

    const scoreLogic = `
Correct score reasoning:
- Tight matches → 1-0 or 1-1
- Open matches → 2-1 or 2-0
- Mismatch → 3-0 possibility
`.trim();

    const fixturesBlock = fixtures
      ? `Confirmed fixtures:\n${fixtures}`
      : "No confirmed fixtures available. Using general football logic.";

    return `
${intro}

User question:
${message}

${fixturesBlock}

${psychology}

${scoreLogic}

Final prediction style:
- Outcome: Balanced
- Likely scores: 1-0, 1-1
`.trim();
  } catch (err) {
    // ABSOLUTE FAILSAFE — EVEN THIS CANNOT CRASH
    return "Football engine fallback: Expect low-risk outcomes like 1-0 or 1-1.";
  }
}

module.exports = footballEngine;
