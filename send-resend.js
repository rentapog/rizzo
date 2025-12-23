import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function main() {
  try {
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM,
      to: 'Grant Rizzoli <support@rentapog.com>',
      subject: 'Hello from Resend',
      text: 'Congratulations grant rizzoli, you just sent an email with Resend! You are truly awesome!',
    });
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

main();
