require './bootstrap'

###
Module dependencies.
###
express  = require 'express'
config   = require 'config'
http     = require 'http'
path     = require 'path'
i18n     = require "i18n"
passport = require 'passport'
flash    = require 'connect-flash'

app = express()

require './passport-bootstrap'

app.configure ->
  app.set "port", process.env.PORT or 3000
  app.set "views", __dirname + "/views"
  app.set "view engine", "jade"
  app.locals
    __i: i18n.__
    __n: i18n.__n
    menu: config.menu
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
  app.use require("less-middleware")(src: __dirname + "/public")

i18n.setLocale "fr"

app.configure "development", ->
  app.use express.errorHandler(
    dumpExceptions: true
    showStack: true
  )

app.configure "production", ->
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

if module.parent is null
  http.createServer(app).listen app.get("port"), ->
    console.log "Express server listening on port " + app.get("port")
else
  module.exports = app
