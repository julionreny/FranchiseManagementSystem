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

module.exports = sendOtpEmail;
