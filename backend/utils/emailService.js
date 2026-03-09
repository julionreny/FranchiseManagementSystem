const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOtpEmail = async (toEmail, otp) => {
  await transporter.sendMail({
    from: `"Franchise System" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "OTP Verification",
    text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
  });
};

const sendResetTokenEmail = async (toEmail, token) => {
  await transporter.sendMail({
    from: `"Franchise System" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Password Reset Token",
    text: `Your password reset token is ${token}. It is valid for 15 minutes. If you did not request this, please ignore this email.`,
  });
};

const sendManagerInviteEmail = async (toEmail, inviteCode, branchName) => {
  await transporter.sendMail({
    from: `"Franchise System" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Invitation to Manage Branch: ${branchName}`,
    html: `
      <h2>Welcome to the Franchise System!</h2>
      <p>You have been invited to manage the branch: <strong>${branchName}</strong>.</p>
      <p>Please use the following invite code to register your account:</p>
      <div style="font-size: 24px; font-weight: bold; background: #f1f5f9; padding: 10px; display: inline-block; border-radius: 5px; margin: 10px 0;">
        ${inviteCode}
      </div>
      <p>You can register here: <a href="http://localhost:5173/register/manager">Register as Manager</a></p>
      <p>If you have any questions, please contact your franchise owner.</p>
    `,
  });
};

module.exports = { sendOtpEmail, sendResetTokenEmail, sendManagerInviteEmail };
