import nodemailer from "nodemailer";
import { EMAIL, PASSWORD, } from "../../../../config/config.service.js";




export const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    // tls: {
    //   rejectUnauthorized: false,
    // },
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: EMAIL,
    to,
    subject: subject || "Saraha App OTP Verification",
    html: html ,
    attachments: attachments || []
  });
  return info.accepted.length > 0 ? true : false;
};

export const generateOTP = async () => {
  return Math.floor(Math.random() * 900000 + 100000);
}

