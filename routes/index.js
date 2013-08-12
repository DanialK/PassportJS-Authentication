var User, mailer, passport;

passport = require("passport");

User = require("../model/user");

mailer = require("../lib/mailer");

module.exports = function(app) {
  var isAuthenticated, userExist;
  isAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      return res.redirect("/login");
    }
  };
  userExist = function(req, res, next) {
    return User.count({
      username: req.body.username
    }, function(err, count) {
      if (count === 0) {
        return next();
      } else {
        return res.redirect("/singup");
      }
    });
  };
  app.get("/", function(req, res) {
    if (req.isAuthenticated()) {
      return res.render("home", {
        user: req.user
      });
    } else {
      return res.render("home", {
        user: null
      });
    }
  });
  app.get("/login", function(req, res) {
    return res.render("login");
  });
  app.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login"
  }));
  app.get("/signup", function(req, res) {
    return res.render("signup");
  });
  app.post("/signup", userExist, function(req, res, next) {
    return User.signup(req.body.email, req.body.password, function(err, user) {
      if (err) {
        throw err;
      }
      mailer.sendSinupConfirmation(user);
      return req.login(user, function(err) {
        if (err) {
          return next(err);
        }
        return res.redirect("/profile");
      });
    });
  });
  app.get("/auth/facebook", passport.authenticate("facebook", {
    scope: "email"
  }));
  app.get("/auth/facebook/callback", passport.authenticate("facebook", {
    failureRedirect: "/login"
  }), function(req, res) {
    return res.render("profile", {
      user: req.user
    });
  });
  app.get("/profile", isAuthenticated, function(req, res) {
    return res.render("profile", {
      user: req.user
    });
  });
  return app.get("/logout", function(req, res) {
    req.logout();
    return res.redirect("/login");
  });
};
