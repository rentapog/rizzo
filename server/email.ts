import nodemailer from "nodemailer";

// Email templates for the 7-day sequence
const emailTemplates = {
  day0: (affiliateCode: string) => ({
    subject: "Your Unique Affiliate Link Inside 🚀",
    html: `
      <h2>Welcome to RentAPog!</h2>
      <p>Your affiliate link is ready to start earning commissions:</p>
      <p><strong><a href="https://packages.rentapog.com/?aff=${affiliateCode}">https://packages.rentapog.com/?aff=${affiliateCode}</a></strong></p>
      <p>Anyone who signs up through this link becomes your referral. You'll get 100% of their 1st and 3rd+ sales!</p>
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

export async function sendAffiliateEmail(
  toEmail: string,
  affiliateCode: string,
  emailType: string
) {
  try {
    // Use Gmail SMTP for now - user can connect SendGrid later if they want
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER || "",
        pass: process.env.GMAIL_PASSWORD || "",
      },
    });

    const template = emailTemplates[emailType as keyof typeof emailTemplates];
    if (!template) {
      console.error(`Unknown email type: ${emailType}`);
      return false;
    }

    const { subject, html } = template(affiliateCode);

    await transporter.sendMail({
      from: process.env.GMAIL_USER || "noreply@rentapog.com",
      to: toEmail,
      subject,
      html,
    });

    return true;
  } catch (error) {
    console.error(`Failed to send ${emailType} email:`, error);
    return false;
  }
}
