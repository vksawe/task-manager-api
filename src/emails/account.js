const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "vskiprotich@gmail.com",
    subject: "Welcome",
    text: `Hello ${name}! Welcome to Task-manager-APP.`,
  });
};

const sendOnDeleteEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "vskiprotich@gmail.com",
    subject: "Sad to see you go ",
    text: `Hello ${name}! Sad to see you goo.`,
  });
};

module.exports = {
  sendWelcomeEmail,
  sendOnDeleteEmail,
};
