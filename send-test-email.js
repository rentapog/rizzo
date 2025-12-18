// send-test-email.js
// Usage: node send-test-email.js
// Sends a test email using Resend (emailWorker.ts)

const path = require('path');
const { sendTestEmail } = require(path.join(__dirname, 'server', 'emailWorker.ts'));

(async () => {
  try {
    await sendTestEmail('rentapog71@outlook.com'); // Change email as needed
    console.log('Test email sent!');
  } catch (err) {
    console.error('Error sending test email:', err);
    process.exit(1);
  }
})();
