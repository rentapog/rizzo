# Namecheap Affiliate Links Setup Guide for RentAPog

## Overview
You need to create 3 different affiliate links for your platform:
1. **Registration Affiliate Link** - For initial user registration (tracks first domain purchase)
2. **Package Upgrade Affiliate Link** - For upgrading to Silver ($49/day), Gold ($99/day), or Platinum ($199/day) packages
3. **(Optional) Admin Affiliate Link** - For tracking admin commissions from 2nd sales that pass up

---

## Step-by-Step Setup in Namecheap

### 1. Create Your Affiliate Account
- Go to **https://www.namecheap.com/affiliates/**
- Click "Join Now" or "Become an Affiliate"
- Complete the application form with your business details
- Namecheap will review and approve your affiliate account (usually 24-48 hours)

### 2. Access Your Affiliate Dashboard
- Once approved, log into your Namecheap account
- Go to **Settings** → **Affiliate Program**
- You'll see your **Affiliate ID** (save this - you'll need it)

### 3. Generate Affiliate Links

In the Affiliate Dashboard:

**For Registration Link:**
- Click "Create Link"
- Link Type: **Domain Registration** or **General Category**
- Campaign Name: "RentAPog_Registration"
- Promotional Text: "Domain rental affiliate program"
- This creates a link like: `https://www.namecheap.com/?aff=YOUR_AFFILIATE_ID&utm_campaign=rentapog_registration`
- **Use this as your registration affiliate URL**

**For Upgrade/Package Link:**
- Click "Create Link" again
- Link Type: **Specific Promotion** (if available) or **Domain + Services**
- Campaign Name: "RentAPog_Upgrades"
- Promotional Text: "Premium domain rental packages"
- This creates: `https://www.namecheap.com/?aff=YOUR_AFFILIATE_ID&utm_campaign=rentapog_upgrades`
- **Use this for package upgrade affiliate tracking**

---

## How to Use These Links in RentAPog

### 1. Registration Flow (First Domain Purchase)
- User registration URL: `https://your-app.com/register?aff=YOUR_NAMECHEAP_AFFILIATE_ID`
- When user registers, the `affiliateLink` parameter is captured and stored in their account
- When they purchase their first domain, they're tracked under your Namecheap affiliate account
- Commission is earned on that domain registration

### 2. Package Upgrades
- Create upgrade links with the package affiliate URL
- Share links: 
  - Silver: `https://your-app.com/packages?aff=YOUR_NAMECHEAP_AFFILIATE_ID&package=silver`
  - Gold: `https://your-app.com/packages?aff=YOUR_NAMECHEAP_AFFILIATE_ID&package=gold`
  - Platinum: `https://your-app.com/packages?aff=YOUR_NAMECHEAP_AFFILIATE_ID&package=platinum`
- Store these links in your backoffice UI

### 3. Track in Your Database
- The system now stores `affiliateLink` and `packageAffiliateLink` in each user record
- You can see which affiliate link brought them in
- Cross-reference with Namecheap's dashboard for commission tracking

---

## Commission Structure

**Domain Registrations (via Namecheap):**
- Typically 25-30% commission on first year domain cost
- Renewal commissions: typically 10-15%
- Check your Namecheap affiliate agreement for exact rates

**Your Internal 2nd Sale Pass-up:**
- This is separate from Namecheap
- Every user's 2nd referral sale goes to admin (you)
- 1st and 3rd+ referral sales go to the user

---

## Implementation in Your System

### Database Updates
- ✅ `affiliateLink` field: Stores the initial registration affiliate link
- ✅ `packageAffiliateLink` field: Stores package upgrade affiliate link
- ✅ Payment verification in Stripe webhook
- ✅ Account auto-cancellation if payment fails
- ✅ Login blocked for cancelled accounts

### How Payment Verification Works

1. **User clicks package upgrade button** → Stripe checkout with Namecheap link tracking
2. **Payment processed** → Stripe webhook fires
3. **Webhook checks:**
   - If charge.failed: Account balance insufficient → **ACCOUNT CANCELLED**
   - All referrals automatically go to admin
   - User cannot login anymore
4. **User contacts support** → Can reactivate if funds are added

---

## Important Notes

⚠️ **Payment Requirement:**
- Users MUST keep at least $20 in their account for daily charges
- This $20 comes from their first referral commission
- If balance drops below required amount, their subscription auto-cancels

⚠️ **Affiliate Link Requirement:**
- Users CANNOT register without an affiliate link in the URL
- Registration page checks for `?aff=AFFILIATE_ID` parameter
- If missing, they get: "Invalid or missing affiliate link. Please use an affiliate link to register."

✅ **Account Cancellation Means:**
- User's account is INACTIVE and cannot login
- ALL referrals transfer to admin (you)
- Even if they had 50 referrals generating $1000s/month, ALL go to admin
- To reactivate: They must contact support and add funds to their account

---

## Testing Your Setup

1. **Test Registration Link:**
   - Visit: `https://your-app.com/register?aff=test123`
   - Should show affiliate link in registration form
   - Without `?aff` parameter, registration button should be disabled

2. **Test Payment Failure:**
   - Create test account with insufficient balance
   - Try to login next day
   - Should show: "Your account has been cancelled due to payment failure"

3. **Verify Namecheap Tracking:**
   - In Namecheap affiliate dashboard, you should see traffic from your affiliate links
   - Commissions will be credited when customers complete domain registrations

---

## Troubleshooting

**"Affiliate link is required to register"**
- Solution: Make sure your registration URL includes `?aff=YOUR_AFFILIATE_ID`

**"Your account has been cancelled"**
- This means payment failed and balance was insufficient
- User needs to contact support to reactivate with payment

**Not seeing Namecheap commissions**
- Verify affiliate link is being used correctly
- Check Namecheap dashboard → Affiliate → Stats
- Commissions can take 24-48 hours to appear

---

## Your Affiliate Links (Update These)

| Type | URL | Use Case |
|------|-----|----------|
| Registration | `https://your-app.com/register?aff=YOUR_NAMECHEAP_ID` | Initial signup |
| Silver Upgrade | `https://your-app.com/packages?aff=YOUR_NAMECHEAP_ID&package=silver` | $49/day upgrade |
| Gold Upgrade | `https://your-app.com/packages?aff=YOUR_NAMECHEAP_ID&package=gold` | $99/day upgrade |
| Platinum Upgrade | `https://your-app.com/packages?aff=YOUR_NAMECHEAP_ID&package=platinum` | $199/day upgrade |

Replace `YOUR_NAMECHEAP_ID` with your actual Namecheap Affiliate ID.

---

**Last Updated:** November 29, 2025
