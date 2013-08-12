var app, config, express, flash, http, i18n, passport, path;

require('./bootstrap');

/*
Module dependencies.
*/

express = require('express');
config = require('config');
http = require('http');
path = require('path');
i18n = require("i18n");
passport = require('passport');
flash = require('connect-flash');
app = express();

require('./passport-bootstrap');

app.configure(function() {
  app.set("port", process.env.PORT || 3000);
  app.set("views", __dirname + "/views");
  app.set("view engine", "jade");
  app.locals({
    __i: i18n.__,
    __n: i18n.__n,
    menu: config.menu
  });
  app.use(express.favicon());
  app.use(express.logger("dev"));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.session({
    secret: "keyboard cat"
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.methodOverride());
  app.use(flash());
  app.use(app.router);
  app.use(express["static"](path.join(__dirname, "public")));
  return app.use(require("less-middleware")({
    src: __dirname + "/public"
  }));
});

i18n.setLocale("fr");

app.configure("development", function() {
  return app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
});

app.configure("production", function() {
  return app.use(express.errorHandler());
});

app.use(function(req, res, next) {
  res.status(404);
  if (req.accepts("html")) {
    res.render("404", {
      url: req.url
    });
    return;
  }
  if (req.accepts("json")) {
    res.send({
      error: "Not found"
    });
    return;
  }
  return res.type("txt").send("Not found");
});

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  return res.render("500", {
    error: err
  });
});

require("./routes")(app);

if (module.parent === null) {
  http.createServer(app).listen(app.get("port"), function() {
    return console.log("Express server listening on port " + app.get("port"));
  });
} else {
  module.exports = app;
}
