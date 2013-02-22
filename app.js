/**
 * Module dependencies.
 */

var express = require('express'),
    http = require('http'),
    path = require('path'),
    mongoose = require('mongoose'),
    passport = require("passport"),
    LocalStrategy = require('passport-local').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    TwitterStrategy = require('passport-twitter').Strategy,
    hash = require("./pass").hash,
    flash = require("connect-flash"),
    ObjectID = require("./node_modules/mongoose/node_modules/mongodb").ObjectID;
    

var app = express();

/*
Database and Models 
*/
mongoose.connect("mongodb://localhost/myapp");


// Local Users Schema
var LocalUserSchema = new mongoose.Schema({
    username: String,
    salt: String,
    hash: String
});

var Users = mongoose.model('userauths', LocalUserSchema);

//Facebook Users Schema 
var FacebookUserSchema = new mongoose.Schema({
    fbId: String,
    email: { type : String , lowercase : true},
    name : String
});
var FbUsers = mongoose.model('fbs',FacebookUserSchema);

/*
* Configuration and Middlewares
*/

passport.use(new LocalStrategy(function(username, password,done){
    Users.findOne({ username : username},function(err,user){
        if(err) { return done(err); }
        if(!user){
            return done(null, false, { message: 'Incorrect username.' });
        }

        hash( password, user.salt, function (err, hash) {
            if (err) { return done(err); }
            if (hash == user.hash) return done(null, user);
            done(null, false, { message: 'Incorrect password.' });
        });
    });
}));

passport.use(new FacebookStrategy({
    clientID: "119866791529585",
    clientSecret: "33a0859412d304a75da20fdf98e8ea65",
    callbackURL: "http://localhost:3000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    FbUsers.findOne({fbId : profile.id}, function(err, oldUser){
        if(oldUser){
            done(null,oldUser);
        }else{
            var newUser = new FbUsers({
                fbId : profile.id ,
                email : profile.emails[0].value,
                name : profile.displayName
            }).save(function(err,newUser){
                if(err) throw err;
                done(null, newUser);
            });
        }
    }); 
  }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});


passport.deserializeUser(function(id, done) {
    FbUsers.findById(id,function(err,user){
        if(err) done(err);
        if(user){
            done(null,user);
        }else{
            Users.findById(id, function(err,user){
                if(err) done(err);
                done(null,user);
            });
        }
    });
});

app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.session({ secret: 'keyboard cat' }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(express.methodOverride());
    app.use(flash());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function () {
    app.use(express.errorHandler());
});
/*
* Error Handling
*/
app.use(function(req, res, next){
  res.status(404);
  if (req.accepts('html')) {
    res.render('404', { url: req.url });
    return;
  }
  if (req.accepts('json')) {
    res.send({ error: 'Not found' });
    return;
  }
  res.type('txt').send('Not found');
});

app.use(function(err, req, res, next){
  res.status(err.status || 500);
  res.render('500', { error: err });
});

/*
* Helpers
*/
function authenticatedOrNot(req, res, next){
    if(req.isAuthenticated()){
        next();
    }else{
        res.redirect("/login");
    }
}

function userExist(req, res, next) {
    Users.count({
        username: req.body.username
    }, function (err, count) {
        if (count === 0) {
            next();
        } else {
            res.redirect("/singup");
        }
    });
}

/*
* Routes
*/

app.get("/", function(req, res){ 
    if(req.isAuthenticated()){
      res.render("loggedin", { user : req.user}); 
    }else{
        res.render("loggedin", { user : null});
    }
       
});

app.get("/login", function(req, res){ 
    res.render("login");
});

app.post("/login" 
    ,passport.authenticate('local',{
        successRedirect : "/",
        failureRedirect : "/login",
    }) 
);

app.get("/signup", function (req, res) {
    res.render("signup");
});

app.post("/signup", userExist, function (req, res, next) {
    var user = new Users();
    hash(req.body.password, function (err, salt, hash) {
        if (err) throw err;
        var user = new Users({
            username: req.body.username,
            salt: salt,
            hash: hash,
            _id : new ObjectID
        }).save(function (err, newUser) {
            if (err) throw err;
            req.login(newUser, function(err) {
              if (err) { return next(err); }
              return res.redirect('/');
            });
        });
    });
});

app.get("/auth/facebook", passport.authenticate("facebook",{ scope : "email"}));

app.get("/auth/facebook/callback", 
    passport.authenticate("facebook",{ failureRedirect: '/login'}),
    function(req,res){
        res.render("loggedin", {user : req.user});
    }
);

app.get("/profile", authenticatedOrNot, function(req, res){ 
    res.render("profile", { user : req.user});
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/login');
});

http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});