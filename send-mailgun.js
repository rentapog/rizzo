import FormData from "form-data";
import Mailgun from "mailgun.js";
import dotenv from "dotenv";
dotenv.config();

async function sendSimpleMessage() {
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY || "API_KEY",
    // url: "https://api.eu.mailgun.net" // Only if using EU region
  });
  try {
    const data = await mg.messages.create("mail.rentapog.com", {
      from: "Mailgun Sandbox <postmaster@mail.rentapog.com>",
      to: ["grant rizzoli <support@rentapog.com>"],
      subject: "Hello grant rizzoli",
      text: "Congratulations grant rizzoli, you just sent an email with Mailgun! You are truly awesome!",
    });

    console.log(data);
  } catch (error) {
    console.log(error);
  }
}

sendSimpleMessage();
