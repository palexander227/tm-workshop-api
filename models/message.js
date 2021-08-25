const Sequelize = require('sequelize');
const db = require('../config/database');
const Chat = require('./chatroom');
const User = require('./user');

const Message = db.define('Message', {
    message: {
        type: Sequelize.STRING,
    },
    isMedia: {
        type: Sequelize.BOOLEAN
    },
    mediaUrl: {
        type: Sequelize.STRING
    },
});

Message.belongsTo(Chat, { as: 'chat' });
Message.belongsTo(User, { as: 'sender' });
Message.belongsTo(User, { as: 'reciever' });

Message.sync().then(() => {
    console.log('Message Table in sync now');
});

module.exports = Message;