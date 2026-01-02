// =====================================================
// NEUROGEN — SINGLE FILE BACKEND (STABLE FOUNDATION)
// =====================================================

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// =====================================================
// HEALTH CHECK (DO NOT TOUCH)
// =====================================================
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

// =====================================================
// OPENAI LAZY LOADER (SAFE)
// =====================================================
let openaiClient = null;

function getOpenAI() {
  if (openaiClient) return openaiClient;

  const apiKey = process.env.OPENAI_KEY;
  if (!apiKey) return null;

  try {
    const OpenAI = require("openai");
    openaiClient = new OpenAI({ apiKey });
    return openaiClient;
  } catch (e) {
    return null;
  }
}

// =====================================================
// INTENT DETECTOR (HYBRID: RULES → AI FALLBACK)
// =====================================================
async function detectIntent(message) {
  const text = message.toLowerCase();

  // ---- RULE-BASED (FAST & FREE)
  if (
    text.includes("predict") ||
    text.includes("vs") ||
    text.includes("match") ||
    text.includes("odds") ||
    text.includes("bet")
  ) {
    return "football";
  }

  if (
    text.includes("feel") ||
    text.includes("tired") ||
    text.includes("confused") ||
    text.includes("sad") ||
    text.includes("lost")
  ) {
    return "psychology";
  }

  // ---- AI FALLBACK (ONLY IF NEEDED)
  const client = getOpenAI();
  if (!client) return "general";

  try {
    const intentCheck = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Classify the user's intent as one word only: football, psychology, or general."
        },
        { role: "user", content: message }
      ]
    });

    return intentCheck.choices[0].message.content.trim().toLowerCase();
  } catch {
    return "general";
  }
}

// =====================================================
// FOOTBALL ENGINE (LOGIC PLACEHOLDER)
// =====================================================
function footballEngine(message) {
  return {
    reply:
      "⚽ Football engine is active. Match analysis logic will be added next. For now, provide match details clearly."
  };
}

// =====================================================
// PSYCHOLOGY ENGINE (GROUNDING & DISCIPLINE)
// =====================================================
function psychologyEngine(message) {
  return {
    reply:
      "🧠 Take a breath. Stay grounded. Make decisions with clarity, not emotion. You are building discipline, not chasing impulses."
  };
}

// =====================================================
// GENERAL CHAT ENGINE
// =====================================================
async function generalEngine(message) {
  const client = getOpenAI();
  if (!client) {
    return { reply: "NeuroGen is online. How can I assist you?" };
  }

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: message }]
    });

    return { reply: completion.choices[0].message.content };
  } catch {
    return { reply: "Unable to process request at the moment." };
  }
}

// =====================================================
// MAIN AI CHAT ENDPOINT
// =====================================================
app.post("/ai/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const intent = await detectIntent(message);

    let response;
    if (intent === "football") {
      response = footballEngine(message);
    } else if (intent === "psychology") {
      response = psychologyEngine(message);
    } else {
      response = await generalEngine(message);
    }

    res.json({ reply: response.reply });
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// =====================================================
// SERVER START (ALWAYS LAST)
// =====================================================
app.listen(PORT, () => {
  console.log("NeuroGen backend running on port", PORT);
});

// =====================================================
// MEMORY SYSTEM (LIGHTWEIGHT, SAFE)
// =====================================================
const userMemory = {
  lastIntent: null,
  emotion: "neutral",
  riskLevel: "normal"
};

// =====================================================
// FOOTBALL ENGINE — REALISTIC ANALYSIS
// =====================================================
function footballEngine(message) {
  userMemory.lastIntent = "football";
  userMemory.riskLevel = "elevated";

  return {
    reply:
      "⚽ Analysis mode ON.\n" +
      "This match requires proper data (teams, league, timing).\n" +
      "Early assessment: avoid emotional picks, focus on form and motivation.\n" +
      "Confidence: MEDIUM.\n" +
      "Market suggestion will be generated once match details are clear."
  };
}

// =====================================================
// PSYCHOLOGY ENGINE — DISCIPLINE & GROUNDING
// =====================================================
function psychologyEngine(message) {
  userMemory.lastIntent = "psychology";

  const text = message.toLowerCase();

  if (
    text.includes("lost") ||
    text.includes("broke") ||
    text.includes("chasing") ||
    text.includes("angry")
  ) {
    userMemory.emotion = "tilted";
    return {
      reply:
        "🧠 Stop.\n" +
        "You are reacting emotionally.\n" +
        "Do NOT place any bet now.\n" +
        "Step away, reset your mind, and return with clarity."
    };
  }

  userMemory.emotion = "stable";
  return {
    reply:
      "🧠 You’re steady.\n" +
      "Maintain discipline.\n" +
      "Long-term control beats short-term excitement."
  };
}

// =====================================================
// RESPONSE COMPOSER (FINAL VOICE CONTROL)
// =====================================================
function composeResponse(intent, engineResponse) {
  return engineResponse.reply;
}

// =====================================================
// FOOTBALL ENGINE v1 — RULE-BASED (NO AI FLUFF)
// =====================================================

// Utility: simple team extraction
function extractTeams(message) {
  const parts = message.split("vs");
  if (parts.length === 2) {
    return {
      home: parts[0].trim(),
      away: parts[1].trim()
    };
  }
  return null;
}

// Utility: detect risky keywords
function detectRisk(message) {
  const text = message.toLowerCase();

  if (
    text.includes("must win") ||
    text.includes("all in") ||
    text.includes("sure") ||
    text.includes("banker")
  ) {
    return "high";
  }

  if (
    text.includes("friendly") ||
    text.includes("cup") ||
    text.includes("derby")
  ) {
    return "medium";
  }

  return "normal";
}

// Utility: choose market based on risk
function chooseMarket(risk) {
  if (risk === "high") {
    return "NO BET (High emotional risk)";
  }

  if (risk === "medium") {
    return "1X (Double Chance)";
  }

  return "Draw No Bet / Over 1.5 Goals";
}

// MAIN FOOTBALL ENGINE (OVERRIDES PLACEHOLDER)
function footballEngine(message) {
  userMemory.lastIntent = "football";

  const teams = extractTeams(message);
  const risk = detectRisk(message);
  const market = chooseMarket(risk);

  userMemory.riskLevel = risk;

  if (!teams) {
    return {
      reply:
        "⚽ Football Analysis Mode\n\n" +
        "Please use format: Team A vs Team B\n" +
        "Example: Arsenal vs Chelsea"
    };
  }

  return {
    reply:
      "⚽ Football Analysis\n\n" +
      `Match: ${teams.home} vs ${teams.away}\n` +
      `Risk Level: ${risk.toUpperCase()}\n` +
      `Suggested Market: ${market}\n` +
      "Confidence: MEDIUM\n\n" +
      "Note: Avoid emotional betting. Discipline first."
  };
}


  userMemory.riskLevel = risk;

  if (!teams) {
    return {
      reply:
        "⚽ Football Analysis Mode\n\n" +
        "Please use format: Team A vs Team B\n" +
        "Example: Arsenal vs Chelsea"
    };
  }

  return {
    reply:
      "⚽ Football Analysis\n\n" +
      `Match: ${teams.home} vs ${teams.away}\n` +
      `Risk Level: ${risk.toUpperCase()}\n` +
      `Suggested Market: ${market}\n` +
      "Confidence: MEDIUM\n\n" +
      "Note: Avoid emotional betting. Discipline first."
  };
}

// =====================================================
// FOOTBALL ENGINE v2 — GOAL MARKETS EXTENSION
// =====================================================

// Detect goal-related intent
function detectGoalPreference(message) {
  const text = message.toLowerCase();

  if (
    text.includes("over") ||
    text.includes("goals") ||
    text.includes("btts") ||
    text.includes("score")
  ) {
    return true;
  }

  return false;
}

// Decide goal market based on risk & context
function chooseGoalMarket(risk, message) {
  const text = message.toLowerCase();

  // Very risky language → block
  if (risk === "high") {
    return "NO GOAL BET (High risk language detected)";
  }

  // Defensive or unclear matches
  if (
    text.includes("final") ||
    text.includes("derby") ||
    text.includes("cup")
  ) {
    return "Under 3.5 Goals";
  }

  // Normal league matches
  return "Over 1.5 Goals / BTTS: Yes";
}

// OVERRIDE FOOTBALL ENGINE WITH GOAL LOGIC
function footballEngine(message) {
  userMemory.lastIntent = "football";

  const teams = extractTeams(message);
  const risk = detectRisk(message);
  const wantsGoals = detectGoalPreference(message);

  userMemory.riskLevel = risk;

  if (!teams) {
    return {
      reply:
        "⚽ Football Analysis Mode\n\n" +
        "Use format: Team A vs Team B\n" +
        "Example: Barcelona vs Sevilla"
    };
  }

  let market;
  if (wantsGoals) {
    market = chooseGoalMarket(risk, message);
  } else {
    market = chooseMarket(risk);
  }

  return {
    reply:
      "⚽ Football Analysis\n\n" +
      `Match: ${teams.home} vs ${teams.away}\n` +
      `Risk Level: ${risk.toUpperCase()}\n` +
      `Suggested Market: ${market}\n` +
      "Confidence: MEDIUM\n\n" +
      "Rule: Goal markets are safer than 1X2 when uncertainty is high."
  };
}

// =====================================================
// FOOTBALL API HELPER (LAZY, SAFE)
// =====================================================
async function fetchMatchInfo(home, away) {
  const apiKey = process.env.FOOTBALL_API_KEY;
  if (!apiKey) return null;

  try {
    const url =
      "https://api-football-v1.p.rapidapi.com/v3/fixtures?team=" +
      encodeURIComponent(home);

    const res = await fetch(url, {
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com"
      }
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data?.response?.[0] || null;
  } catch {
    return null;
  }
}

// =====================================================
// FOOTBALL ENGINE v3 — API + LOGIC (CONTROLLED)
// =====================================================
async function footballEngine(message) {
  userMemory.lastIntent = "football";

  const teams = extractTeams(message);
  const risk = detectRisk(message);
  const wantsGoals = detectGoalPreference(message);

  userMemory.riskLevel = risk;

  if (!teams) {
    return {
      reply:
        "⚽ Football Analysis\n\n" +
        "Use format: Team A vs Team B"
    };
  }

  // --- API assist (non-blocking)
  const matchInfo = await fetchMatchInfo(teams.home, teams.away);

  let market;
  if (wantsGoals) {
    market = chooseGoalMarket(risk, message);
  } else {
    market = chooseMarket(risk);
  }

  let apiNote = "API: not used";
  if (matchInfo) {
    apiNote = "API: match data detected (used as signal only)";
  }

  return {
    reply:
      "⚽ Football Analysis (Data-Assisted)\n\n" +
      `Match: ${teams.home} vs ${teams.away}\n` +
      `Risk Level: ${risk.toUpperCase()}\n` +
      `Suggested Market: ${market}\n` +
      "Confidence: MEDIUM\n\n" +
      apiNote +
      "\nRule: Data informs decisions — discipline controls bets."
  };
}
