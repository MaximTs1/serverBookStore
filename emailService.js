const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: "ariellabooks123@hotmail.com",
    pass: "asd123A!!@#",
  },
});

transporter.verify(function (error, success) {
  if (error) {
    console.error(error);
  } else {
    console.log("Email service is ready to send messages");
  }
});

module.exports = transporter;
