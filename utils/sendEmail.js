// eslint-disable-next-line import/no-extraneous-dependencies
const nodemailer = require("nodemailer");

//Nodemailer
const sendEmail = async (options) => {
  //1-create transporter (service that will send email like "gamil","Mailgun","mailtrap")
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT, // if secure false port = 587, if true = 465
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  //2-Define Email Option (like From , to ,subject , email content)
  const mailOpts = {
    from: "E-shopApp <samuelmagdydev@gmail.com>",
    to: options.email,
    subject: options.subject,
    html: options.message,
  };
  //3- Send email
  await transporter.sendMail(mailOpts);
};

module.exports = sendEmail;
