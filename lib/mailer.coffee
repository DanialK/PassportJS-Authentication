nodemailer = require "nodemailer"
config     = require "config"

smtpTransport = nodemailer.createTransport("Sendmail")

exports.sendSinupConfirmation = (user) ->
  mailOptions =
    from: config.mailer.sender['no-reply']
    to: user.email
    subject: "Welcome to Super Site !"
    text: "Welcome to Super Site ! Hope you'll enjoy it"
    html: "<p>Welcome to Super Site ! Hope you'll enjoy it</p>"

  # send mail with defined transport object
  smtpTransport.sendMail mailOptions, (error, response) ->
    if error
      console.log error
    else
      console.log "Message sent: " + response.message
