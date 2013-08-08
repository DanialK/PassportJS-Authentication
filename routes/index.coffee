passport = require("passport")

User = require("../model/user")
mailer = require("../lib/mailer")

module.exports = (app) ->
  # Helpers
  isAuthenticated = (req, res, next) ->
    if req.isAuthenticated()
      next()
    else
      res.redirect "/login"

  userExist = (req, res, next) ->
    User.count
      username: req.body.username
    , (err, count) ->
      if count is 0
        next()
      else
        res.redirect "/singup"

  # Routes
  app.get "/", (req, res) ->
    if req.isAuthenticated()
      res.render "home",
        user: req.user

    else
      res.render "home",
        user: null

  app.get "/login", (req, res) ->
    res.render "login"

  app.post "/login", passport.authenticate("local",
    successRedirect: "/"
    failureRedirect: "/login"
  )
  app.get "/signup", (req, res) ->
    res.render "signup"

  app.post "/signup", userExist, (req, res, next) ->
    User.signup req.body.email, req.body.password, (err, user) ->
      throw err if err
      mailer.sendSinupConfirmation(user)
      req.login user, (err) ->
        return next(err)  if err
        res.redirect "/profile"

  app.get "/auth/facebook", passport.authenticate("facebook",
    scope: "email"
  )
  app.get "/auth/facebook/callback", passport.authenticate("facebook",
    failureRedirect: "/login"
  ), (req, res) ->
    res.render "profile",
      user: req.user

  app.get "/profile", isAuthenticated, (req, res) ->
    res.render "profile",
      user: req.user

  app.get "/logout", (req, res) ->
    req.logout()
    res.redirect "/login"
