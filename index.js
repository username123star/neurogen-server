import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

/* =========================
   FETCH REAL FIXTURES
========================= */
async function fetchTodayFixtures() {
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
      return "No football fixtures today.";
    }

    return data.response
      .slice(0, 8)
      .map(
        f =>
          `${f.teams.home.name} vs ${f.teams.away.name} (${f.league.name})`
      )
      .join("\n");

  } catch (err) {
    return "Unable to fetch fixtures right now.";
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

    // Detect fixture intent
    const wantsFixtures =
      /(fixture|fixtures|matches|football today|today's fixtures)/i.test(
        userMessage
      );

    let systemPrompt;

    if (wantsFixtures) {
      const liveFixtures = await fetchTodayFixtures();

      systemPrompt = `
You are NeuroGen, a football analysis AI.
ONLY use the fixtures below.
Do NOT invent matches.

Today's fixtures:
${liveFixtures}

Respond clearly and concisely.
`;
    } else {
      systemPrompt = `
You are NeuroGen, an intelligent assistant.
Respond naturally and helpfully.
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
            { role: "user", content: userMessage }
          ]
        })
      }
    );

    const data = await response.json();

    const reply =
      data.choices?.[0]?.message?.content ||
      "NeuroGen did not receive a valid response.";

    res.json({ reply });

  } catch (error) {
    res.json({ reply: "Server error. Please try again." });
  }
});

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.send("NeuroGen backend running.");
});

app.listen(PORT, () => {
  console.log(`NeuroGen running on port ${PORT}`);
});
