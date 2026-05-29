require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const { createApp } = require('./app');
const registerSocketHandlers = require('./socket/io');

const PORT = process.env.PORT || 3001

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
});

registerSocketHandlers(io);
const app = createApp({ io });
server.on('request', app);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});