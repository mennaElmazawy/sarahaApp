import nodemailer from "nodemailer";




export const sendEmail = async (to, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "menahossam50@gmail.com",       
      pass: "frhdcfsutpvdgvfq",    
    },
  });

  await transporter.sendMail({
    from: "menahossam50@gmail.com",
    to,
    subject: "Saraha App OTP Verification",
    text: `Your OTP is: ${otp}`,
  });
};

