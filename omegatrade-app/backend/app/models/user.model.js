'user strict';
const database = require('./../config/database.js');
var User = function () {};

User.registerUser = async function (user, cb) {
  const usersTable = database.table('users');
  try {
    await usersTable.insert(user);
    cb(null, true);
    return true;
  } catch (err) {
    console.log('ERR',err);
    cb(err, null);
    return;
  } 
}

User.findUser = async function (email, cb) {
  try {
    const query = {
      sql: 'SELECT userId,fullName,businessEmail,password,photoUrl,provider FROM users where businessEmail = @businessEmail',
      params: {
        businessEmail: email
      },
      json: true,
    };
    const [users] = await database.run(query);
    cb(null,users[0]);
    return;
  } catch (error) {
    console.log('------------------Error-----------------',error);
    cb(error, null)
    return;
  }
}

module.exports = User
