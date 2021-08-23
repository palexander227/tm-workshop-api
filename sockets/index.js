const Message = require('../models/message');
const User = require('../models/user');

/**
 * socketEvents - Attaches the socket events to the server
 * @param {function} io - socket.io server
 * @returns {function} Returns io with event listeners attached
 */
const socketEvents = (io) => {
  io.on('connection', (socket) => {
    console.log(`A user has connected! SocketId: ${socket.id}`);

    socket.on('join', async (userId) => {
      console.log('userId', userId);
      socket.join(userId);
      const user = await User.findByPk(userId);
      user.status = 1;
      user.socketId = socket.id;
      await user.save();
      socket.broadcast.emit('userOnline', user)
    });

    socket.on('setSocketId', async (data) => {
      const userId = data.userId;
      const user = await User.findByPk(userId);
      user.status = 1;
      user.socketId = socket.id;
      await user.save();
      socket.broadcast.emit('userOnline', user)
    });

    socket.on('leave', async (userId) => {
      socket.leave(userId);
      const user = await User.findByPk(userId);
      user.status = 0;
      user.socketId = '';
      await user.save();
      socket.broadcast.emit('userOffline', user)
    });

    socket.on('disconnect', async () => {
      console.log(`SocketId: ${socket.id} has disconnected!`);
      const user = await User.findOne({socketId: socket.id});
      user.status = 0;
      user.socketId = '';
      await user.save();
      socket.broadcast.emit('userOffline', user)
    });

    socket.on('newMessage', (newMessage) => {
      console.log('newMessage', {newMessage});
      socket.broadcast.to(newMessage.recieverId).emit('addMessage', newMessage);
    });
  });
};

module.exports = socketEvents;