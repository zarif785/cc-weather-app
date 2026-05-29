const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;
const users = new Map();

async function createUser(username, password) {
  if (users.has(username)) {
    const err = new Error('Username taken');
    err.code = 'USERNAME_TAKEN';
    throw err;
  }
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = { username, passwordHash };
  users.set(username, user);
  return { username };
}

async function findUser(username, password) {
  const user = users.get(username);
  if (!user) return null;
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return null;
  return { username: user.username };
}

function resetUsers() {
  users.clear();
}

module.exports = { createUser, findUser, resetUsers };
