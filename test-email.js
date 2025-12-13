const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
});

transporter.sendMail({
  from: `RentAPog <${process.env.GMAIL_USER}>`,
  to: process.env.GMAIL_USER,
  subject: "Test Email - RentAPog System",
  html: "<h1>If you see this, emails are working!</h1>",
}, (err, info) => {
  if (err) {
    console.error("ERROR:", err);
    process.exit(1);
  }
  console.log("SUCCESS! Email sent:", info.messageId);
  process.exit(0);
});
