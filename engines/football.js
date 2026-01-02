/**
 * FOOTBALL ENGINE (FAIL-SAFE)
 * Responsibilities:
 * - Match analysis
 * - Psychology & motivation
 * - Correct score reasoning
 * GUARANTEE: Always returns a string
 */

const { callOpenAI } = require("../core/openai");
const { getNow } = require("../utils/time");
const { trace } = require("../utils/trace");

async function footballEngine({ message, fixtures = "" }) {
  try {
    trace("FOOTBALL_ENGINE_START");

    const now = getNow();

    // 🔒 Absolute fallback (used if anything fails)
    const fallbackReply = `
I couldn't complete a deep analysis right now.

General insight:
- Matches today are often tight
- Motivation, home advantage, and squad depth decide outcomes
- Common safe correct scores: 1-0, 1-1, 2-1

Try again shortly for deeper analysis.
`.trim();

    // 🧠 System prompt (psychology + score logic INCLUDED)
    const systemPrompt = `
You are NeuroGen, a professional football analysis AI.

Server time: ${now.date} ${now.time}

Your responsibilities:
- Tactical analysis
- Match psychology & motivation
- Correct score prediction with reasoning

Rules:
- Do NOT invent fixtures
- If data is insufficient, give probabilistic reasoning
- Always conclude with:
  • Likely outcome
  • 1–2 correct score candidates
  • Short psychology note

Available fixtures:
${fixtures || "No confirmed fixtures provided."}
`.trim();

    // 🧠 Call OpenAI WITH TIME SAFETY
    const response = await Promise.race([
      callOpenAI({
        system: systemPrompt,
        user: message,
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("OpenAI timeout")), 12_000)
      ),
    ]);

    // 🛑 Guard: OpenAI returned nothing
    if (!response || typeof response !== "string") {
      trace("FOOTBALL_ENGINE_EMPTY_RESPONSE");
      return fallbackReply;
    }

    trace("FOOTBALL_ENGINE_SUCCESS");
    return response;
  } catch (err) {
    trace("FOOTBALL_ENGINE_ERROR", err.message);

    // 🚑 FINAL GUARANTEE RESPONSE
    return `
Temporary analysis issue detected.

Quick football logic:
- Expect cautious starts
- Goals usually come after halftime
- Psychological pressure favors disciplined teams

Likely correct scores:
• 1-0
• 1-1
`.trim();
  }
}

module.exports = footballEngine;
