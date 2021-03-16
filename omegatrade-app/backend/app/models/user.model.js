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
      }
    };
    let result = await database.run(query);
    if (result[0]) {
      var rows = result[0].map((row) => row.toJSON());
      cb(null, rows[0]);
      return;
    }
  } catch (error) {
    cb(error, null)
    return;
  }
}

module.exports = User
