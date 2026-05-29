const express = require('express');

const router = express.Router();

function createMessagesRouter(io) {
  router.post('/messages', (req, res) => {
    const { city, message } = req.body;

    if (!city || !message) {
      return res.status(400).json({ error: 'city and message are required' });
    }

    const room = `city:${city.toLowerCase()}`;

    io.to(room).emit('message', {
      city,
      message,
      username: req.user.username,
      timestamp: new Date().toISOString(),
    });

    return res.json({ ok: true });
  });

  return router;
}

module.exports = createMessagesRouter;
