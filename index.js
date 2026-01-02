const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

/**
 * NeuroGen Core Personality
 * This NEVER changes — future updates will ADD layers, not replace this.
 */
const SYSTEM_PROMPT = `
You are NeuroGen AI.
You speak like a calm, intelligent, humanoid assistant.
You are natural, thoughtful, and emotionally aware.
You do not sound robotic.
You respond like a real thinking entity.
`;

/**
 * Health check (important for Railway stability)
 */
app.get("/", (req, res) => {
  res.json({ status: "NeuroGen AI backend running" });
});

/**
 * Chat endpoint
 */
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage || userMessage.trim() === "") {
      return res.json({
        reply: "I’m here. Say something when you’re ready."
      });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage }
        ],
        temperature: 0.8
      })
    });

    const data = await response.json();

    const reply =
      data.choices?.[0]?.message?.content ||
      "I’m thinking… try saying that again.";

    res.json({ reply });

  } catch (error) {
    console.error("NeuroGen Error:", error);
    res.json({
      reply: "Something went quiet on my end. I’m still here though."
    });
  }
});

app.listen(PORT, () => {
  console.log(`NeuroGen AI running on port ${PORT}`);
});

// ===== NeuroGen Football Fetcher (DORMANT, ADD-ONLY) =====
const FootballFetcher = {
  baseURL: "https://api-football-v1.p.rapidapi.com/v3",
  apiKey: process.env.FOOTBALL_API_KEY || null,

  isReady() {
    return !!this.apiKey;
  },

  headers() {
    return {
      "X-RapidAPI-Key": this.apiKey,
      "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com"
    };
  },

  async fetch(endpoint, params = "") {
    if (!this.isReady()) {
      throw new Error("Football API key not set");
    }

    const url = `${this.baseURL}${endpoint}${params}`;

    const response = await fetch(url, {
      method: "GET",
      headers: this.headers()
    });

    if (!response.ok) {
      throw new Error(`Football API error: ${response.status}`);
    }

    return response.json();
  },

  // ---- Prepared methods (NOT used yet) ----
  getLiveMatches() {
    return this.fetch("/fixtures", "?live=all");
  },

  getTodayMatches() {
    return this.fetch("/fixtures", "?date=" + new Date().toISOString().slice(0, 10));
  },

  getTeam(teamId) {
    return this.fetch("/teams", `?id=${teamId}`);
  },

  getLeague(leagueId, season) {
    return this.fetch("/leagues", `?id=${leagueId}&season=${season}`);
  }
};

// Expose safely (no execution)
global.NeuroGenFootballFetcher = FootballFetcher;
