# AWeber Email Integration for Affiliate Referrals

## Overview
This guide shows you how to set up AWeber to automatically email your users with their personalized affiliate links and track referrals.

---

## Step 1: In Your RentAPog App - Store User's Affiliate Link

**What's Already Set Up:**
- When users register, their `affiliateLink` is stored (e.g., their Namecheap affiliate ID)
- Their unique `referralCode` is auto-generated
- The system tracks their first 3 referrals (1st = 100% to user, 2nd = admin, 3rd = 100% to user)

**What You Need to Do:**
When a user is added to AWeber, include their affiliate info so you can send them personalized emails.

---

## Step 2: AWeber Setup - Create Custom Fields

1. **Login to AWeber Dashboard**
   - Go to Settings → Lists → Your List Name → Custom Fields

2. **Add These Custom Fields:**
   - Field Name: `REFERRAL_CODE`
   - Field Name: `AFFILIATE_LINK`
   - Field Name: `AFFILIATE_TYPE` (e.g., "namecheap" or "package")

3. **Save Custom Fields**

---

## Step 3: Sync User Data to AWeber With Referral Info

**In Your Backend (Already Partially Set Up):**

The system already syncs leads to AWeber. When syncing, include referral code:

```javascript
// In server/routes.ts - Update the AWeber sync to include referral data
const syncResponse = await fetch(`${aweberListUrl}/subscribers`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: lead.email,
    name: user?.name || "Subscriber",
    custom_fields: {
      REFERRAL_CODE: user?.referralCode || "",
      AFFILIATE_LINK: user?.affiliateLink || "",
      AFFILIATE_TYPE: "namecheap"
    },
    tags: ["rentapog-user"]
  })
});
```

---

## Step 4: Create Automated Email Sequence in AWeber

### Email #1: Welcome + Your Affiliate Link
**Subject:** "Your RentAPog Affiliate Link is Ready - Start Earning Today"

**Template:**
```
Hi {NAME},

Welcome to RentAPog! 🎉

Your first 3 referrals are FREE from our platform cost. Here's how it works:

Sale #1: You keep 100%
Sale #2: Goes to Admin (platform cost)
Sale #3: You keep 100%

That's $40/day minimum just from your first 2 sales!

---

YOUR AFFILIATE LINK:
https://your-app.com/register?aff={AFFILIATE_LINK}

SHARE THIS LINK with anyone interested in renting domains daily.

When they sign up and make their first purchase, the commission automatically credits to your account. Daily payouts via Stripe!

---

UPGRADE OPTIONS:
Silver ($49/day): https://your-app.com/packages?aff={AFFILIATE_LINK}&package=silver
Gold ($99/day): https://your-app.com/packages?aff={AFFILIATE_LINK}&package=gold
Platinum ($199/day): https://your-app.com/packages?aff={AFFILIATE_LINK}&package=platinum

Questions? Reply to this email or check out "How It Works" on our site.

Best,
RentAPog Team
```

### Email #2: 24 Hours Later - Stats Check In
**Subject:** "How Many People Have Clicked Your Link?"

```
Hi {NAME},

Just checking in! Have you shared your affiliate link yet?

YOUR LINK:
https://your-app.com/register?aff={AFFILIATE_LINK}

The sooner you share, the sooner commissions start. Remember:
- Your 1st & 3rd referrals = 100% commission
- Platform works best when you're actively sharing

Need ideas? Share on:
- Social media
- Email lists
- Forums/communities
- Your personal network

Dashboard: Log in to see your referral stats anytime.

Get referrals now →
https://your-app.com/register?aff={AFFILIATE_LINK}

-RentAPog
```

### Email #3: 7 Days Later - Social Proof
**Subject:** "Other Affiliates Are Already Earning - Here's Proof"

```
Hi {NAME},

Affiliates on RentAPog are already cashing in. See real earnings:

"Made $600 in my first month" - Maria
"Daily payouts are amazing" - James
"Easiest affiliate system ever" - David

YOUR REFERRAL LINK:
https://your-app.com/register?aff={AFFILIATE_LINK}

Start earning today:
https://your-app.com/register?aff={AFFILIATE_LINK}

-RentAPog
```

---

## Step 5: Set Up Automation Rules in AWeber

1. **Create Automation:**
   - Go to Automations → Create New
   - Trigger: "Subscriber Added to List"
   - Add Email #1 (Welcome)
   - Wait 1 day
   - Add Email #2 (Check In)
   - Wait 7 days
   - Add Email #3 (Social Proof)

2. **Add Tags:**
   - Tag subscribers as "rentapog-user"
   - This helps segment them later

---

## Step 6: Track Referrals in Your System

**Backend Code to Add (server/routes.ts):**

```typescript
// New endpoint to track referral signups
app.post("/api/referral/track", async (req, res) => {
  try {
    const { userId, referralCode, affiliateLink } = req.body;
    
    if (!userId || !referralCode) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Get referrer
    const referrer = await storage.getUserByReferralCode(referralCode);
    if (!referrer) {
      return res.status(404).json({ message: "Invalid referral code" });
    }

    // Increment their sales count
    await storage.incrementUserSalesCount(referrer.id);
    const updatedReferrer = await storage.getUserById(referrer.id);
    
    const saleNumber = updatedReferrer?.salesCount || 0;
    let passedUpTo = null;
    
    // If this is their 2nd sale, it goes to admin
    if (saleNumber === 2) {
      passedUpTo = "admin";
    }

    // Log the referral
    await storage.createAffiliateSale({
      sellerId: referrer.id,
      buyerId: userId,
      amount: 2000, // $20 in cents
      passedUpTo,
      saleNumber,
      stripePaymentId: "referral-" + Date.now(),
    });

    res.json({ 
      success: true, 
      saleNumber,
      passedUpTo,
      message: saleNumber === 2 ? "This referral goes to admin" : "Commission credited to your account"
    });
  } catch (error) {
    res.status(500).json({ error: "Referral tracking failed" });
  }
});
```

---

## Step 7: Personalize Email Links

In AWeber, when creating automated emails:

1. Use merge tags for personalization
2. Add subscriber's affiliate link to each email
3. Track clicks with UTM parameters

**Email Link Examples:**
```
Main registration: https://your-app.com/register?aff={AFFILIATE_LINK}
With UTM tracking: https://your-app.com/register?aff={AFFILIATE_LINK}&utm_source=aweber&utm_medium=email
```

---

## Step 8: Dashboard for Affiliates (Future)

In their dashboard, users should see:
- Their affiliate link
- Number of referrals (1st = pending/approved, 2nd = admin, 3rd = pending/approved)
- Commission earned
- Payouts received

For now, store this logic ready:
```typescript
// Affiliate dashboard endpoint
app.get("/api/affiliates/:userId/stats", async (req, res) => {
  try {
    const sales = await storage.getSalesByReferrer(req.params.userId);
    
    const stats = {
      totalReferrals: sales.length,
      totalCommission: sales
        .filter(s => s.passedUpTo !== "admin")
        .reduce((sum, s) => sum + s.amount, 0),
      referralsToAdmin: sales.filter(s => s.passedUpTo === "admin").length,
      affiliateLink: user?.affiliateLink,
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});
```

---

## Step 9: Monitor & Optimize

**Track in AWeber Dashboard:**
- Click rates on affiliate links
- Subscriber engagement
- Best performing email times

**Adjust emails based on:**
- Open rates
- Click rates
- Unsubscribe rates

---

## Implementation Checklist

- [ ] Create custom fields in AWeber (REFERRAL_CODE, AFFILIATE_LINK, AFFILIATE_TYPE)
- [ ] Update backend sync code to include referral data
- [ ] Create 3-email automation sequence in AWeber
- [ ] Set up automation rules to send emails automatically
- [ ] Test by signing up and checking AWeber dashboard
- [ ] Verify referral tracking works
- [ ] Add affiliate dashboard endpoint
- [ ] Test full flow: Email → Click Link → Sign Up → Commission Tracked

---

## Example Flow

1. **New User Signs Up** with affiliate code → Stored in database
2. **Added to AWeber** with their referral code/affiliate link
3. **AWeber Sends Welcome Email** with their personalized affiliate link
4. **User Shares Link** with others
5. **New Person Clicks Link** → Redirected to `/register?aff=THEIR_CODE`
6. **New Person Signs Up** → Commission attributed to original user
7. **User Sees Referral** in their account (later: in dashboard)
8. **Stripe Payout** sent daily based on commissions

---

## Your Affiliate Link Structure

Replace these in your email templates:

| Variable | Example | Purpose |
|----------|---------|---------|
| `{AFFILIATE_LINK}` | YOUR_NAMECHEAP_ID | User's affiliate ID from Namecheap |
| `{REFERRAL_CODE}` | A1B2C3D4E5F6 | Your internal tracking code |
| `{NAME}` | John | Subscriber's name |

---

**Last Updated:** November 29, 2025
**Status:** Ready to implement
