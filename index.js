/**
 * NEUROGEN ENTRY POINT (COMMONJS)
 * --------------------------------
 * Responsibilities:
 * - Receive requests
 * - Run psychology observer
 * - Detect intent
 * - Route to correct engine
 * - Return response
 *
 * NO business logic lives here.
 */

const express = require("express");
const cors = require("cors");

/* === CORE === */
const { analyzePsychology } = require("./core/psychology");
const { routeMessage } = require("./core/router");

/* === UTILS === */
const { trace } = require("./utils/trace");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

/* =========================
   MAIN API ENDPOINT
========================= */
app.post("/ask", async (req, res) => {
  try {
    const message = req.body?.message;

    if (!message || typeof message !== "string") {
      return res.json({
        reply: "Please enter a valid message.",
      });
    }

    trace("REQUEST_RECEIVED", message);

    /* --- Psychology always runs first (observer only) --- */
    const psychology = analyzePsychology(message);

    /* --- Route to correct engine --- */
    const reply = await routeMessage({
      message,
      psychology,
      memory: req.body?.memory || [],
      env: process.env,
    });

    res.json({ reply });
  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({
      reply: "Internal server error. Please try again.",
    });
  }
});

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (_, res) => {
  res.send("NeuroGen backend running.");
});

/* =========================
   START SERVER
========================= */
app.listen(PORT, () => {
  console.log(`NeuroGen running on port ${PORT}`);
});
