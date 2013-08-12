var config, mongoose;

config = require('config');

mongoose = require('mongoose');

mongoose.connect(config.Mongo.dbUris.join(','), config.Mongo.options, function(err) {
  if (err) {
    throw err;
  }
});
