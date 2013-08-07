###
Module dependencies.
###
express = require("express")
http = require("http")
path = require("path")
mongoose = require("mongoose")
passport = require("passport")
flash = require("connect-flash")
app = express()

#
#Database and Models
#
mongoose.connect "mongodb://localhost/passportjs-authentication"
Users = require("./model/user")
FbUsers = require("./model/fbuser")
require "./passport-bootstrap"
app.configure ->
  app.set "port", process.env.PORT or 3000
  app.set "views", __dirname + "/views"
  app.set "view engine", "jade"
  app.use express.favicon()
  app.use express.logger("dev")
  app.use express.cookieParser()
  app.use express.bodyParser()
  app.use express.session(secret: "keyboard cat")
  app.use passport.initialize()
  app.use passport.session()
  app.use express.methodOverride()
  app.use flash()
  app.use app.router
  app.use express.static(path.join(__dirname, "public"))

app.configure "development", ->
  app.use express.errorHandler()


#
#* Error Handling
#
app.use (req, res, next) ->
  res.status 404
  if req.accepts("html")
    res.render "404",
      url: req.url

    return
  if req.accepts("json")
    res.send error: "Not found"
    return
  res.type("txt").send "Not found"

app.use (err, req, res, next) ->
  res.status err.status or 500
  res.render "500",
    error: err


require("./routes") app
http.createServer(app).listen app.get("port"), ->
  console.log "Express server listening on port " + app.get("port")
