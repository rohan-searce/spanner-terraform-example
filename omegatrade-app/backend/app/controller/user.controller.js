'use strict';
const User = require('../models/user.model')
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require('uuid');


/**
 * Function to create a new user if not exists
 * @method POST
 * @param {JSON} req contains request headers and payload businessEmail,fullName,password,photoUrl,provider
 */
exports.register = async function (req, res) {
    const body = req.body;
    await User.findUser(body.businessEmail, function (err, data) {
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
    const password = await bcrypt.hash(body.password, salt);
    delete body.password; 
    delete body.confirmPassword;
    const user = {
        ...body,
        userId: uuidv4(),
    }
    try {
        await User.registerUser({ ...user,password }, function (err, data) {
            if (err) {
                res.json({
                    success: false,
                    message: 'Something went wrong while registering new user!'
                });
            }
            if (data) {
                jwt.sign(user, process.env.JWT_SECRET, { expiresIn: process.env.EXPIRE_IN }, function (err, token) {
                    if (err) {
                        res.status(400).json({
                            success: false,
                            message: 'Something went wrong while registering new user!'
                        });
                    }
                    res.json({
                        success: true,
                        message: 'Registered successfully!',
                        userInfo: user,
                        authToken: token
                    });
                });
            }
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
    const body = req.body;
    User.findUser(body.businessEmail, function (err, user) {
        if (user && user.userId) {
            if (bcrypt.compareSync(body.password, user.password)) {
                    delete user.password;
                    const token = jwt.sign(user, process.env.JWT_SECRET, {
                        expiresIn: process.env.EXPIRE_IN
                    });
                    res.status(200).json({
                        success: true,
                        message: 'Logged in successfully',
                        userInfo: user,
                        authToken: token
                    });
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
            res.status(500).json({
                success: false,
                message: 'Something went wrong,Error while authenticating user!'
            });
    });
};

/**
 * Function to generate JWT token
 * @method POST
 * 
 * @param {*} req contains request headers and payload businessEmail,password
 */
exports.getTokenSocial = function (req, res) {
    const body = req.body;
    if (body && body.provider === 'GOOGLE') {
        User.findUser(body.email, function (err, user) {
            if (user && user.userId) {
                    delete user.password;
                    const token = jwt.sign(user, process.env.JWT_SECRET, {
                        expiresIn: process.env.EXPIRE_IN
                    });
                    res.status(200).json({
                        success: true,
                        message: 'Logged in successfully',
                        userInfo: user,
                        authToken: token
                    });
                
            } else
                res.status(401).json({
                    success: false,
                    message: 'please register your account',
                    redirect: 'sign-up'
                });
            if (err)
                res.status(500).json({
                    success: false,
                    message: 'Something went wrong,Error while authenticating user!'
                });
        });
    }
};