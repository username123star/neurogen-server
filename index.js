import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

/* =========================
   MEMORY (SAFE, CAPPED)
========================= */
let memory = [];
const MAX_MEMORY = 20;

/* =========================
   TIME HELPERS
========================= */
function getNow() {
  const now = new Date();
  return {
    date: now.toDateString(),
    time: now.toLocaleTimeString(),
    iso: now.toISOString(),
  };
}

/* =========================
   INTENT DETECTION
========================= */
function wantsFixtures(text = "") {
  return /(fixture|fixtures|matches|games|football today|today)/i.test(text);
}

/* =========================
   REAL FOOTBALL API
   Railway Variable: FOOTBALL_API
========================= */
async function fetchFixtures() {
  try {
    if (!process.env.FOOTBALL_API) {
      return "Football API key is not configured.";
    }

    const today = new Date();
    const tomorrow = new Date(Date.now() + 86400000);
    const format = d => d.toISOString().split("T")[0];

    const fetchDay = async (day) => {
      const res = await fetch(
        `https://v3.football.api-sports.io/fixtures?date=${format(day)}`,
        {
          headers: {
            "x-apisports-key": process.env.FOOTBALL_API,
          },
        }
      );
      return res.json();
    };

    let data = await fetchDay(today);

    if (!data.response || data.response.length === 0) {
      data = await fetchDay(tomorrow);
    }

    if (!data.response || data.response.length === 0) {
      return "No football fixtures found for today or tomorrow.";
    }

    return data.response
      .slice(0, 8)
      .map(
        f =>
          `${f.teams.home.name} vs ${f.teams.away.name} (${f.league.name})`
      )
      .join("\n");

  } catch (err) {
    return "Unable to fetch football fixtures right now.";
  }
}

/* =========================
   MAIN CHAT ENDPOINT
========================= */
app.post("/ask", async (req, res) => {
  try {
    const userMessage = req.body.message?.trim();
    if (!userMessage) {
      return res.json({ reply: "Please enter a message." });
    }

    const now = getNow();

    // store user message
    memory.push({ role: "user", content: userMessage });
    if (memory.length > MAX_MEMORY) memory.shift();

    let systemPrompt;

    if (wantsFixtures(userMessage)) {
      const fixtures = await fetchFixtures();

      systemPrompt = `
You are NeuroGen, a football analysis AI.

As of ${now.date}, ${now.time} (UTC server time):

The following are REAL fixtures from a live football API:
${fixtures}

Rules:
- Do not invent matches.
- Do not mention training data.
- Be confident and concise.
`;
    } else {
      systemPrompt = `
You are NeuroGen, an intelligent assistant.

As of ${now.date}, ${now.time}:

Respond naturally, clearly, and helpfully.
`;
    }

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            ...memory,
            { role: "user", content: userMessage },
          ],
        }),
      }
    );

    const data = await response.json();

    const reply =
      data?.choices?.[0]?.message?.content ||
      "I could not generate a response.";

    // store assistant reply
    memory.push({ role: "assistant", content: reply });
    if (memory.length > MAX_MEMORY) memory.shift();

    res.json({ reply });

  } catch (err) {
    console.error("ASK ERROR:", err);
    res.json({ reply: "Server error. Please try again." });
  }
});

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.send("NeuroGen backend running.");
});

/* =========================
   START SERVER
========================= */
app.listen(PORT, () => {
  console.log(`NeuroGen running on port ${PORT}`);
});
