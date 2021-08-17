const Sequelize = require('sequelize');
const db = require('../config/database');
const User = require('./user');

const Workspace = db.define('Workspace', {
    title: {
        type: Sequelize.STRING
    },
    description: {
        type: Sequelize.STRING
    },
});

Workspace.belongsTo(User, { as: 'teacher' });
Workspace.belongsTo(User, { as: 'student' });

Workspace.sync().then(() => {
    console.log('Workspace Table in sync now');
});

module.exports = Workspace;