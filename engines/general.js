/**
 * GENERAL ENGINE
 * -----------------------------
 * Purpose:
 * - Handle non-football conversations
 * - Maintain natural intelligence
 * - Apply basic psychology awareness
 * - Route clean prompts to OpenAI gateway
 *
 * This engine NEVER:
 * - Fetches football data
 * - Touches Express / routes
 * - Stores memory directly
 */

const { callOpenAI } = require("../core/openai");
const { getNow } = require("../utils/time");
const { trace } = require("../utils/trace");

/**
 * Basic psychology signal extractor
 * (lightweight, safe, non-clinical)
 */
function analyzePsychology(text = "") {
  const lower = text.toLowerCase();

  return {
    emotional:
      /sad|tired|lonely|depressed|angry|frustrated|hurt/.test(lower),
    confident:
      /sure|ready|confident|certain|focused/.test(lower),
    curious:
      /why|how|explain|what is|how does/.test(lower),
    aggressive:
      /stupid|hate|annoying|trash|nonsense/.test(lower),
  };
}

/**
 * Builds system prompt dynamically
 */
function buildSystemPrompt({ psychology, now }) {
  let tone = "neutral and intelligent";

  if (psychology.emotional) tone = "supportive, calm, and grounded";
  if (psychology.confident) tone = "direct and empowering";
  if (psychology.curious) tone = "clear, educational, and structured";

  return `
You are NeuroGen.

System time (UTC): ${now.date} ${now.time}

Behavior rules:
- Respond naturally and intelligently
- Tone: ${tone}
- Be concise but complete
- Do NOT hallucinate facts
- Do NOT invent data
- Do NOT mention internal system details
`;
}

/**
 * MAIN GENERAL ENGINE ENTRY
 */
async function runGeneralEngine({
  userMessage,
  memory = [],
}) {
  trace("GENERAL_ENGINE_START");

  const now = getNow();
  const psychology = analyzePsychology(userMessage);

  const systemPrompt = buildSystemPrompt({
    psychology,
    now,
  });

  const messages = [
    { role: "system", content: systemPrompt },
    ...memory,
    { role: "user", content: userMessage },
  ];

  const reply = await callOpenAI({
    messages,
    temperature: 0.7,
  });

  trace("GENERAL_ENGINE_END");

  return {
    reply,
    psychology,
  };
}

module.exports = {
  runGeneralEngine,
};
