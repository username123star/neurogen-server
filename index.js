// NeuroGen – Simple Stable Chatbot (Reset Version)

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check (Railway needs this)
app.get("/", (req, res) => {
  res.json({ status: "NeuroGen backend running" });
});

// ONE function, ONE job: normal chat
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage || typeof userMessage !== "string") {
      return res.json({
        reply: "Say something and I’ll respond."
      });
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
            {
              role: "system",
              content:
                "You are NeuroGen, a calm, natural, human-like AI assistant."
            },
            {
              role: "user",
              content: userMessage
            }
          ],
          temperature: 0.7
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error("OpenAI error:", data.error);
      return res.json({
        reply: "I had trouble thinking for a moment. Try again."
      });
    }

    const reply =
      data.choices?.[0]?.message?.content ||
      "I’m here. Say that again.";

    res.json({ reply });

  } catch (err) {
    console.error("Server error:", err);
    res.json({
      reply: "Something went wrong, but I’m still here."
    });
  }
});

app.listen(PORT, () => {
  console.log(`NeuroGen running on port ${PORT}`);
});
