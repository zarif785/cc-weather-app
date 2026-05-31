function requireApiKey(req, res, next) {
  if (req.header('x-api-key') !== process.env.MESSAGE_API_KEY) {
    return res.status(401).json({ error: 'invalid api key' });
  }
  next();
}

module.exports = requireApiKey;
