/**
 * MODELS (PURE LOGIC ONLY)
 * ------------------------
 * This file contains ZERO:
 * - API calls
 * - OpenAI calls
 * - Express logic
 *
 * Only math, weighting, probability, confidence.
 * This is what keeps the system stable.
 */

/* =========================
   TEAM STRENGTH MODEL
========================= */
/**
 * Normalize team strength from recent form
 */
function calculateTeamStrength({
  goalsFor,
  goalsAgainst,
  matches,
  home = false,
}) {
  if (!matches || matches <= 0) {
    return {
      attack: 1.0,
      defense: 1.0,
    };
  }

  const avgFor = goalsFor / matches;
  const avgAgainst = goalsAgainst / matches;

  // Home advantage (conservative)
  const homeBoost = home ? 1.08 : 1.0;

  return {
    attack: Number((avgFor * homeBoost).toFixed(2)),
    defense: Number((avgAgainst / homeBoost).toFixed(2)),
  };
}

/* =========================
   EXPECTED GOALS (xG-lite)
========================= */
function calculateExpectedGoals(home, away) {
  const homeXG = Math.max(
    0.4,
    Number((home.attack * away.defense).toFixed(2))
  );

  const awayXG = Math.max(
    0.3,
    Number((away.attack * home.defense).toFixed(2))
  );

  return {
    homeXG,
    awayXG,
    totalXG: Number((homeXG + awayXG).toFixed(2)),
  };
}

/* =========================
   MATCH VOLATILITY
========================= */
function calculateVolatility({ homeXG, awayXG }) {
  const diff = Math.abs(homeXG - awayXG);
  const total = homeXG + awayXG;

  let volatility = 0;

  if (total > 3.2) volatility += 2;
  if (diff > 1.5) volatility += 2;
  if (total < 1.4) volatility += 1;

  return {
    score: Math.min(volatility, 5),
    level:
      volatility >= 4
        ? "HIGH"
        : volatility >= 2
        ? "MEDIUM"
        : "LOW",
  };
}

/* =========================
   CORRECT SCORE PROBABILITY
========================= */
function generateScoreProbabilities(homeXG, awayXG) {
  const candidates = [
    { score: "0-0", h: 0, a: 0 },
    { score: "1-0", h: 1, a: 0 },
    { score: "2-0", h: 2, a: 0 },
    { score: "2-1", h: 2, a: 1 },
    { score: "1-1", h: 1, a: 1 },
    { score: "0-1", h: 0, a: 1 },
  ];

  const scored = candidates.map(c => {
    const distance =
      Math.abs(homeXG - c.h) + Math.abs(awayXG - c.a);

    return {
      score: c.score,
      weight: Number((1 / (distance + 1)).toFixed(3)),
    };
  });

  const totalWeight = scored.reduce((s, x) => s + x.weight, 0);

  return scored
    .map(s => ({
      score: s.score,
      probability: Number(
        ((s.weight / totalWeight) * 100).toFixed(1)
      ),
    }))
    .sort((a, b) => b.probability - a.probability);
}

/* =========================
   CONFIDENCE ENGINE
========================= */
function calculateConfidence({
  xg,
  volatility,
  psychologyRisk = 0,
}) {
  let confidence = 100;

  confidence -= volatility.score * 12;
  confidence -= psychologyRisk * 8;

  if (xg.totalXG < 1.5) confidence -= 10;
  if (xg.totalXG > 3.2) confidence -= 15;

  return Math.max(30, Math.min(confidence, 85));
}

/* =========================
   EXPORTS
========================= */
module.exports = {
  calculateTeamStrength,
  calculateExpectedGoals,
  calculateVolatility,
  generateScoreProbabilities,
  calculateConfidence,
};
