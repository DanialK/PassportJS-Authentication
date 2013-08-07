mongoose = require("mongoose")

#Facebook Users Schema
FacebookUserSchema = new mongoose.Schema(
  fbId: String
  email:
    type: String
    lowercase: true

  name: String
)
FbUsers = mongoose.model("fbs", FacebookUserSchema)
module.exports = FbUsers