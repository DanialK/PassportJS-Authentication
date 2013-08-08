passport = require("passport")
LocalStrategy = require("passport-local").Strategy
FacebookStrategy = require("passport-facebook").Strategy
TwitterStrategy = require("passport-twitter").Strategy

User = require("./model/user")

passport.use new LocalStrategy( { usernameField: 'email', passwordField: 'password' }, (email, password, done) ->
  User.isValidUserPassword email, password, done
)

passport.use new FacebookStrategy(
  clientID: "....."
  clientSecret: "......."
  callbackURL: "http://localhost:3000/auth/facebook/callback"
, (accessToken, refreshToken, profile, done) ->
  User.findOrCreateFaceBookUser profile, (err, user) ->
    done err if err
    done null, user
)

passport.serializeUser (user, done) ->
  done null, user.id

passport.deserializeUser (id, done) ->
  User.findById id, (err, user) ->
    done err if err
    done null, user