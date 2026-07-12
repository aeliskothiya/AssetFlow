const fs = require('fs');
const path = require('path');

const envCandidates = [path.resolve(__dirname, '.env'), path.resolve(__dirname, '..', '.env')];

for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath, override: true });
    break;
  }
}

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI is not configured. Add it to server/.env or the workspace root .env file.');
}

const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const { registerSocketHandlers } = require('./socket');

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
