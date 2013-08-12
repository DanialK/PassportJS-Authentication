var config, nodemailer, smtpTransport;

nodemailer = require("nodemailer");

config = require("config");

smtpTransport = nodemailer.createTransport("Sendmail");

exports.sendSinupConfirmation = function(user) {
  var mailOptions;
  mailOptions = {
    from: config.mailer.sender['no-reply'],
    to: user.email,
    subject: "Welcome to Super Site !",
    text: "Welcome to Super Site ! Hope you'll enjoy it",
    html: "<p>Welcome to Super Site ! Hope you'll enjoy it</p>"
  };
  return smtpTransport.sendMail(mailOptions, function(error, response) {
    if (error) {
      return console.log(error);
    } else {
      return console.log("Message sent: " + response.message);
    }
  });
};
