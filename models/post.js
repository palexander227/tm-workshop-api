const Sequelize = require('sequelize');
const db = require('../config/database');
const User = require('./user');
const Workspace = require('./workspace');

const Post = db.define('Post', {
    title: {
        type: Sequelize.STRING
    },
    content: {
        type: Sequelize.STRING
    },
});

Post.belongsTo(User, { as: 'user' })
Post.belongsTo(Workspace, { as: 'workspace' })

Post.sync().then(() => {
    console.log('Post Table in sync now');
});

module.exports = Post;