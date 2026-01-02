/**
 * NEUROGEN ENTRY POINT
 * -------------------
 * This file wires the system together.
 * NO business logic lives here.
 */

const express = require("express");
const cors = require("cors");

const { routeMessage } = require("./core/router");
const { trace } = require("./utils/trace");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

/* =========================
   MAIN ENDPOINT
========================= */
app.post("/ask", async (req, res) => {
  try {
    const message = req.body?.message;

    trace("REQUEST_RECEIVED", message);

    const reply = await routeMessage({
      message,
      memory: req.body?.memory || [],
      env: process.env,
    });

    res.json({ reply });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({
      reply: "Internal error. Please try again.",
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
