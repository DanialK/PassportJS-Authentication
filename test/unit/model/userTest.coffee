require '../../../bootstrap.coffee'

assert       = require 'assert'
should       = require 'should'
mongoose     = require 'mongoose'
fixtures     = require 'pow-mongoose-fixtures'

User         = require "../../../model/user"

describe "user", ->
  beforeEach (done) ->
    fixtures.load {User: []}, mongoose.connection, done

  describe "#signup()", ->
    it "should create a user", (done) ->
      email = 'toto@toto.com'
      User.signup email, 'passwd', (err) ->
        should.not.exist(err)
        User.find {}, (err, users) ->
          users.length.should.equal(1)
          users[0].email.should.equal(email)
          should.exist(users[0].salt)
          should.exist(users[0].hash)
          done()

  describe "#isValidUserPassword()", ->
    passwd = 'passwd'
    email = 'toto@toto.com'
    user = {}
    beforeEach (done) ->
      User.signup email, passwd, (err, newUser) ->
        user = newUser
        done()
    describe "when password is correct", ->
      it "should valid user password", (done) ->
        User.isValidUserPassword email, passwd, (err, data, msg) ->
          should.not.exist(err)
          should.not.exist(msg)
          assert.equal user.email, data.email
          done()
    describe "when password is not correct", ->
      it "should not valid user password", (done) ->
        User.isValidUserPassword email, 'badpasswd', (err, data, msg) ->
          should.not.exist(err)
          should.exist(msg)
          assert.equal false, data
          assert.deepEqual msg, message: 'Incorrect password.'
          done()

  describe "#findOrCreateFaceBookUser()", ->
    email = 'toto@toto.com'
    profile =
      id: '4ds5fd6'
      emails: [value: email]
      displayName: 'Toto Dupond'
    it "should create facebook user when not existing", (done) ->
      User.findOrCreateFaceBookUser profile, (err, user) ->
        should.not.exist(err)
        User.find {}, (err, users) ->
          users.length.should.equal(1)
          users[0].facebook.email.should.equal(email)
          done()
    it "should retrieve facebook user when existing", (done) ->
      User.findOrCreateFaceBookUser profile, (err, user) ->
        should.not.exist(err)
        userId = user._id
        User.findOrCreateFaceBookUser profile, (err, user) ->
          should.not.exist(err)
          assert.deepEqual userId, user._id
          User.find {}, (err, users) ->
            users.length.should.equal(1)
            users[0].facebook.email.should.equal(email)
            done()
