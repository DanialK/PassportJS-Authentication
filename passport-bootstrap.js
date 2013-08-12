var FacebookStrategy, LocalStrategy, TwitterStrategy, User, passport;

passport = require("passport");
LocalStrategy = require("passport-local").Strategy;
FacebookStrategy = require("passport-facebook").Strategy;
TwitterStrategy = require("passport-twitter").Strategy;
User = require("./model/user");

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, function(email, password, done) {
  return User.isValidUserPassword(email, password, done);
}));

passport.use(new FacebookStrategy({
  clientID: ".....",
  clientSecret: ".......",
  callbackURL: "http://localhost:3000/auth/facebook/callback"
}, function(accessToken, refreshToken, profile, done) {
  return User.findOrCreateFaceBookUser(profile, function(err, user) {
    if (err) {
      done(err);
    }
    return done(null, user);
  });
}));

passport.serializeUser(function(user, done) {
  return done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  return User.findById(id, function(err, user) {
    if (err) {
      done(err);
    }
    return done(null, user);
  });
});
