var User, assert, fixtures, mongoose, should;

require('../../../bootstrap');
assert = require('assert');
should = require('should');
mongoose = require('mongoose');
fixtures = require('pow-mongoose-fixtures');
User = require("../../../model/user");

describe("user", function() {
  beforeEach(function(done) {
    return fixtures.load({
      User: []
    }, mongoose.connection, done);
  });
  describe("#signup()", function() {
    return it("should create a user", function(done) {
      var email;
      email = 'toto@toto.com';
      return User.signup(email, 'passwd', function(err) {
        should.not.exist(err);
        return User.find({}, function(err, users) {
          users.length.should.equal(1);
          users[0].email.should.equal(email);
          should.exist(users[0].salt);
          should.exist(users[0].hash);
          return done();
        });
      });
    });
  });
  describe("#isValidUserPassword()", function() {
    var email, passwd, user;
    passwd = 'passwd';
    email = 'toto@toto.com';
    user = {};
    beforeEach(function(done) {
      return User.signup(email, passwd, function(err, newUser) {
        user = newUser;
        return done();
      });
    });
    describe("when password is correct", function() {
      return it("should valid user password", function(done) {
        return User.isValidUserPassword(email, passwd, function(err, data, msg) {
          should.not.exist(err);
          should.not.exist(msg);
          assert.equal(user.email, data.email);
          return done();
        });
      });
    });
    return describe("when password is not correct", function() {
      return it("should not valid user password", function(done) {
        return User.isValidUserPassword(email, 'badpasswd', function(err, data, msg) {
          should.not.exist(err);
          should.exist(msg);
          assert.equal(false, data);
          assert.deepEqual(msg, {
            message: 'Incorrect password.'
          });
          return done();
        });
      });
    });
  });
  return describe("#findOrCreateFaceBookUser()", function() {
    var email, profile;
    email = 'toto@toto.com';
    profile = {
      id: '4ds5fd6',
      emails: [
        {
          value: email
        }
      ],
      displayName: 'Toto Dupond'
    };
    it("should create facebook user when not existing", function(done) {
      return User.findOrCreateFaceBookUser(profile, function(err, user) {
        should.not.exist(err);
        return User.find({}, function(err, users) {
          users.length.should.equal(1);
          users[0].facebook.email.should.equal(email);
          return done();
        });
      });
    });
    return it("should retrieve facebook user when existing", function(done) {
      return User.findOrCreateFaceBookUser(profile, function(err, user) {
        var userId;
        should.not.exist(err);
        userId = user._id;
        return User.findOrCreateFaceBookUser(profile, function(err, user) {
          should.not.exist(err);
          assert.deepEqual(userId, user._id);
          return User.find({}, function(err, users) {
            users.length.should.equal(1);
            users[0].facebook.email.should.equal(email);
            return done();
          });
        });
      });
    });
  });
});
