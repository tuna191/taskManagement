import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your email (e.g., yourapp@gmail.com)
    pass: process.env.EMAIL_PASS  // App password or real pass
  }
});

export const sendVerificationEmail = async (to, code) => {
  const { EMAIL_USER, EMAIL_PASS } = process.env;

  if (!EMAIL_USER || !EMAIL_PASS) {
    console.warn('Email credentials are missing — skipping email send.');
    return; // Không gửi mail nếu thiếu cấu hình
  }


  const mailOptions = {
    from: EMAIL_USER,
    to,
    subject: 'Verification Code',
    text: `Your code: ${code}`,
    html: `<p><b>Your code:</b> <span style="font-size: 20px;">${code}</span></p>`,
  };

  await transporter.sendMail(mailOptions);
};


export const sendSetupEmail = async (to, token) => {
  const link = `${process.env.NEXT_PUBLIC_URL_FE}/employee/setup?token=${token}`;
  const mailOptions = {
    from: `"Task Management" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Set up your employee account",
    html: `
      <h3>Welcome to Task Management!</h3>
      <p>Click the link below to complete your account setup:</p>
      <a href="${link}">${link}</a>
    `
  };
  await transporter.sendMail(mailOptions);
};