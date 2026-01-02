/**
 * NeuroGen – Main Server Entry
 * Stable • CommonJS • Railway-safe
 */

const express = require("express");
const cors = require("cors");

// ---- Core Utilities ----
const { getNow } = require("./utils/time");
const { trace } = require("./utils/trace");

// ---- Engines ----
const footballEngine = require("./engines/football");
const generalEngine = require("./engines/general");

// ---- App Init ----
const app = express();
const PORT = process.env.PORT || 8080;

// ---- Middleware ----
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// ---- Health Check (CRITICAL FOR RAILWAY) ----
app.get("/", (req, res) => {
  res.status(200).send("NeuroGen backend running.");
});

// ---- Main Chat Endpoint ----
app.post("/ask", async (req, res) => {
  try {
    const userMessage = req.body?.message;

    if (!userMessage || typeof userMessage !== "string") {
      return res.status(400).json({
        reply: "Please send a valid message."
      });
    }

    trace("USER_MESSAGE", userMessage);

    const now = getNow();
    let reply;

    /**
     * ROUTING LOGIC
     * Engines decide intelligence
     * index.js only coordinates
     */
    if (/fixture|fixtures|match|odds|score|prediction/i.test(userMessage)) {
      reply = await footballEngine.handle({
        message: userMessage,
        now
      });
    } else {
      reply = await generalEngine.handle({
        message: userMessage,
        now
      });
    }

    return res.json({ reply });

  } catch (err) {
    console.error("ASK ERROR:", err);
    return res.status(500).json({
      reply: "Internal server error. Please try again."
    });
  }
});

// ---- Server Start ----
app.listen(PORT, () => {
  console.log(`NeuroGen running on port ${PORT}`);
});
