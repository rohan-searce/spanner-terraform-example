'use strict';
const User = require('../models/user.model')
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require('uuid');
const logService = require('../helpers/logservice');


/**
 * Function to create a new user if not exists
 * @method POST
 * @param {JSON} req contains request headers and payload businessEmail,fullName,password,photoUrl,provider
 */
exports.register = async function (req, res) {
    try {
        const body = req.body;
        const [registerUser] = await User.findUser(body.businessEmail);
        if (registerUser && registerUser.userId) {
            return res.status(400).json({ success: false, message: 'Registration failed, Email already exists!' });
        }
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash(body.password, salt);

        // deleting password and confirm password as both are not required to store
        delete body.password;
        delete body.confirmPassword;

        const user = { ...body, userId: uuidv4() };
        await User.registerUser({ ...user, password });
        jwt.sign(user, process.env.JWT_KEY, { expiresIn: process.env.EXPIRE_IN }, function (err, token) {
            if (err) {
                return res.status(400).json({ success: false, message: 'Something went wrong while registering new user!' });
            }
            return res.status(200).json({ success: true, message: 'Registered successfully!', userInfo: user, authToken: token });
        });
    } catch (error) {
        logService.writeLog('user.controller.register', error);
        return res.status(400).json({ success: false, message: 'Something went wrong while registering new user!' });
    }
};

/**
 * Function to validate and login user.
 * @method POST
 * 
 * @param {*} req contains request headers and payload businessEmail,password
 */
exports.login = async function (req, res) {
    try {
        const body = req.body;
        const [user] = await User.findUser(body.businessEmail);
        if (user && user.userId) {
            if (bcrypt.compareSync(body.password, user.password)) {
                delete user.password;
                const token = jwt.sign(user, process.env.JWT_KEY, {
                    expiresIn: process.env.EXPIRE_IN
                });
                return res.status(200).json({ success: true, message: 'Logged in successfully', userInfo: user, authToken: token });
            } else {
                return res.status(401).json({ success: false, message: 'Login failed.' });
            }
        } else {
            return res.status(401).json({ success: false, message: 'Please register your account before login!' });
        }
    } catch (error) {
        logService.writeLog('user.controller.login', error);
        return res.status(500).json({ success: false, message: 'Something went wrong, Error while authenticating user!' });
    }
};

/**
 * Function to generate JWT token
 * @method POST
 * 
 * @param {*} req contains request headers and payload businessEmail,password
 */
exports.getToken = async function (req, res) {
    try {
        const body = req.body;
        if (body && body.provider === 'GOOGLE') {
            const [user] = await User.findUser(body.email)
            if (user && user.userId) {
                delete user.password;
                if (user.provider === '' || user.provider === null) {
                    user.provider = body.provider;
                    user.photoUrl = body.photoUrl;
                    await User.update(user)
                }else if(user.provider !== 'GOOGLE'){
                    return res.status(422).json({ success: false, message: 'The user is not a Google user.' });
                }
                const token = jwt.sign(user, process.env.JWT_KEY, {
                    expiresIn: process.env.EXPIRE_IN
                });
                return res.status(200).json({ success: true, message: 'Logged in successfully', userInfo: user, authToken: token });
            } else {
                return res.status(401).json({ success: false, message: 'Please register your account', redirect: 'sign-up' });
            }
        }
    } catch (error) {
        logService.writeLog('user.controller.getToken', error);
        return res.status(500).json({ success: false, message: 'Something went wrong,error while authenticating user!' });
    }
};