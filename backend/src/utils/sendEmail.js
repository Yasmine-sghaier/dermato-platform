import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"Cabinet Dermatologique" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  });

  console.log(`📧 Email envoyé à ${to}`);
};
