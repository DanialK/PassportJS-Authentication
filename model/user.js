var Schema, User, UserSchema, hash, mongoose;

mongoose = require('mongoose');
Schema = mongoose.Schema;
hash = require("../lib/hash");

UserSchema = new Schema({
  firstName: String,
  lastName: String,
  email: String,
  salt: String,
  hash: String,
  facebook: {
    id: String,
    email: String,
    name: String
  },
  twitter: {
    id: String,
    email: String,
    name: String
  }
});

UserSchema.statics.signup = function(email, password, done) {
  var self;
  self = this;
  return hash(password, function(err, salt, hash) {
    if (err) {
      throw err;
    }
    return new self({
      email: email,
      salt: salt,
      hash: hash
    }).save(done);
  });
};

UserSchema.statics.isValidUserPassword = function(email, password, done) {
  return this.findOne({
    email: email
  }, function(err, user) {
    if (err) {
      return done(err);
    }
    if (!user) {
      return done(null, false, {
        message: "Incorrect email."
      });
    }
    return hash(password, user.salt, function(err, hash) {
      if (err) {
        return done(err);
      }
      if (hash === user.hash) {
        return done(null, user);
      }
      return done(null, false, {
        message: "Incorrect password."
      });
    });
  });
};

UserSchema.statics.findOrCreateFaceBookUser = function(profile, done) {
  var self;
  self = this;
  return this.findOne({
    'facebook.id': profile.id
  }, function(err, user) {
    if (user) {
      return done(null, user);
    } else {
      return new self({
        email: profile.emails[0].value,
        facebook: {
          id: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName
        }
      }).save(done);
    }
  });
};

User = mongoose.model("User", UserSchema);

module.exports = User;
