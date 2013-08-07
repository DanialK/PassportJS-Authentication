mongoose = require 'mongoose'

Schema   = mongoose.Schema

hash = require "../lib/hash"

UserSchema = new Schema(
  firstName:  String
  lastName:   String
  email:      String
  salt:       String
  hash:       String
  facebook:
    id:       String
    email:    String
    name:     String
  twitter:
    id:       String
    email:    String
    name:     String
)

UserSchema.statics.signup = (email, password, done) ->
  self = this
  hash password, (err, salt, hash) ->
    throw err  if err
    new self(
      email: email
      salt: salt
      hash: hash
    ).save done

UserSchema.statics.isValidUserPassword = (email, password, done) ->
  this.findOne
    email: email
  , (err, user) ->
    return done(err)  if err
    unless user
      return done(null, false,
        message: "Incorrect email."
      )
    hash password, user.salt, (err, hash) ->
      return done(err) if err
      return done(null, user)  if hash is user.hash
      done null, false,
        message: "Incorrect password."

UserSchema.statics.findOrCreateFaceBookUser = (profile, done) ->
  self = this
  this.findOne
    'facebook.id': profile.id
  , (err, user) ->
    if user
      done null, user
    else
      new self(
        email:   profile.emails[0].value
        facebook:
          id:    profile.id
          email: profile.emails[0].value
          name:  profile.displayName
      ).save done

User = mongoose.model "User", UserSchema

module.exports = User
