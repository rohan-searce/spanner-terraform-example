'use strict';
const User = require('../models/user.model')
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken");
const {
    v4: uuidv4
} = require('uuid');

/**
 * Function to create a new user if not exists
 * @method POST
 * @param {JSON} req contains request headers and payload businessEmail,fullName,password,photoUrl,provider
 */
exports.register = async function (req, res) {
    const params = req.body;
    await User.findUser(params, function (err, data) {
        if (data && data.userId) {
            res.status(400).json({
                success: false,
                message: 'Email Already Exists',
            });
        }
        if (err) {
            res.status(400).json({
                success: false,
                message: 'Something went wrong while fetching user!'
            });
        }
    });
    const salt = await bcrypt.genSalt(10);
    const hashpassword = await bcrypt.hash(params.password, salt)
    const user = {
        userId: uuidv4(),
        fullName: params.fullName,
        businessEmail: params.businessEmail,
        password: hashpassword,
        photoUrl: params.photoUrl,
        provider: params.provider
    }
    try {
        await User.registerUser(user, function (err, data) {
            if (err) {
                res.json({
                    success: false,
                    message: 'Something went wrong while registering new user!'
                });
            }
            const payload = {
                'userId': user.userId,
                'fullName': user.fullName,
                'businessEmail': user.businessEmail,
                'photoUrl': params.photoUrl,
                'provider': params.provider
            };
            jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: process.env.EXPIRE_IN
            }, function (err, token) {
                if (err) {
                    res.status(400).json({
                        success: false,
                        message: 'Something went wrong while registering new user!'
                    });
                }
                res.json({
                    success: true,
                    message: 'Registered successfully!',
                    userInfo: payload,
                    authToken: token
                });
            });
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err
        })
    }
};

/**
 * Function to validate and login user.
 * @method POST
 * 
 * @param {*} req contains request headers and payload businessEmail,password
 */
exports.login = function (req, res) {
    const params = req.body;
    User.findUser(params, function (err, user) {
        if (user && user.userId) {
            if (bcrypt.compareSync(params.password, user.password)) {
                if (user) {
                    const payload = {
                        'userId': user.userId,
                        'fullName': user.fullName,
                        'businessEmail': user.businessEmail,
                        'photoUrl': user.photoUrl,
                        'provider': user.provider
                    };
                    const token = jwt.sign(payload, process.env.JWT_SECRET, {
                        expiresIn: process.env.EXPIRE_IN
                    });
                    res.status(200).json({
                        success: true,
                        message: 'Logged in successfully',
                        userInfo: payload,
                        authToken: token
                    });
                }
            } else
                res.status(401).json({
                    success: false,
                    message: 'invalid password!'
                });
        } else
            res.status(401).json({
                success: false,
                message: 'invalid username or password'
            });
        if (err)
            res.send(err);
    });
};

/**
 * Function to generate JWT token
 * @method POST
 * 
 * @param {*} req contains request headers and payload businessEmail,password
 */
exports.getTokenSocial = function (req, res) {
    const params = req.body;
    if (params && params.provider === 'GOOGLE') {
        User.findUser({
            'businessEmail': params.email
        }, function (err, user) {
            console.log(user);
            if (user && user.userId) {
                if (user) {
                    const payload = {
                        'userId': user.userId,
                        'fullName': user.fullName,
                        'businessEmail': user.businessEmail,
                        'photoUrl': user.photoUrl,
                        'provider': user.provider
                    };
                    const token = jwt.sign(payload, process.env.JWT_SECRET, {
                        expiresIn: process.env.EXPIRE_IN
                    });
                    res.status(200).json({
                        success: true,
                        message: 'Logged in successfully',
                        userInfo: payload,
                        authToken: token
                    });
                }
            } else
                res.status(401).json({
                    success: false,
                    message: 'please register your account',
                    redirect: 'sign-up'
                });
            if (err)
                res.send(err);
        });
    }
};