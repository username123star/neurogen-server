/***********************
 * NEUROGEN SERVER
 * Clean, deterministic, Railway-safe
 ***********************/

import express from "express";
import cors from "cors";

/* ======================
   APP SETUP
====================== */
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

/* ======================
   CONSTANTS
====================== */
const MAX_MEMORY = 20;
let memory = [];

/* ======================
   TIME HELPERS
====================== */
function getNow() {
  const now = new Date();
  return {
    date: now.toUTCString().split(" ").slice(0, 4).join(" "),
    time: now.toUTCString().split(" ")[4],
    iso: now.toISOString()
  };
}

/* ======================
   INTENT HELPERS
====================== */
function wantsFixtures(text = "") {
  return /(fixture|fixtures|match|matches|football)/i.test(text);
}

function getDominantIntent(text = "") {
  if (wantsFixtures(text)) return "football_fixtures";
  if (/how|why|explain|what is/i.test(text)) return "explanation";
  return "general";
}

/* ======================
   FOOTBALL API (API-SPORTS)
   ENV: FOOTBALL_API
====================== */
async function fetchFixtures() {
  try {
    if (!process.env.FOOTBALL_API) {
      return "⚠️ Football API key not configured.";
    }

    const today = new Date().toISOString().split("T")[0];

    const res = await fetch(
      `https://v3.football.api-sports.io/fixtures?date=${today}`,
      {
        headers: {
          "x-apisports-key": process.env.FOOTBALL_API
        }
      }
    );

    const data = await res.json();

    if (!data.response || data.response.length === 0) {
      return "No football fixtures found for today.";
    }

    return data.response
      .slice(0, 10)
      .map(
        f =>
          `${f.teams.home.name} vs ${f.teams.away.name} (${f.league.name})`
      )
      .join("\n");

  } catch (err) {
    console.error("FIXTURE FETCH ERROR:", err);
    return "Unable to fetch football fixtures at the moment.";
  }
}

/* ======================
   MAIN CHAT ENDPOINT
====================== */
app.post("/ask", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.json({ reply: "Please enter a message." });
    }

    const now = getNow();
    const intent = getDominantIntent(userMessage);

    memory.push({ role: "user", content: userMessage });
    if (memory.length > MAX_MEMORY) memory.shift();

    let systemPrompt = "";

    if (intent === "football_fixtures") {
      const fixtures = await fetchFixtures();
      systemPrompt = `
You are NeuroGen, a football analysis AI.

Server time (UTC): ${now.date} ${now.time}

Below are REAL football fixtures:
${fixtures}

Rules:
- Do NOT invent matches
- Do NOT hallucinate odds
- Be clear and confident
      `;
    } else {
      systemPrompt = `
You are NeuroGen, an intelligent assistant.

Server time (UTC): ${now.date} ${now.time}

Rules:
- Answer only what is asked
- Do NOT invent data
- Be concise and accurate
      `;
    }

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            ...memory
          ]
        })
      }
    );

    const data = await response.json();
    const reply =
      data?.choices?.[0]?.message?.content ||
      "I could not generate a response.";

    memory.push({ role: "assistant", content: reply });
    if (memory.length > MAX_MEMORY) memory.shift();

    res.json({ reply });

  } catch (err) {
    console.error("ASK ERROR:", err);
    res.json({ reply: "Server error. Please try again." });
  }
});

/* ======================
   HEALTH CHECK
====================== */
app.get("/", (_, res) => {
  res.send("NeuroGen backend running.");
});

/* ======================
   START SERVER
====================== */
app.listen(PORT, () => {
  console.log(`NeuroGen running on port ${PORT}`);
});
