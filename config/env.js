require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  OPENAI_KEY: process.env.OPENAI_KEY || null
};
