const express = require('express');
const router = express.Router();
const passwordHash = require('password-hash');
const User = require('../models/user');

const passport = require('passport')
require('../config/passport')(passport)
const jwt = require('jsonwebtoken');

router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const users = await User.findAll({ attributes: { exclude: ['password'] } });
        res.status(201).send({ message: '', users });
    }
    catch (err) {
        res.status(409).send({ message: 'Unable to fetch user records' })
    }
})

router.get('/:userid', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { userid } = req.params;

    try {
        const user = await User.findByPk(userid, { attributes: { exclude: ['password'] } });
        if (user)
            res.status(200).send({ message: '', user });
        else
            res.status(404).send({ message: 'User not found' });
    }
    catch (err) {
        res.status(409).send({ message: 'Unable to fetch user records' })
    }
})

router.post('/register', async (req, res) => {
    try {
        await User.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            username: req.body.username,
            password: passwordHash.generate(req.body.password),
            role: req.body.role,
        });

        res.status(201).send({ message: 'Registration successfull' });
    }
    catch (err) {
        res.status(409).send({ message: 'Username already taken' })
    }
})

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const userFromDB = await User.findOne({ where: { username } });

        if (!userFromDB || !passwordHash.verify(password, userFromDB.password)) {
            res.status(401).send({ message: 'User not found' });
        }
        else {
            const userWithoutPswd = { ...userFromDB.dataValues };
            delete userWithoutPswd['password'];

            const secretKey = process.env.JWT_SECRET_KEY;
            jwt.sign(userWithoutPswd, secretKey, { expiresIn: '1d' }, function (err, token) {
                if (err)
                    res.status(500).send({ message: 'Some problem with JWT token generation' });
                else
                    res.status(200).send({ message: 'User found', user: userWithoutPswd, token });
            });
        }
    }
    catch (err) {
        res.status(500).send({ message: 'Some error occured while login' })
    }
})

router.put('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
        if (user) {
            user.firstName = req.body.firstName
            user.lastName = req.body.lastName

            await user.save();
            res.status(200).send({ message: 'User detail updated successfully', user });
        }
        else {
            res.status(200).send({ message: 'User not found' });
        }
    }
    catch (err) {
        res.status(500).send({ message: 'Error updating user details' })
    }
})

router.delete('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
        if (user) {
            user.destroy();
            res.status(200).send({ message: 'User details deleted successfully' });
        }
        else {
            res.status(200).send({ message: 'User not found' });
        }
    }
    catch (err) {
        res.status(500).send({ message: 'Error deleting user details' })
    }
})

module.exports = router