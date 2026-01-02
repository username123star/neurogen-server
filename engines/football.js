/**
 * FOOTBALL ENGINE
 * --------------------------------
 * Responsibilities:
 * - Football analysis
 * - Fixture reasoning
 * - Correct score prediction
 * - Match psychology & motivation
 *
 * NEVER:
 * - Talks about non-football topics
 * - Touches Express or routes
 */

const { callOpenAI } = require("../core/openai");
const { getNow } = require("../utils/time");
const { trace } = require("../utils/trace");

/**
 * Match psychology inference
 */
function analyzeMatchPsychology(text = "") {
  const lower = text.toLowerCase();

  return {
    mustWin: /must win|do or die|final|relegation|qualification/.test(lower),
    highRisk: /correct score|exact score|high odds/.test(lower),
    safeMode: /safe|low risk|sure|banker/.test(lower),
  };
}

/**
 * Correct score boundaries (anti-hallucination)
 */
function getScoreBounds(psychology) {
  if (psychology.highRisk) {
    return ["1-0", "2-0", "2-1", "1-1", "0-1"];
  }

  return ["1-0", "1-1", "2-1"];
}

/**
 * Builds football system prompt
 */
function buildFootballPrompt({ now, psychology, fixtures, scoreBounds }) {
  return `
You are NeuroGen — an elite football analysis AI.

Server time (UTC): ${now.date} ${now.time}

Fixtures provided below are REAL.
DO NOT invent matches.
DO NOT hallucinate odds.

Match psychology:
- Must-win: ${psychology.mustWin}
- High-risk request: ${psychology.highRisk}
- Safe mode: ${psychology.safeMode}

Allowed correct score predictions:
${scoreBounds.join(", ")}

Your tasks:
1. Analyze team strength & motivation
2. Predict match outcome
3. Provide ONE realistic correct score
4. Keep reasoning concise and confident

Fixtures:
${fixtures}
`;
}

/**
 * MAIN FOOTBALL ENGINE
 */
async function runFootballEngine({
  userMessage,
  fixtures,
  memory = [],
}) {
  trace("FOOTBALL_ENGINE_START");

  const now = getNow();
  const psychology = analyzeMatchPsychology(userMessage);
  const scoreBounds = getScoreBounds(psychology);

  const systemPrompt = buildFootballPrompt({
    now,
    psychology,
    fixtures,
    scoreBounds,
  });

  const messages = [
    { role: "system", content: systemPrompt },
    ...memory,
    { role: "user", content: userMessage },
  ];

  const reply = await callOpenAI({
    messages,
    temperature: psychology.highRisk ? 0.6 : 0.4,
  });

  trace("FOOTBALL_ENGINE_END");

  return {
    reply,
    psychology,
    scoreBounds,
  };
}

module.exports = {
  runFootballEngine,
};
