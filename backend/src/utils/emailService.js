const nodemailer = require('nodemailer');
const env = require('../config/env');

let transporter;

try {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST || 'smtp.gmail.com',
    port: env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
} catch (error) {
  console.warn('Email service not configured:', error.message);
  transporter = null;
}

const sendEmail = async (to, subject, html) => {
  if (!transporter) {
    console.warn('Email service not configured. Skipping email send.');
    return null;
  }

  try {
    const mailOptions = {
      from: env.SMTP_USER,
      to,
      subject,
      html,
    };

    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

const sendRenewalReminder = async (tenantEmail, tenantName, propertyName, unitNumber, endDate) => {
  const subject = `Lease Renewal Reminder - ${propertyName} Unit ${unitNumber}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Lease Renewal Reminder</h2>
      <p>Dear ${tenantName},</p>
      <p>This is a reminder that your lease for <strong>${propertyName} - Unit ${unitNumber}</strong> is expiring on <strong>${endDate.toDateString()}</strong>.</p>
      <p>Please contact us to discuss renewal options or make arrangements for lease termination.</p>
      <p>Thank you for being a valued tenant.</p>
      <br>
      <p>Best regards,<br>Property Management Team</p>
    </div>
  `;

  return sendEmail(tenantEmail, subject, html);
};

const sendPaymentReminder = async (tenantEmail, tenantName, amount, dueDate, propertyName, unitNumber) => {
  const subject = `Payment Reminder - ${propertyName} Unit ${unitNumber}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Payment Reminder</h2>
      <p>Dear ${tenantName},</p>
      <p>This is a reminder that your rent payment of <strong>$${amount}</strong> for <strong>${propertyName} - Unit ${unitNumber}</strong> is due on <strong>${dueDate.toDateString()}</strong>.</p>
      <p>Please ensure timely payment to avoid late fees.</p>
      <p>Thank you.</p>
      <br>
      <p>Best regards,<br>Property Management Team</p>
    </div>
  `;

  return sendEmail(tenantEmail, subject, html);
};

module.exports = {
  sendEmail,
  sendRenewalReminder,
  sendPaymentReminder,
};