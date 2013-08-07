var passport = require("passport");
    hash = require("../lib/pass").hash;

var Users = require('../model/user');
var ObjectID = require("../node_modules/mongoose/node_modules/mongodb").ObjectID;

module.exports = function (app) {
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
}
