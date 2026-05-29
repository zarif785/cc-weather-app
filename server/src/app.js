const express = require("express");
const cookieParser = require("cookie-parser");

function createApp({ io }) {
  const app = express();

  app.use(express.json());
  app.use(cookieParser());

  app.get("/api/health", (req, res) => {
    res.json({ ok: true });
  });
  return app;
}
module.exports = { createApp };
