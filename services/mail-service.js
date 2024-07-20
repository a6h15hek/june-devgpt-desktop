const nodemailer = require('nodemailer');

// Create a transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
  host: process.env.SMTP_MAIL_SERVER_HOST,
  port: process.env.SMTP_MAIL_SERVER_PORT,
  secure: process.env.SMTP_MAIL_SERVER_MODE === 'SSL', // use SSL
  auth: {
    user: process.env.MAIL_SERVER_USERNAME,
    pass: process.env.MAIL_SERVER_PASSWORD
  }
});

function validateEmails(emails) {
    // Regular expression for email validation
    let regex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    return emails.every(email => regex.test(email));
}

function sendEmail(receiverAddress, subject, body = '', files = []) {
  const { to, bcc = [], cc= [], dcc=[] } = receiverAddress;
  console.info(`Sending Email:: [recipient-size, subject-size, body-size, files-size] : [${[...to, ...bcc, ...cc, ...dcc].length}, ${subject.length}, ${body.length}, ${files.length}]`);
  
  if (!validateEmails([...to, ...bcc, ...cc, ...dcc])) {
    console.log('Invalid email address detected.');
    return;
  }

  let mailOptions = {
    from: process.env.MAIL_SERVER_USERNAME,
    to: to.join(', '),
    bcc: bcc.join(', '),
    cc: cc.join(', '),
    dcc: dcc.join(', '),
    subject: subject,
    text: body,
    attachments: files.map(file => ({ path: file }))
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error occurred while sending email: ', error);
    } else {
      console.info('Email sent: ' + info.response);
    }
  });
}

module.exports = { sendEmail }