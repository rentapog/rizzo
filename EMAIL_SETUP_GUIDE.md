# 📧 Email Autoresponder + Stripe Test Keys Setup Guide

## ✅ What I Just Fixed

### 1. **Enhanced Email Debugging**
- Added detailed console logs to track email sending
- Shows exact error messages when emails fail
- Displays Resend API key status on startup
- Confirms when each email is successfully sent

### 2. **Domain-Specific Stripe Keys**
- Added support for separate TEST and PRODUCTION Stripe keys
- `packages.airizzos.com` will now use test keys automatically
- No code changes needed - just set environment variables

### 3. **Created Diagnostic Tool**
- New `test-email-config.js` script to verify email setup
- Run this to test your Resend configuration

---

## 🚀 Setup Instructions for Render

### Step 1: Set Environment Variables in Render

Go to your Render dashboard → Your Service → **Environment** tab and add:

#### For Email (Required):
```bash
RESEND_API_KEY=re_YourResendAPIKey
```

#### For Stripe Production (RentAPog):
```bash
STRIPE_API_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

#### For Stripe Test (Airizzos - Optional):
```bash
STRIPE_TEST_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_TEST_WEBHOOK_SECRET=whsec_test_xxxxxxxxxxxxxxxxxxxxx
```

**Note**: If you don't set the TEST keys, Airizzos will use the production keys. Set TEST keys to use Stripe test mode for packages.airizzos.com.

### Step 2: Verify Resend Email Domain

1. Go to https://resend.com/domains
2. Make sure **rentapog.com** (or your domain) is verified
3. Verify that **sales@rentapog.com** is authorized to send emails
4. Check DNS records are properly configured in Namecheap

**Important**: Resend requires:
- SPF record
- DKIM record  
- Domain verification

### Step 3: Test Your Email Configuration

After redeploying, SSH into your Render instance and run:

```bash
node test-email-config.js your-email@example.com
```

This will:
- Check if RESEND_API_KEY is set
- Send a test email to your address
- Show detailed error messages if something fails

### Step 4: Redeploy Your Service

After adding environment variables:
1. Click **Manual Deploy** in Render
2. Wait for deployment to complete
3. Check the logs for:
   ```
   [Email Worker] Resend API Key: SET
   [Email Worker] API Key Preview: re_xxxxxxxx...
   ```

---

## 🔍 How to Debug Email Issues

### Check Server Logs in Render

When someone fills out the email form, you should see:

```
[Subscribe] ✓ Email capture: user@example.com
[Subscribe] Resend API Key configured: YES
[Subscribe] Initializing Resend with key: re_xxxxxxxx...
[Subscribe] Sending Email 1 (Welcome) to user@example.com...
[Subscribe] ✓✓✓ Email 1 (Welcome) SUCCESSFULLY sent to user@example.com
[Subscribe] Check inbox: user@example.com
[Subscribe] Sending Email 2 (Create Account) to user@example.com...
[Subscribe] ✓✓✓ Email 2 (Create Account) SUCCESSFULLY sent to user@example.com
```

### If You See Errors:

#### Error: "RESEND_API_KEY not set"
- **Fix**: Add RESEND_API_KEY to Render environment variables
- Redeploy the service

#### Error: "Email address not verified"
- **Fix**: Go to https://resend.com/domains
- Verify your domain (rentapog.com)
- Make sure sales@rentapog.com is authorized

#### Error: "API key invalid"
- **Fix**: Double-check your API key in Resend dashboard
- Copy it exactly (no extra spaces)
- Update in Render and redeploy

---

## 🧪 How Stripe Test Keys Work

### Before (Old Behavior):
- All domains used the same `STRIPE_API_KEY`
- Testing on Airizzos charged real money

### After (New Behavior):
- **packages.rentapog.com** → Uses `STRIPE_API_KEY` (production)
- **packages.airizzos.com** → Uses `STRIPE_TEST_SECRET_KEY` (test mode)

### To Use Test Mode for Airizzos:

1. Get your Stripe TEST keys from: https://dashboard.stripe.com/test/apikeys
2. Copy the **Secret key** (starts with `sk_test_`)
3. Add to Render:
   ```bash
   STRIPE_TEST_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
   ```
4. Redeploy

Now when someone goes to `packages.airizzos.com` and purchases, it will use Stripe test mode!

---

## 📝 Email Flow Explained

When someone fills out the email capture form:

1. **Email is saved** to database with their personal affiliate code
2. **Email 1 sent**: "You're In! Welcome to RentAPog"
3. **Email 2 sent**: "Create Your Account - Get Your Affiliate Link"
4. **If referred**: Referrer gets notified about the new lead

All emails are sent **immediately** - no delay, no worker needed for these.

The email worker (`emailWorker.ts`) handles *scheduled* email sequences (Day 0, Day 2, Day 4, etc.) which are different from the immediate welcome emails.

---

## ⚠️ DNS Propagation Note

You mentioned you "just updated DNS settings in Namecheap". DNS changes can take:
- **5-30 minutes** for most changes
- **Up to 48 hours** in rare cases

To check DNS propagation:
```bash
# Check if your domain points to the right place
nslookup packages.airizzos.com

# Or use online tool:
# https://www.whatsmydns.net/
```

---

## ✅ Checklist

After deployment, verify:

- [ ] Render environment has `RESEND_API_KEY` set
- [ ] Render logs show "Resend API Key: SET"
- [ ] Domain verified at https://resend.com/domains
- [ ] Test email script works: `node test-email-config.js your@email.com`
- [ ] Fill out email form and check inbox (and spam folder!)
- [ ] Check Render logs for "✓✓✓ Email ... SUCCESSFULLY sent"
- [ ] (Optional) `STRIPE_TEST_SECRET_KEY` set for Airizzos testing

---

## 🆘 Still Not Working?

### Quick Diagnostics:

1. **Check Render Logs** (real-time):
   ```
   Render Dashboard → Your Service → Logs
   ```
   Look for email-related errors

2. **Run Test Script**:
   ```bash
   node test-email-config.js your-email@example.com
   ```

3. **Check Resend Dashboard**:
   - Go to https://resend.com/emails
   - See if emails are showing up (even if failed)
   - Check error messages

4. **Verify From Email**:
   - Make sure you're using an email from your verified domain
   - Currently set to: `sales@rentapog.com`
   - Change in code if you want different sender

### Common Issues:

| Issue | Solution |
|-------|----------|
| No emails arriving | Check spam folder, verify domain in Resend |
| "Domain not verified" error | Add DNS records from Resend to Namecheap |
| "API key invalid" | Copy fresh key from Resend dashboard |
| Emails work locally but not on Render | Check environment variables are set in Render |
| DNS not resolving | Wait 30 min - 48 hours for propagation |

---

## 📞 Need Help?

If still having issues, check the Render logs and look for:
```
[Subscribe] ✗✗✗ FAILED to send welcome emails!
```

The detailed error message will tell you exactly what's wrong.
