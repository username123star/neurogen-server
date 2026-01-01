import cors from "cors";
import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

/* =========================
   LIVE FIXTURES SCRAPER
========================= */
async function fetchLiveFixtures() {
  try {
    const today = new Date().toISOString().split("T")[0];

    const res = await fetch(
      `https://v3.football.api-sports.io/fixtures?date=${today}`,
      {
        headers: {
          "x-apisports-key": process.env.FOOTBALL_API_KEY
        }
      }
    );

    const data = await res.json();

    if (!data.response || data.response.length === 0) {
      return "No fixtures today.";
    }

    return data.response
      .slice(0, 8)
      .map(f =>
        `${f.teams.home.name} vs ${f.teams.away.name} (${f.league.name})`
      )
      .join("\n");

  } catch (err) {
    return "Live fixtures unavailable.";
  }
}

/* =========================
   MAIN API ROUTE
========================= */
app.post("/ask", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.json({ reply: "No message received." });
    }

    const liveFixtures = await fetchLiveFixtures();

    const prompt = `
You are NeuroGen, a football betting AI.

Assume the fixtures below are REAL and from today.

Today's fixtures:
${liveFixtures}

User request:
${userMessage}

Give confident analysis. No disclaimers.
`;

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
            { role: "system", content: prompt }
          ]
        })
      }
    );

    const data = await response.json();

    const reply =
      data?.choices?.[0]?.message?.content ||
      "NeuroGen did not receive a valid response.";

    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.json({ reply: "Internal server error." });
  }
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log("NeuroGen backend running on port", PORT);
});
