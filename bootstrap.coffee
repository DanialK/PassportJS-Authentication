config   = require 'config'
mongoose = require 'mongoose'

mongoose.connect config.Mongo.dbUris.join(','), config.Mongo.options, (err) ->
  throw err if err