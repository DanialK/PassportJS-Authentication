passport = require("passport")
LocalStrategy = require("passport-local").Strategy
FacebookStrategy = require("passport-facebook").Strategy
TwitterStrategy = require("passport-twitter").Strategy
hash = require("./lib/pass").hash

Users = require("./model/user")
FbUsers = require("./model/fbuser")

#
#* Configuration and Middlewares
#
passport.use new LocalStrategy((username, password, done) ->
  Users.findOne
    username: username
  , (err, user) ->
    return done(err)  if err
    unless user
      return done(null, false,
        message: "Incorrect username."
      )
    hash password, user.salt, (err, hash) ->
      return done(err)  if err
      return done(null, user)  if hash is user.hash
      done null, false,
        message: "Incorrect password."



)
passport.use new FacebookStrategy(
  clientID: "....."
  clientSecret: "......."
  callbackURL: "http://localhost:3000/auth/facebook/callback"
, (accessToken, refreshToken, profile, done) ->
  FbUsers.findOne
    fbId: profile.id
  , (err, oldUser) ->
    if oldUser
      done null, oldUser
    else
      newUser = new FbUsers(
        fbId: profile.id
        email: profile.emails[0].value
        name: profile.displayName
      ).save((err, newUser) ->
        throw err  if err
        done null, newUser
      )

)
passport.serializeUser (user, done) ->
  done null, user.id

passport.deserializeUser (id, done) ->
  FbUsers.findById id, (err, user) ->
    done err  if err
    if user
      done null, user
    else
      Users.findById id, (err, user) ->
        done err  if err
        done null, user


