var mongoose = require('mongoose');

//Facebook Users Schema
var FacebookUserSchema = new mongoose.Schema({
    fbId: String,
    email: { type : String , lowercase : true},
    name : String
});
var FbUsers = mongoose.model('fbs',FacebookUserSchema);

module.exports = FbUsers
