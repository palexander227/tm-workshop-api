const express = require('express');
const router = express.Router()
const Post = require('../models/post');
const Comment = require('../models/comment');

router.get('/', async (req, res) => {
    try {
        const posts = await Post.findAll({ where: { userId: req.user.id } });
        res.status(200).send({ message: '', posts })
    }
    catch (err) {
        res.status(500).send({ message: 'Some error occured while fetching posts for logged in user' })
    }
})

router.get('/:postid/comments', async (req, res) => {
    try {
        const comments = await Comment.findAll({ where: { postId: req.params.postid } });
        res.status(200).send({ message: '', comments })
    }
    catch (err) {
        res.status(500).send({ message: 'Some error occured while fetching comments by post id' })
    }
})

router.post('/', async (req, res) => {
    try {
        const post = await Post.create({
            title: req.body.title,
            content: req.body.content,
            workspaceId: req.body.workspaceId,
            userId: req.user.id
        });

        res.status(201).send({ message: 'Post created', post });
    }
    catch (err) {
        if (err.name === 'SequelizeForeignKeyConstraintError')
            res.status(500).send({ message: 'Workspace ID or User ID is invalid' })
        else
            res.status(500).send({ message: 'Error creating Post details' })
    }
})

router.put('/:postid', async (req, res) => {
    const { postid } = req.params;

    try {
        const post = await Post.findByPk(postid);
        if (post) {
            post.title = req.body.title
            post.content = req.body.content

            await post.save();
            res.status(200).send({ message: 'Post updated successfully', post });
        }
        else {
            res.status(200).send({ message: 'Post not found' });
        }
    }
    catch (err) {
        res.status(500).send({ message: 'Error updating post details' })
    }
})

router.delete('/:postid', async (req, res) => {
    const { postid } = req.params;

    try {
        const post = await Post.findByPk(postid);
        if (post) {
            post.destroy();
            res.status(200).send({ message: 'Post deleted successfully' });
        }
        else {
            res.status(200).send({ message: 'Post not found' });
        }
    }
    catch (err) {
        res.status(500).send({ message: 'Error deleting post details' })
    }
})



module.exports = router