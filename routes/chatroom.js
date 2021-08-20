const router = require('express').Router();
const Chatroom = require('../models/chatroom');
const Message = require('../models/message');
const User = require('../models/user');

// GET request to get all chatrooms
router.get('/', async (req, res, next) => {
    const userid = req.user.id;

    try {
        const chatrooms = await Chatroom.findAll({
            where: {
                [Op.or]: [
                    { teacherId: userid },
                    { studentId: userid }
                ]
            }
        });

        res.status(200).send({ message: '', chats: chatrooms })

    }
    catch (err) {
        res.status(500).send({ message: 'Error occured while fetching chats records' })
    }
});

// GET request to get all messages of a chatroom
router.get('/:chatroomId/messages', (req, res, next) => {
    Message.findAll({
        where: {
            chatroomId: req.params.chatroomId,
        },
        include: [
            { model: User, attributes: ['username'] },
        ],
        order: [
            ['createdAt', 'ASC'],
        ],
    })
        .then((foundMessages) => {
            res.send(foundMessages);
        })
        .catch(next);
});

// POST request to add a message
router.post('/:chatroomId/messages', (req, res, next) => {

    const files = req._fileparser.upstreams.length
        ? req.file("media")
        : undefined;


    User.findByPk(req.user.id)
        .then(async (foundUser) => {
            console.log(req.body);
            return Message.create(req.body)
                .then(async (createdMessage) => {
                    if (files) {
                        files.upload({
                            adapter: require('skipper-s3'),
                            key: process.env.BUCKET_KEY,
                            secret: process.env.BUCKET_SECRET,
                            bucket: process.env.BUCKET_NAME,
                            dirname: '',
                        }, async (err, uploadedImg) => {
                            if (err) return res.status(400).send({ err });
                            console.log('uploadedImg', uploadedImg);
                            // https://thoughtmuseum-image-hosting.s3.us-east-2.amazonaws.com/45bc7f72-8986-4cdc-8ec1-edd7b04d06f6.png
                            const mediaPath = `https://thoughtmuseum-image-hosting.s3.us-east-2.amazonaws.com/${uploadedImg[0].fd}`;
                            createdMessage.senderId = foundUser.id;
                            createdMessage.mediaUrl = mediaPath;
                            if (!req.body.chatroomId) {
                                const chat = await Chatroom.create({
                                    teacherId: req.user.role === 'teacher' ? req.user.id : req.body.recieverId,
                                    studentId: req.user.role === 'student' ? req.user.id : req.body.recieverId
                                });
                                createdMessage.chatId = chat.id;
                                // createdMessage.mediaUrl = mediaPath;
                            }
                            createdMessage.save();
                            const createdMessageInJSON = createdMessage.toJSON();
                            return createdMessageInJSON;
                        });
                    } else {
                        createdMessage.senderId = foundUser.id;
                        if (!req.body.chatroomId) {
                            const chat = await Chatroom.create({
                                teacherId: req.user.role === 'teacher' ? req.user.id : req.body.recieverId,
                                studentId: req.user.role === 'student' ? req.user.id : req.body.recieverId
                            });
                            createdMessage.chatId = chat.id;
                            createdMessage.mediaUrl = mediaPath;
                        }
                        createdMessage.save();
                        const createdMessageInJSON = createdMessage.toJSON();
                        return createdMessageInJSON;
                    }
                });
        })
        .then((completeMessage) => {
            res.send(completeMessage);
        })
        .catch(next);
});

module.exports = router;