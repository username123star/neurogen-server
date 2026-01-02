const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/health', require('./routes/health'));
app.use('/ai', require('./routes/ai'));

module.exports = app;
