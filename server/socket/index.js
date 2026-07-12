const registerSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    socket.emit('connected', {
      success: true,
      message: 'Socket connected',
      socketId: socket.id,
    });
  });
};

module.exports = registerSocketHandlers;
