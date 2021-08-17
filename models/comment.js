const Sequelize = require('sequelize');
const db = require('../config/database');
const Post = require('./post');
const User = require('./user');

const Comment = db.define('Comment', {
    content: {
        type: Sequelize.STRING
    },
});

Comment.belongsTo(Post, { as: 'post' })
Comment.belongsTo(User, { as: 'user' })

Comment.sync().then(() => {
    console.log('Comment Table in sync now');
});

module.exports = Comment;