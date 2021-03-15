const router = require('express').Router();
const UserController = require('../../controller/user.controller');
router.post('/register-user', UserController.register);
router.post('/login', UserController.login);
router.post('/get-auth-token', UserController.getToken);
module.exports = router;
