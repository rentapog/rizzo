#!/usr/bin/env node

/**
 * Email Configuration Diagnostic Tool
 * 
 * This script helps diagnose email configuration issues.
 * Run this on your Render server to verify everything is set up correctly.
 * 
 * Usage:
 *   node test-email-config.js your-email@example.com
 */

import { Resend } from 'resend';
import 'dotenv/config';

const testEmail = process.argv[2];

if (!testEmail) {
  console.error('❌ Usage: node test-email-config.js your-email@example.com');
  process.exit(1);
}

console.log('═══════════════════════════════════════════════');
console.log('  📧 RentAPog Email Configuration Diagnostic');
console.log('═══════════════════════════════════════════════\n');

// Check 1: Environment Variables
console.log('1️⃣  Checking Environment Variables...');
const resendKey = process.env.RESEND_API_KEY;
const sendgridKey = process.env.SENDGRID_API_KEY;

if (resendKey) {
  console.log(`   ✅ RESEND_API_KEY is set`);
  console.log(`   📝 Preview: ${resendKey.substring(0, 10)}...`);
} else {
  console.log('   ❌ RESEND_API_KEY is NOT set');
}

if (sendgridKey) {
  console.log(`   ✅ SENDGRID_API_KEY is set (for Airizzos)`);
} else {
  console.log('   ⚠️  SENDGRID_API_KEY not set (only needed for Airizzos)');
}

console.log('');

// Check 2: Test Email Send
if (resendKey) {
  console.log('2️⃣  Testing Email Send with Resend...');
  console.log(`   📤 Sending test email to: ${testEmail}`);
  
  try {
    const resend = new Resend(resendKey);
    const result = await resend.emails.send({
      from: 'RentAPog <sales@rentapog.com>',
      to: testEmail,
      subject: '✅ Email Test Successful - RentAPog',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #10b981;">✅ Success!</h1>
          <p>Your RentAPog email system is working correctly!</p>
          <p>This test was sent at: ${new Date().toISOString()}</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            If you received this email, your Resend configuration is correct.
          </p>
        </div>
      `,
      text: `✅ Success! Your RentAPog email system is working correctly!\n\nThis test was sent at: ${new Date().toISOString()}\n\nIf you received this email, your Resend configuration is correct.`
    });
    
    console.log('   ✅ Email sent successfully!');
    console.log(`   📋 Email ID: ${result.data?.id || 'N/A'}`);
    console.log('');
    console.log('═══════════════════════════════════════════════');
    console.log('  ✅ ALL CHECKS PASSED!');
    console.log('═══════════════════════════════════════════════');
    console.log('\n📝 Next Steps:');
    console.log('   1. Check your inbox: ' + testEmail);
    console.log('   2. If no email arrives in 2 minutes, check:');
    console.log('      • Spam/Junk folder');
    console.log('      • Resend dashboard: https://resend.com/emails');
    console.log('      • Domain verification: https://resend.com/domains');
    console.log('   3. Make sure "sales@rentapog.com" is verified in Resend');
    
  } catch (error) {
    console.log('   ❌ Email send FAILED!');
    console.log('   Error:', error.message);
    console.log('');
    console.log('═══════════════════════════════════════════════');
    console.log('  ❌ EMAIL SEND FAILED');
    console.log('═══════════════════════════════════════════════');
    console.log('\n🔧 Troubleshooting Steps:');
    console.log('   1. Verify your Resend API key is correct');
    console.log('   2. Check domain verification at: https://resend.com/domains');
    console.log('   3. Make sure "sales@rentapog.com" is verified');
    console.log('   4. Check Resend dashboard for error details');
    console.log('   5. Error message:', error.message);
  }
} else {
  console.log('2️⃣  ❌ Cannot test email - RESEND_API_KEY not set');
  console.log('');
  console.log('═══════════════════════════════════════════════');
  console.log('  ❌ CONFIGURATION INCOMPLETE');
  console.log('═══════════════════════════════════════════════');
  console.log('\n🔧 Action Required:');
  console.log('   1. Go to Resend: https://resend.com');
  console.log('   2. Create an API key');
  console.log('   3. Add to Render environment:');
  console.log('      RESEND_API_KEY=re_xxxxxxxxxxxxx');
  console.log('   4. Redeploy your Render service');
}

console.log('');
