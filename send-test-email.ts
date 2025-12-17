// send-test-email.ts
// Usage: npx tsx send-test-email.ts
// Sends a test email using Resend (emailWorker.ts)

import { sendTestEmail } from './server/emailWorker.ts';

(async () => {
  try {
    await sendTestEmail('rentapog71@outlook.com'); // Change email as needed
    console.log('Test email sent!');
  } catch (err) {
    console.error('Error sending test email:', err);
    process.exit(1);
  }
})();
