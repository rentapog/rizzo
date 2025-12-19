import { Resend } from "resend";
import axios from "axios";
// Resend email sending utility
export async function sendAffiliateEmailMailgun({
  toEmail,
  affiliateCode = "rentapog",
  subject = "Your Unique Affiliate Link Inside 🚀",
  text,
  html
}: {
  toEmail: string;
  affiliateCode?: string;
  subject?: string;
  text?: string;
  html?: string;
}) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const defaultHtml = `<h2>Welcome to RentAPog!</h2><p>Your affiliate link is ready:</p><p><a href="https://packages.rentapog.com/?aff=${affiliateCode}">https://packages.rentapog.com/?aff=${affiliateCode}</a></p>`;
  const defaultText = `Welcome to RentAPog!\nYour affiliate link: https://packages.rentapog.com/?aff=${affiliateCode}`;
  try {
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM || "RentAPog <sales@rentapog.com>",
      to: toEmail,
      subject,
      text: text || defaultText,
      html: html || defaultHtml,
    });
    return data;
  } catch (error) {
    console.error("[Resend] Failed to send email:", error);
    return null;
  }
}

// Utility: Add a subscriber to AWeber list
export async function addAWeberSubscriber({
  accessToken,
  listId,
  email,
  name
}: {
  accessToken: string;
  listId: string;
  email: string;
  name?: string;
}) {
  try {
    const res = await axios.post(
      `https://api.aweber.com/1.0/accounts/me/lists/${listId}/subscribers`,
      {
        email,
        name,
        tags: ["rentapog"],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return res.data;
  } catch (err: any) {
    console.error("[AWeber] Failed to add subscriber:", err?.response?.data || err);
    return null;
  }
}

// Email templates for the 7-day sequence
const emailTemplates = {
    dayNew: (affiliateCode: string) => ({
      subject: "Your New Affiliate Link (Test)",
      html: `
        <h2>Welcome to RentAPog (New Template)!</h2>
        <p>This is a new test template to confirm link updates.</p>
        <p><strong><a href="https://packages.rentapog.com/?aff=${affiliateCode}">https://packages.rentapog.com/?aff=${affiliateCode}</a></strong></p>
        <p>Share this link to earn commissions!</p>
      `,
    }),
  day0: (affiliateCode: string) => ({
    subject: "Your Unique Affiliate Link Inside 🚀",
    html: `
      <h2>Welcome to RentAPog!</h2>
      <p>Your affiliate link is ready to start earning commissions:</p>
      <p><strong><a href="https://packages.rentapog.com/?aff=${affiliateCode}">https://packages.rentapog.com/?aff=${affiliateCode}</a></strong></p>
      <p>Anyone who signs up through this link becomes your referral. You'll get 100% of their 1st and 3rd+ sales!</p>
      <hr style="margin:32px 0;"/>
      <h3 style="color:#2563eb;">How to Whitelist <span style="color:#2563eb;">support@rentapog.com</span>:</h3>
      <ul style="margin-bottom:16px;">
        <li><b>Gmail:</b> Open our email, click the three dots, select "Add to Contacts list". If in Spam, click "Not spam" first.</li>
        <li><b>Outlook/Hotmail:</b> Open our email, right-click and select "Not Junk". Add to Safe Senders in settings if needed.</li>
        <li><b>Yahoo:</b> Mark as "Not Spam" and add us to contacts.</li>
        <li><b>Apple Mail:</b> Tap sender, then "Add to VIP" or "Add to Contacts".</li>
        <li><b>Any provider:</b> Add support@rentapog.com to your address book and mark our emails as "Not Spam".</li>
      </ul>
      <p style="color:#64748b;font-size:13px;text-align:center;">Whitelisting our email ensures you never miss important updates from us!</p>
    `,
  }),
  day2: (affiliateCode: string) => ({
    subject: "3 Ways to Earn This Week 💰",
    html: `
      <h2>3 Ways to Earn This Week</h2>
      <p>Share your link: <strong><a href="https://packages.rentapog.com/?aff=${affiliateCode}">https://packages.rentapog.com/?aff=${affiliateCode}</a></strong></p>
      <ol>
        <li>Share with friends and get 100% on their 1st sale</li>
        <li>Post in communities and watch referrals roll in</li>
        <li>Use your referrals to earn even more</li>
      </ol>
    `,
  }),
  day4: (affiliateCode: string) => ({
    subject: "Members Earning $200+ Per Week 📈",
    html: `
      <h2>Members Earning $200+ Per Week</h2>
      <p>Top affiliates are crushing it! Get your referral link out there:</p>
      <p><strong><a href="https://packages.rentapog.com/?aff=${affiliateCode}">https://packages.rentapog.com/?aff=${affiliateCode}</a></strong></p>
      <p>Each referral you send can generate daily commissions for you!</p>
    `,
  }),
  day6: (affiliateCode: string) => ({
    subject: "Your Earnings Dashboard Is Ready 🎁",
    html: `
      <h2>Your Earnings Dashboard Is Ready</h2>
      <p>Time to start sharing your link and earning! Your link:</p>
      <p><strong><a href="https://packages.rentapog.com/?aff=${affiliateCode}">https://packages.rentapog.com/?aff=${affiliateCode}</a></strong></p>
      <p>Each signup gets you closer to passive daily income.</p>
    `,
  }),
  day8: (affiliateCode: string) => ({
    subject: "Don't Leave Money on the Table 💸",
    html: `
      <h2>Don't Leave Money on the Table</h2>
      <p>Every day you're not sharing your link is money you're missing out on.</p>
      <p>Affiliate link: <strong><a href="https://packages.rentapog.com/?aff=${affiliateCode}">https://packages.rentapog.com/?aff=${affiliateCode}</a></strong></p>
      <p>Start sharing now!</p>
    `,
  }),
  day10: (affiliateCode: string) => ({
    subject: "Time to Scale Your Earnings 🚀",
    html: `
      <h2>Time to Scale Your Earnings</h2>
      <p>Don't miss out on daily commissions - share your link now!</p>
      <p><strong><a href="https://packages.rentapog.com/?aff=${affiliateCode}">https://packages.rentapog.com/?aff=${affiliateCode}</a></strong></p>
      <p>Premium packages unlock even more earning potential.</p>
    `,
  }),
  day14: (affiliateCode: string) => ({
    subject: "Level Up Your Earnings (Premium) ⭐",
    html: `
      <h2>Level Up Your Earnings</h2>
      <p>Ready for more? Premium features unlock unlimited referrals.</p>
      <p>Your link: <strong><a href="https://packages.rentapog.com/?aff=${affiliateCode}">https://packages.rentapog.com/?aff=${affiliateCode}</a></strong></p>
      <p>Keep growing your affiliate network!</p>
    `,
  }),
};

