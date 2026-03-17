const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');

const sendEmail = async (to, subject, text) => {
  if (process.env.NODE_ENV === 'production') {
    // Configuración para SendGrid en producción
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject,
      text,
    };
    try {
      await sgMail.send(msg);
      console.log('Email enviado por SendGrid');
    } catch (error) {
      console.error('Error enviando email por SendGrid:', error);
    }
  } else {
    // Configuración para Ethereal en desarrollo
    let testAccount = await nodemailer.createTestAccount();
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    let info = await transporter.sendMail({
      from: '"Mi Proyecto" <noreply@miproyecto.com>',
      to,
      subject,
      text,
    });

    console.log("Email enviado por Ethereal: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  }
};

module.exports = sendEmail;
