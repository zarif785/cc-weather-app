const express = require("express");
const requireApiKey = require("../middleware/requireApiKey");

const router = express.Router();

function createMessagesRouter(io) {
  router.post("/messages", requireApiKey, (req, res) => {
    const { city, state, message } = req.body;

    if (!city || !message) {
      return res.status(400).json({ error: "city and message are required" });
    }

    const room = `city:${city.toLowerCase()}|${(state || "").toLowerCase()}`;

    io.to(room).emit("message", {
      city,
      state,
      message,
      timestamp: new Date().toISOString(),
    });

    return res.json({ ok: true });
  });

  return router;
}

module.exports = createMessagesRouter;
