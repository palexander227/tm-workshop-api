const express = require('express');
const router = express.Router()
const Workspace = require('../models/workspace');
const Post = require('../models/post');
const Comment = require('../models/comment');
const { Op } = require("sequelize");
const User = require('../models/user');


async function findCommentsCount(posts) {
    posts = JSON.parse(JSON.stringify(posts));

    if (!Array.isArray(posts) || posts.length === 0) {
        return posts;
    }

    const result = [];

    return new Promise((resolve) => {
        posts.forEach(async (post) => {
            let comments = await Comment.findAll({ where: { postId: post.id } });
            comments = JSON.parse(JSON.stringify(comments));

            result.push(comments ? comments.length : 0);

            if (result.length === posts.length) {
                resolve(result.reduce((a, b) => a + b, 0))
            }
        })
    });
}

async function findPostAndCommentCount(workspaces) {
    workspaces = JSON.parse(JSON.stringify(workspaces));

    if (!Array.isArray(workspaces) || workspaces.length === 0) {
        return workspaces;
    }

    const result = [];

    return new Promise((resolve) => {
        workspaces.forEach(async (workspace) => {
            const post = await Post.findAll({ where: { workspaceId: workspace.id } });
            const commentLength = await findCommentsCount(post);

            result.push({
                workspace,
                count: {
                    post: post ? post.length : 0,
                    comment: commentLength
                }
            })

            if (result.length === workspaces.length) {
                resolve(result);
            }
        })
    });
}

router.get('/', async (req, res) => {
    const userid = req.user.id;

    try {
        const workspaces = await Workspace.findAll({
            where: {
                [Op.or]: [
                    { teacherId: userid },
                    { studentId: userid }
                ]
            }
        });

        try {
            const workspacesWithCount = await findPostAndCommentCount(JSON.parse(JSON.stringify(workspaces)));
            res.status(200).send({ message: '', workspaces: workspacesWithCount })
        } catch (err) {
            console.log(err);
            res.status(500).send({ message: 'Some error occured while preparing count' })
        }

    }
    catch (err) {
        res.status(500).send({ message: 'Error occured while fetching workspace records' })
    }
})

router.get('/:workspaceid/posts', async (req, res) => {
    const { workspaceid } = req.params;

    try {
        const posts = await Post.findAll({ where: { workspaceId: workspaceid } });
        res.status(200).send({ message: '', posts })
    }
    catch (err) {
        res.status(500).send({ message: 'Error fetching posts by workspace' })
    }
})

async function preparePostWithComments(postFromDb) {
    postFromDb = JSON.parse(JSON.stringify(postFromDb));

    if (!Array.isArray(postFromDb) || postFromDb.length === 0) {
        return postFromDb;
    }

    const result = [];

    return new Promise((resolve) => {
        postFromDb.forEach(async (post) => {
            const comments = await Comment.findAll({
                where: { postId: post.id },
                include: {
                    model: User,
                    as: 'user',
                    attributes: { exclude: ['password'] }
                }
            });

            result.push({
                ...post,
                comments: JSON.parse(JSON.stringify(comments)),
            })

            if (result.length === postFromDb.length) {
                resolve(result);
            }
        })
    });

}

router.get('/:workspaceid/posts-with-comments', async (req, res) => {
    const { workspaceid } = req.params;

    try {
        const postsFromDb = await Post.findAll({ where: { workspaceId: workspaceid } });
        const postWithComments = await preparePostWithComments(postsFromDb);

        res.status(200).send({ message: '', posts: postWithComments })
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ message: 'Error fetching posts by workspace' })
    }
})

router.post('/', async (req, res) => {
    try {
        const workspace = await Workspace.create({
            title: req.body.title,
            description: req.body.description,
            studentId: req.body.studentId,
            teacherId: req.body.teacherId
        });

        res.status(201).send({ message: 'Workspace created', workspace });
    }
    catch (err) {
        if (err.name === 'SequelizeForeignKeyConstraintError')
            res.status(500).send({ message: 'Student ID or Teacher ID is invalid' })
        else
            res.status(500).send({ message: 'Error creating workspace details' })
    }
})

router.put('/:workspaceid', async (req, res) => {
    const { workspaceid } = req.params;

    try {
        const workspace = await Workspace.findByPk(workspaceid);
        if (workspace) {
            workspace.title = req.body.title
            workspace.description = req.body.description

            await workspace.save();
            res.status(200).send({ message: 'Workspace updated successfully', workspace });
        }
        else {
            res.status(200).send({ message: 'Workspace not found' });
        }
    }
    catch (err) {
        res.status(500).send({ message: 'Error updating workspace details' })
    }
})

router.delete('/:workspaceid', async (req, res) => {
    const { workspaceid } = req.params;

    try {
        const workspace = await Workspace.findByPk(workspaceid);
        if (workspace) {
            workspace.destroy();
            res.status(200).send({ message: 'Workspace deleted successfully' });
        }
        else {
            res.status(200).send({ message: 'Workspace not found' });
        }
    }
    catch (err) {
        res.status(500).send({ message: 'Error deleting workspace details' })
    }
})


module.exports = router