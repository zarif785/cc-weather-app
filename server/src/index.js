require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const { createApp } = require('./app');
const registerSocketHandlers = require('./socket/io');

const PORT = process.env.PORT || 3001;

const io = new Server();
registerSocketHandlers(io);

const app = createApp({ io });
const server = http.createServer(app);

io.attach(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
