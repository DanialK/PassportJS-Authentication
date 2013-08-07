passport = require("passport")
hash = require("../lib/pass").hash
Users = require("../model/user")
ObjectID = require("../node_modules/mongoose/node_modules/mongodb").ObjectID
module.exports = (app) ->
  
  #
  #    * Helpers
  #    
  authenticatedOrNot = (req, res, next) ->
    if req.isAuthenticated()
      next()
    else
      res.redirect "/login"
  userExist = (req, res, next) ->
    Users.count
      username: req.body.username
    , (err, count) ->
      if count is 0
        next()
      else
        res.redirect "/singup"

  
  #
  #    * Routes
  #    
  app.get "/", (req, res) ->
    if req.isAuthenticated()
      res.render "loggedin",
        user: req.user

    else
      res.render "loggedin",
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
    user = new Users()
    hash req.body.password, (err, salt, hash) ->
      throw err  if err
      user = new Users(
        username: req.body.username
        salt: salt
        hash: hash
        _id: new ObjectID
      ).save((err, newUser) ->
        throw err  if err
        req.login newUser, (err) ->
          return next(err)  if err
          res.redirect "/"

      )


  app.get "/auth/facebook", passport.authenticate("facebook",
    scope: "email"
  )
  app.get "/auth/facebook/callback", passport.authenticate("facebook",
    failureRedirect: "/login"
  ), (req, res) ->
    res.render "loggedin",
      user: req.user


  app.get "/profile", authenticatedOrNot, (req, res) ->
    res.render "profile",
      user: req.user


  app.get "/logout", (req, res) ->
    req.logout()
    res.redirect "/login"
