const express = require('express');
const router = express.Router();
const { getOpenAI } = require('../services/openai');

router.post('/chat', async (req, res) => {
  try {
    const client = getOpenAI();

    if (!client) {
      return res.status(503).json({
        error: 'AI service unavailable'
      });
    }

    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        error: 'Message is required'
      });
    }

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: message }]
    });

    res.json({
      reply: completion.choices[0].message.content
    });

  } catch (err) {
    res.status(500).json({
      error: 'AI request failed'
    });
  }
});

module.exports = router;
