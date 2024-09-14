const { email } = require("./config");

const welcomeSender = (recipient, name, code) => {
  console.log(`Attempting to send welcome email to ${recipient} with code ${code}`);

  email
    .send({
      template: "welcome", // Ensure this matches your template file name
      message: {
        to: recipient,
      },
      locals: {
        name: name,
        code: code,
      },
      subject: "Welcome to Our Service!", // Add a subject line
    })
    .then(() => console.log(`Welcome email sent to ${recipient}`))
    .catch((err) => {
      console.error('Error sending welcome email:', err);
      console.log('Email details:', { recipient, name, code });
    });
};


const forgotPasswordSender = (recipient, name, code) => {
  email
    .send({
      template: "forgot", // Ensure this matches your template file name
      message: {
        to: recipient,
      },
      locals: {
        name: name,
        code: code,
      },
      subject: "Reset Your Password", // Add a subject line
    })
    .then(() => console.log('Forgot password email sent'))
    .catch((err) => console.error('Error sending forgot password email:', err));
};

module.exports = {
  welcomeSender,
  forgotPasswordSender,
};
