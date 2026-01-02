// ================================
// NeuroGen Backend (STABLE CORE)
// CommonJS | Railway Safe
// ================================

const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();

/* ================================
   MIDDLEWARE
================================ */
app.use(cors());
app.use(express.json());

/* ================================
   ENV CHECK
================================ */
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const PORT = process.env.PORT || 8080;

if (!OPENAI_KEY) {
  console.error("❌ OPENAI_API_KEY is missing");
}

/* ================================
   BASIC MEMORY (SAFE)
================================ */
const memory = [];
const MAX_MEMORY = 10;

/* ================================
   HELPERS
================================ */
function getNow() {
  const now = new Date();
  return {
    date: now.toDateString(),
    time: now.toLocaleTimeString(),
    iso: now.toISOString(),
  };
}

function trimMemory() {
  if (memory.length > MAX_MEMORY) {
    memory.splice(0, memory.length - MAX_MEMORY);
  }
}

/* ================================
   PSYCHOLOGY ANALYSIS (LIGHT)
================================ */
function analyzePsychology(text = "") {
  const t = text.toLowerCase();

  if (t.includes("pressure")) return "High-pressure scenario";
  if (t.includes("motivation")) return "Motivation-focused thinking";
  if (t.includes("fear")) return "Risk-averse mindset";
  if (t.includes("confidence")) return "Confidence-driven mindset";

  return "Neutral mindset";
}

/* ================================
   FOOTBALL LOGIC (SAFE STUB)
================================ */
function footballInsight(text = "") {
  const t = text.toLowerCase();

  if (t.includes("correct score")) {
    return "Correct score prediction requires team form, defense strength, and tempo.";
  }

  if (t.includes("odds")) {
    return "Odds reflect probability, market bias, and public sentiment.";
  }

  return null;
}

/* ================================
   OPENAI CALL (SAFE)
================================ */
async function callOpenAI(systemPrompt, userPrompt) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...memory,
        { role: "user", content: userPrompt },
      ],
    }),
  });

  const data = await res.json();
  return data?.choices?.[0]?.message?.content || "No response generated.";
}

/* ================================
   MAIN CHAT ENDPOINT
================================ */
app.post("/ask", async (req, res) => {
  try {
    const userMessage = req.body.message;
    if (!userMessage) {
      return res.json({ reply: "Please enter a message." });
    }

    const now = getNow();
    const psychology = analyzePsychology(userMessage);
    const football = footballInsight(userMessage);

    const systemPrompt = `
You are NeuroGen.
You are calm, logical, and precise.

Server time: ${now.date} ${now.time}
Psychology detected: ${psychology}

Rules:
- Do NOT invent data
- Do NOT hallucinate fixtures
- Be clear and concise
`;

    memory.push({ role: "user", content: userMessage });
    trimMemory();

    let reply;

    if (football) {
      reply = football;
    } else {
      reply = await callOpenAI(systemPrompt, userMessage);
    }

    memory.push({ role: "assistant", content: reply });
    trimMemory();

    res.json({ reply });
  } catch (err) {
    console.error("❌ ASK ERROR:", err);
    res.status(500).json({ reply: "Server error. Please try again." });
  }
});

/* ================================
   HEALTH CHECK
================================ */
app.get("/", (req, res) => {
  res.send("NeuroGen backend running.");
});

/* ================================
   START SERVER
================================ */
app.listen(PORT, () => {
  console.log(`✅ NeuroGen running on port ${PORT}`);
});
