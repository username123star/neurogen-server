const express = require("express");
const cors = require("cors");

const app = express();

// ====== BASIC MIDDLEWARE ======
app.use(cors());
app.use(express.json());

// ====== HEALTH CHECK (CRITICAL) ======
app.get("/", (req, res) => {
  res.status(200).send("NeuroGen backend running.");
});

// ====== CHAT ENDPOINT (SAFE STUB) ======
app.post("/ask", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        reply: "No message provided."
      });
    }

    // TEMP RESPONSE (NO OPENAI YET)
    return res.json({
      reply: `Received: ${message}`
    });

  } catch (err) {
    console.error("ASK ERROR:", err);
    return res.status(500).json({
      reply: "Internal server error."
    });
  }
});

// ====== START SERVER ======
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`NeuroGen listening on port ${PORT}`);
});
