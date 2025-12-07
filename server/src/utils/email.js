const nodemailer = require('nodemailer');

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || '"FlowSpaces" <noreply@flowspaces.work>';
const WEB_URL = process.env.WEB_URL || 'http://localhost:5173';

// Create reusable transporter object using the default SMTP transport
let transporter = null;

const createTransporter = async () => {
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // true for 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
    console.log('✅ Email service configured with SMTP');
  } else {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    // For now, we will just simulate locally if no vars provided
    console.log('⚠️ No SMTP configuration found. Emails will be logged to console.');
  }
};

createTransporter();

/**
 * Send an invitation email to join a workspace
 * @param {string} to - Recipient email
 * @param {string} workspaceName - Name of the workspace
 * @param {string} inviterName - Name of the person inviting
 * @param {string} token - Invitation token
 */
const sendInvitationEmail = async (to, workspaceName, inviterName, token) => {
  const inviteLink = `${WEB_URL}/invite/${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #4f46e5; text-align: center;">You're invited to join ${workspaceName}</h2>
      <p style="font-size: 16px; color: #333;">Hello,</p>
      <p style="font-size: 16px; color: #333;"><strong>${inviterName}</strong> has invited you to join the <strong>${workspaceName}</strong> workspace on FlowSpaces.</p>
      <p style="font-size: 16px; color: #333;">Collaborate with your team, manage tasks, and track expenses all in one place.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${inviteLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Accept Invitation</a>
      </div>
      
      <p style="font-size: 14px; color: #666;">Or copy and paste this link into your browser:</p>
      <p style="font-size: 14px; color: #4f46e5; word-break: break-all;">${inviteLink}</p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #999; text-align: center;">This invitation will expire in 7 days.</p>
    </div>
  `;

  if (!transporter) {
    console.log('================================================');
    console.log(`📧 MOCK EMAIL TO: ${to}`);
    console.log(`Subject: Invitation to join ${workspaceName}`);
    console.log(`Link: ${inviteLink}`);
    console.log('================================================');
    return true;
  }

  try {
    const info = await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject: `Invitation to join ${workspaceName} on FlowSpaces`,
      html,
    });
    console.log('Message sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

module.exports = {
  sendInvitationEmail,
};
