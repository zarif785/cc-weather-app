const jwt = require('jsonwebtoken');
const cookie = require('cookie');

function registerSocketHandlers(io) {
  io.use((socket, next) => {
    const raw = socket.handshake.headers.cookie || '';
    const cookies = cookie.parse(raw);
    const token = cookies.token;

    if (!token) {
      return next(new Error('unauthorized'));
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.data.user = { username: payload.username };
      next();
    } catch {
      next(new Error('unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('join-city', ({ city, state }) => {
      const room = `city:${city.toLowerCase()}|${(state || '').toLowerCase()}`;
      socket.rooms.forEach((r) => {
        if (r.startsWith('city:')) socket.leave(r);
      });
      socket.join(room);
    });

    socket.on('leave-city', ({ city, state }) => {
      const room = `city:${city.toLowerCase()}|${(state || '').toLowerCase()}`;
      socket.leave(room);
    });
  });
}

module.exports = registerSocketHandlers;
