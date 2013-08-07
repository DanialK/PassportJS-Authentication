mongoose = require("mongoose")

# Local Users Schema
LocalUserSchema = new mongoose.Schema(
  username: String
  salt: String
  hash: String
)
Users = mongoose.model("userauths", LocalUserSchema)
module.exports = Users