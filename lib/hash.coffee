# check out https://github.com/visionmedia/node-pwd

###
Module dependencies.
###
crypto = require("crypto")

###
Bytesize.
###
len = 128

###
Iterations. ~300ms
###
iterations = 12000

###
Hashes a password with optional `salt`, otherwise
generate a salt for `pass` and invoke `fn(err, salt, hash)`.

@param {String} password to hash
@param {String} optional salt
@param {Function} callback
@api public
###
module.exports = (pwd, salt, fn) ->
  if 3 is arguments.length
    crypto.pbkdf2 pwd, salt, iterations, len, fn
  else
    fn = salt
    crypto.randomBytes len, (err, salt) ->
      return fn(err)  if err
      salt = salt.toString("base64")
      crypto.pbkdf2 pwd, salt, iterations, len, (err, hash) ->
        return fn(err)  if err
        fn null, salt, hash
