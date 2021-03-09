'use strict';
module.exports = function (app) {
  const UserController = require('./../controller/user.controller');
  app.route('/register-user').post(UserController.register);
  app.route('/login').post(UserController.login);
  app.route('/get-auth-token').post(UserController.getTokenSocial);
};