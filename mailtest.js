var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'gmail',
    auth: {
      user: process.env.nodemail_key,
      pass: process.env.nodemail_pass
    }
});
transporter.sendMail({
  from: process.env.nodemail_key,
  to: 'darkpgx@gmail.com',
  subject: 'hello',
  text: 'hello world!'
});
