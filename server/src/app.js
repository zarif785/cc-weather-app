const express = require("express");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth");
const weatherRouter = require("./routes/weather");
const createMessagesRouter = require("./routes/messages");
const requireAuth = require("./middleware/requireAuth");

function createApp({ io }) {
  const app = express();

  app.use(express.json());
  app.use(cookieParser());

  app.get("/api/health", (req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/auth", authRouter);
  app.use("/api", requireAuth, weatherRouter);
  app.use("/api", requireAuth, createMessagesRouter(io));

  return app;
}
module.exports = { createApp };
