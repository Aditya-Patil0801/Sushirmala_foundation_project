const nodemailer = require('nodemailer');

// Create transporter using environment variables
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send approval email
const sendApprovalEmail = async (to, name, groupName) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject: 'Bachat Gat Membership Application Approved',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d7d9a;">Congratulations ${name}!</h2>
        <p>Your application to join the <strong>${groupName}</strong> Bachat Gat has been <span style="color: #4caf50; font-weight: bold;">approved</span>!</p>
        <p>You can now log in to your account and start participating in group activities.</p>
        <div style="background-color: #e8f4f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Next Steps:</h3>
          <ol>
            <li>Log in to your account</li>
            <li>Complete your profile information</li>
            <li>Start contributing to the group savings</li>
          </ol>
        </div>
        <p>If you have any questions, please contact our support team.</p>
        <p>Best regards,<br/>Sushirmala Mahila Bachat Gat Team</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Approval email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending approval email:', error);
    return { success: false, error: error.message };
  }
};

// Send rejection email
const sendRejectionEmail = async (to, name, groupName, remarks = '') => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject: 'Bachat Gat Membership Application Update',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d7d9a;">Dear ${name},</h2>
        <p>Thank you for your interest in joining the <strong>${groupName}</strong> Bachat Gat.</p>
        <p>After careful consideration, we regret to inform you that your application has been <span style="color: #f44336; font-weight: bold;">rejected</span> at this time.</p>
        ${remarks ? `<p><strong>Reason:</strong> ${remarks}</p>` : ''}
        <p>We encourage you to apply again in the future or consider joining another Bachat Gat group.</p>
        <p>Thank you for your interest in our community.</p>
        <p>Best regards,<br/>Sushirmala Mahila Bachat Gat Team</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Rejection email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending rejection email:', error);
    return { success: false, error: error.message };
  }
};

// Send password reset email
const sendPasswordResetEmail = async (to, name, resetToken) => {
  const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;
  
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d7d9a;">Hello ${name},</h2>
        <p>You have requested to reset your password for your Sushrimala Mahila Bachat Gat account.</p>
        <p>Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #2d7d9a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>If the button doesn't work, copy and paste the following link in your browser:</p>
        <p style="word-break: break-all; color: #2d7d9a;">${resetUrl}</p>
        <p><strong>This link will expire in 1 hour.</strong></p>
        <p>If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
        <p>Best regards,<br/>Sushrimala Mahila Bachat Gat Team</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

// Send password reset confirmation email
const sendPasswordResetConfirmationEmail = async (to, name) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject: 'Password Reset Successful',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d7d9a;">Hello ${name},</h2>
        <p>Your password for your Sushrimala Mahila Bachat Gat account has been successfully reset.</p>
        <p>If you didn't make this change, please contact our support team immediately.</p>
        <p>You can now log in to your account with your new password.</p>
        <p>Best regards,<br/>Sushrimala Mahila Bachat Gat Team</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset confirmation email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset confirmation email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendApprovalEmail,
  sendRejectionEmail,
  sendPasswordResetEmail,
  sendPasswordResetConfirmationEmail
};