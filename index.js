/*************************************************
 * NEUROGEN BACKEND — PROFESSIONAL EDITION
 * Conservative Betting + On-Demand Correct Score
 * Node 22 / Railway Safe
 *************************************************/

import express from "express";
import cors from "cors";

/* =====================
   APP SETUP
===================== */
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;
const MAX_MEMORY = 20;
let memory = [];

/* =====================
   TIME HELPER
===================== */
function getNow() {
  const now = new Date();
  return {
    date: now.toUTCString().split(" ").slice(0, 4).join(" "),
    time: now.toUTCString().split(" ")[4],
    iso: now.toISOString()
  };
}

/* =====================
   INTENT HELPERS
===================== */
function wantsFixtures(text = "") {
  return /(fixture|fixtures|match|matches|football)/i.test(text);
}

function wantsCorrectScore(text = "") {
  return /(correct score|likely score|exact score|score prediction)/i.test(text);
}

/* =====================
   FOOTBALL API (API-SPORTS)
   ENV: FOOTBALL_API
===================== */
async function fetchFixtures() {
  try {
    if (!process.env.FOOTBALL_API) {
      return { error: "Football API key not configured." };
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
      return { error: "No fixtures found today." };
    }

    return { fixtures: data.response };

  } catch (err) {
    console.error("FIXTURE FETCH ERROR:", err);
    return { error: "Unable to fetch fixtures." };
  }
}

/* =====================
   STRENGTH + xG ENGINE
   (Simplified, Conservative)
===================== */
function calculateExpectedGoals(home, away) {
  const homeAttack = home.goalsFor / home.matches || 1.2;
  const homeDefense = home.goalsAgainst / home.matches || 1.2;
  const awayAttack = away.goalsFor / away.matches || 1.0;
  const awayDefense = away.goalsAgainst / away.matches || 1.0;

  const homeXG = Math.max(0.4, homeAttack * awayDefense);
  const awayXG = Math.max(0.3, awayAttack * homeDefense);

  return {
    homeXG: Number(homeXG.toFixed(2)),
    awayXG: Number(awayXG.toFixed(2))
  };
}

/* =====================
   VOLATILITY GATE
===================== */
function isLowVolatility(homeXG, awayXG) {
  const total = homeXG + awayXG;
  const diff = Math.abs(homeXG - awayXG);

  if (total > 3.2) return false;
  if (diff > 1.6) return false;

  return true;
}

/* =====================
   CORRECT SCORE ENGINE
   (ON DEMAND ONLY)
===================== */
function generateCorrectScores(homeXG, awayXG) {
  const scores = [
    { score: "1–0", weight: Math.abs(homeXG - 1) + Math.abs(awayXG - 0) },
    { score: "2–0", weight: Math.abs(homeXG - 2) + Math.abs(awayXG - 0) },
    { score: "2–1", weight: Math.abs(homeXG - 2) + Math.abs(awayXG - 1) },
    { score: "1–1", weight: Math.abs(homeXG - 1) + Math.abs(awayXG - 1) },
    { score: "0–0", weight: Math.abs(homeXG - 0) + Math.abs(awayXG - 0) }
  ];

  return scores
    .sort((a, b) => a.weight - b.weight)
    .slice(0, 3);
}

/* =====================
   MAIN CHAT ENDPOINT
===================== */
app.post("/ask", async (req, res) => {
  try {
    const userMessage = req.body.message;
    if (!userMessage) {
      return res.json({ reply: "Please enter a message." });
    }

    const now = getNow();
    memory.push({ role: "user", content: userMessage });
    if (memory.length > MAX_MEMORY) memory.shift();

    let reply = "";

    if (wantsFixtures(userMessage)) {
      const data = await fetchFixtures();

      if (data.error) {
        reply = data.error;
      } else {
        const fixture = data.fixtures[0];

        const home = {
          name: fixture.teams.home.name,
          goalsFor: fixture.teams.home.goals?.for?.total || 6,
          goalsAgainst: fixture.teams.home.goals?.against?.total || 5,
          matches: 5
        };

        const away = {
          name: fixture.teams.away.name,
          goalsFor: fixture.teams.away.goals?.for?.total || 5,
          goalsAgainst: fixture.teams.away.goals?.against?.total || 6,
          matches: 5
        };

        const { homeXG, awayXG } = calculateExpectedGoals(home, away);

        reply = `Match: ${home.name} vs ${away.name}
Expected goals:
• ${home.name}: ${homeXG}
• ${away.name}: ${awayXG}

Conservative markets only.`;

        if (wantsCorrectScore(userMessage)) {
          if (!isLowVolatility(homeXG, awayXG)) {
            reply += `

Correct score market rejected due to high volatility.`;
          } else {
            const scores = generateCorrectScores(homeXG, awayXG);
            reply += `

Most probable score range:
${scores.map(s => `• ${s.score}`).join("\n")}

Correct score confidence: LOW–MODERATE`;
          }
        }
      }
    } else {
      reply = "NeuroGen is running. Ask about football fixtures or analysis.";
    }

    memory.push({ role: "assistant", content: reply });
    if (memory.length > MAX_MEMORY) memory.shift();

    res.json({ reply });

  } catch (err) {
    console.error("ASK ERROR:", err);
    res.json({ reply: "Server error. Please try again." });
  }
});

/* =====================
   HEALTH CHECK
===================== */
app.get("/", (_, res) => {
  res.send("NeuroGen backend running.");
});

/* =====================
   START SERVER
===================== */
app.listen(PORT, () => {
  console.log(`NeuroGen running on port ${PORT}`);
});
