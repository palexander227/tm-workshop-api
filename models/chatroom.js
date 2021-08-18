const Sequelize = require('sequelize');
const db = require('../config/database');
const Message = require('./message');
const User = require('./user');

const Chatroom = db.define('Chatroom', {
   
});

Chatroom.belongsTo(User, { as: 'teacher' });
Chatroom.belongsTo(User, { as: 'student' });

Chatroom.sync().then(() => {
    console.log('Chatroom Table in sync now');
});

module.exports = Chatroom;