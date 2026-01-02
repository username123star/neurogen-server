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

// ===== NeuroGen Football Detection Layer (DORMANT, ADD-ONLY) =====
const FootballDetectionLayer = {
  keywords: [
    "football", "soccer", "match", "fixture", "fixtures",
    "goal", "goals", "league", "team", "club",
    "premier league", "la liga", "serie a", "bundesliga",
    "champions league", "ucl", "uel",
    "score", "result", "results",
    "odds", "bet", "betting", "prediction", "predict",
    "lineup", "formation", "referee", "injury", "squad"
  ],

  detect(text = "") {
    if (!text || typeof text !== "string") {
      return {
        isFootball: false,
        confidence: 0,
        matches: []
      };
    }

    const lower = text.toLowerCase();
    const matches = this.keywords.filter(k => lower.includes(k));

    const confidence = Math.min(
      1,
      matches.length / 5
    );

    return {
      isFootball: matches.length > 0,
      confidence,
      matches
    };
  }
};

// Expose safely (no execution)
global.NeuroGenFootballDetector = FootballDetectionLayer;

// ===== NeuroGen Routing Layer (DORMANT, ADD-ONLY) =====
const NeuroGenRouter = {
  route(message = "") {
    // Default route
    const routePlan = {
      route: "chat",        // chat | football | hybrid
      confidence: 0,
      reason: "default",
      meta: {}
    };

    // Safety check
    if (!message || typeof message !== "string") {
      return routePlan;
    }

    // Football intent detection (if available)
    if (global.NeuroGenFootballDetector) {
      const detection = global.NeuroGenFootballDetector.detect(message);

      if (detection.isFootball) {
        routePlan.route = "football";
        routePlan.confidence = detection.confidence;
        routePlan.reason = "football_detected";
        routePlan.meta.keywords = detection.matches;

        // Low confidence football questions can be hybrid later
        if (detection.confidence < 0.4) {
          routePlan.route = "hybrid";
          routePlan.reason = "mixed_intent";

          // ===== NeuroGen Hybrid Composer (DORMANT, ADD-ONLY) =====
const NeuroGenHybridComposer = {
  compose({ userMessage, chatReply, footballData, routePlan }) {
    // Default: pure chat
    if (!routePlan || routePlan.route === "chat") {
      return chatReply;
    }

    // Pure football (future)
    if (routePlan.route === "football") {
      return this.composeFootballOnly(userMessage, footballData);
    }

    // Hybrid response
    if (routePlan.route === "hybrid") {
      return this.composeHybrid(userMessage, chatReply, footballData);
    }

    // Fallback
    return chatReply;
  },

  composeFootballOnly(userMessage, footballData) {
    if (!footballData) {
      return "I can help with football analysis, but I need match data to proceed.";
    }

    return `
Here’s what I found based on current football data:

${JSON.stringify(footballData, null, 2)}
    `.trim();
  },

  composeHybrid(userMessage, chatReply, footballData) {
    let response = "";

    // Start with conversational intelligence
    if (chatReply) {
      response += chatReply.trim();
    }

    // Add football insight if available
    if (footballData) {
      response += `

Based on live football information:
${this.summarizeFootballData(footballData)}
      `.trim();
    }

    return response;
  },

  summarizeFootballData(data) {
    // Placeholder summarizer (no execution yet)
    return "Relevant match insights are available.";
  }
};

// Expose safely (no execution)
global.NeuroGenHybridComposer = NeuroGenHybridComposer;
        }
      }
    }

    return routePlan;
  }
};

// Expose safely (no execution)
global.NeuroGenRouter = NeuroGenRouter;

// ===== NeuroGen Execution Layer (GEN-2, ADD-ONLY) =====
app.post("/execute", async (req, res) => {
  try {
    const userMessage = req.body.message || "";

    // 1️⃣ Route decision
    const routePlan = global.NeuroGenRouter
      ? global.NeuroGenRouter.route(userMessage)
      : { route: "chat" };

    let footballData = null;

    // 2️⃣ Fetch football data if needed
    if (
      routePlan.route !== "chat" &&
      global.NeuroGenFootballFetcher &&
      global.NeuroGenFootballFetcher.isReady()
    ) {
      try {
        footballData = await global.NeuroGenFootballFetcher.getTodayMatches();
      } catch (e) {
        console.error("Football fetch failed:", e.message);
      }
    }

    // 3️⃣ Chat intelligence (OpenAI)
    const openaiRes = await fetch(
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
            {
              role: "system",
              content:
                "You are NeuroGen AI. Speak naturally, intelligently, and clearly."
            },
            { role: "user", content: userMessage }
          ],
          temperature: 0.7
        })
      }
    );

    const chatData = await openaiRes.json();
    const chatReply =
      chatData.choices?.[0]?.message?.content ||
      "I’m thinking about that.";

    // 4️⃣ Compose final response
    const finalReply = global.NeuroGenHybridComposer
      ? global.NeuroGenHybridComposer.compose({
          userMessage,
          chatReply,
          footballData,
          routePlan
        })
      : chatReply;

    res.json({
      reply: finalReply,
      route: routePlan
    });

  } catch (err) {
    console.error("Execution error:", err);
    res.json({
      reply: "Something interrupted my thinking. Try again."
    });
  }
});
