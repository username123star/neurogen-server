const logger = require('../utils/logger');

let client = null;

function getOpenAI() {
  if (client) return client;

  const apiKey = process.env.OPENAI_KEY;

  if (!apiKey) {
    logger.warn('OPENAI_KEY not set');
    return null;
  }

  try {
    const OpenAI = require('openai');
    client = new OpenAI({ apiKey });
    return client;
  } catch (err) {
    logger.error('Failed to load OpenAI client');
    return null;
  }
}

module.exports = { getOpenAI };
