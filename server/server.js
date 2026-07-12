require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const registerSocketHandlers = require('./socket');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  registerSocketHandlers(io);

  server.listen(PORT, () => {
    console.log(`AssetFlow API listening on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error('Server bootstrap failed:', error.message);
  process.exit(1);
});
