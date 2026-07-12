let ioInstance;
const userSockets = new Map();

const registerSocketHandlers = (io) => {
  ioInstance = io;
  
  io.on('connection', (socket) => {
    socket.emit('connected', {
      success: true,
      message: 'Socket connected',
      socketId: socket.id,
    });

    socket.on('register', (userId) => {
      userSockets.set(userId, socket.id);
      socket.userId = userId;
    });

    socket.on('disconnect', () => {
      if (socket.userId) {
        userSockets.delete(socket.userId);
      }
    });
  });
};

const sendNotificationToUser = (userId, notification) => {
  if (!ioInstance) return;
  const socketId = userSockets.get(userId.toString());
  if (socketId) {
    ioInstance.to(socketId).emit('notification', notification);
  }
};

module.exports = { registerSocketHandlers, sendNotificationToUser };
