const express = require("express");

const router = express.Router();

function createMessagesRouter(io) {
  router.post("/messages", (req, res) => {
    const { city, country, message } = req.body;

    if (!city || !country || !message) {
      return res.status(400).json({ error: "city, country and message are required" });
    }

    const room = `city:${city.toLowerCase()}|${country.toLowerCase()}`;

    io.to(room).emit("message", {
      city,
      country,
      message,
      username: req.user.username,
      timestamp: new Date().toISOString(),
    });

    return res.json({ ok: true });
  });

  return router;
}

module.exports = createMessagesRouter;
