const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'not authenticated' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { username: payload.username };
    next();
  } catch {
    return res.status(401).json({ error: 'not authenticated' });
  }
}

module.exports = requireAuth;
