const express = require('express');
const jwt = require('jsonwebtoken');
const { createUser, findUser } = require('../store/userStore');

const router = express.Router();

const COOKIE_NAME = 'token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 24 * 60 * 60 * 1000,
};

router.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'username and password required' });
  }

  try {
    await createUser(username, password);
    const token = jwt.sign({ username }, process.env.JWT_SECRET);
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
    return res.status(201).json({ username });
  } catch (err) {
    if (err.code === 'USERNAME_TAKEN') {
      return res.status(409).json({ error: 'username taken' });
    }
    return res.status(500).json({ error: 'server error' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'username and password required' });
  }

  const user = await findUser(username, password);
  if (!user) {
    return res.status(401).json({ error: 'invalid credentials' });
  }

  const token = jwt.sign({ username }, process.env.JWT_SECRET);
  res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
  return res.json({ username });
});

router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME);
  return res.json({ ok: true });
});

router.get('/me', (req, res) => {
  const token = req.cookies[COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ error: 'not authenticated' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ username: payload.username });
  } catch {
    return res.status(401).json({ error: 'not authenticated' });
  }
});

module.exports = router;
