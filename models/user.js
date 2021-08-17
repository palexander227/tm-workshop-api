const Sequelize = require('sequelize');
const db = require('../config/database');

const User = db.define('User', {
    firstName: {
        type: Sequelize.STRING
    },
    lastName: {
        type: Sequelize.STRING
    },
    username: {
        type: Sequelize.STRING,
        unique: true
    },
    password: {
        type: Sequelize.STRING
    },
    role: {
        type: Sequelize.STRING
    },
});

User.sync().then(() => {
    console.log('User Table in sync now');
});

module.exports = User;