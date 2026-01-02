const express = require('express');
const router = express.Router();

router.post('/chat', (req, res) => {
  res.status(501).json({
    message: 'AI logic not connected yet'
  });
});

module.exports = router;
