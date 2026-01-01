import cors from "cors";
import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());
app.use(cors());

app.post("/ask", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.json({ reply: "No message received." });
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
                "You are NeuroGen AI. Be disciplined, analytical, direct, and never reckless."
            },
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
    res.json({ reply: "NeuroGen backend error." });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("NeuroGen backend running on port", PORT);
});
