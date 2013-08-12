/*
Module dependencies.
*/

var crypto, iterations, len;

crypto = require("crypto");

/*
Bytesize.
*/

len = 128;

/*
Iterations. ~300ms
*/

iterations = 12000;

/*
Hashes a password with optional `salt`, otherwise
generate a salt for `pass` and invoke `fn(err, salt, hash)`.

@param {String} password to hash
@param {String} optional salt
@param {Function} callback
@api public
*/

module.exports = function(pwd, salt, fn) {
  if (3 === arguments.length) {
    return crypto.pbkdf2(pwd, salt, iterations, len, fn);
  } else {
    fn = salt;
    return crypto.randomBytes(len, function(err, salt) {
      if (err) {
        return fn(err);
      }
      salt = salt.toString("base64");
      return crypto.pbkdf2(pwd, salt, iterations, len, function(err, hash) {
        if (err) {
          return fn(err);
        }
        return fn(null, salt, hash);
      });
    });
  }
};
