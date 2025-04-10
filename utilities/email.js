const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');

/// SO
/// WHAT IS THE IDEA HERE
/// for example for sending welcome email to a user we want to do like that
// Email(user , url).sendWelcome();
/// like this so
/// let's go and create the Email class

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.firstName;
    this.url = url;
    this.from = `Amir Firoozi <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      /// Sendgrid
      /// or some real send email services
      return 1;
    }

    /// 1) Create a transporter
    return nodemailer.createTransport({
      /// For real world projects
        // service: "gmail", // Use Gmail's SMTP server
        // auth: {
        //   user: process.env.GMAIL_USER, // Your Gmail email address
        //   pass: process.env.GMAIL_PASS, // Your Gmail password or app-specific password
        // },
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        source: false,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false, // 👈 Use ONLY in development
        },
      });
    }

  async send(template, subject) {
    /// 1) Render a html based on the pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });
    /// 2) Define email option
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text: htmlToText(html),
      // html :
    };
    /// 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  async sendPasswordReset() {
    await this.send('resetPassword' , 'you password reset token this valid only for ten minutes');
  }
};
