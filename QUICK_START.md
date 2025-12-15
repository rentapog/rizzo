# 🚀 Quick Start - Email & Stripe Fix

## What Changed?

✅ **Better Email Debugging** - See exactly what's happening in logs  
✅ **Stripe Test Keys for Airizzos** - Use test mode on packages.airizzos.com  
✅ **Diagnostic Tool** - Test your email setup easily  

---

## 🔧 Action Items for Render

### 1. Add Environment Variables

```bash
# Required for emails:
RESEND_API_KEY=re_YourKeyHere

# Optional - for Airizzos test mode:
STRIPE_TEST_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_TEST_WEBHOOK_SECRET=whsec_test_xxxxxxxxxxxxxxxxxxxxx
```

### 2. Redeploy

Click "Manual Deploy" in Render dashboard

### 3. Verify in Logs

Look for:
```
[Email Worker] Resend API Key: SET
[Email Worker] API Key Preview: re_xxxxxxxx...
```

### 4. Test It

Fill out your email form and check Render logs for:
```
[Subscribe] ✓✓✓ Email 1 (Welcome) SUCCESSFULLY sent
```

---

## 🔍 Troubleshooting Commands

```bash
# Test email configuration
node test-email-config.js your-email@example.com

# Check DNS propagation
nslookup packages.airizzos.com
```

---

## 📧 Resend Setup

1. **Verify domain**: https://resend.com/domains
2. **Check DNS records** in Namecheap (SPF, DKIM)
3. **Authorize** sales@rentapog.com to send

---

## 🎯 How It Works Now

### RentAPog (Production):
- Uses `STRIPE_API_KEY` (live charges)
- Sends emails via Resend

### Airizzos (Test Mode):
- Uses `STRIPE_TEST_SECRET_KEY` (if set)
- Falls back to production keys if not set
- Sends emails via SendGrid (if configured) or Resend

---

## ⚠️ Common Issues

| Problem | Fix |
|---------|-----|
| No emails | Check RESEND_API_KEY is set in Render |
| Domain not verified | Add DNS records from Resend to Namecheap |
| DNS not working | Wait 30min-48hrs for propagation |
| Test mode not working | Set STRIPE_TEST_SECRET_KEY in Render |

---

📖 **Full guide**: See `EMAIL_SETUP_GUIDE.md`
