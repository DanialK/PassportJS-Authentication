var mongoose = require('mongoose');

// Local Users Schema
var LocalUserSchema = new mongoose.Schema({
    username: String,
    salt: String,
    hash: String
});

var Users = mongoose.model('userauths', LocalUserSchema);

module.exports = Users
