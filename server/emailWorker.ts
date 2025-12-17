import { Resend } from "resend";
import { storage } from "./storage";

// Helper to format subdomain URL correctly
function formatSubdomainUrl(domainName: string): string {
  let subdomain = domainName.replace(/\.(com|net|org|io)$/i, '');
  return `${subdomain}.rentapog.com`;
}

// Email footer with unsubscribe link and physical address (required by CAN-SPAM)
function getEmailFooter(email: string): string {
  const unsubscribeUrl = `https://rentapog.com/unsubscribe?email=${encodeURIComponent(email)}`;
  return `
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #6b7280;">
      <p>RentAPog - Daily Domain Rental Platform</p>
      <p style="margin-top: 10px;">
        <a href="${unsubscribeUrl}" style="color: #6b7280; text-decoration: underline;">Unsubscribe from these emails</a>
      </p>
      <p style="margin-top: 5px;">You're receiving this because you signed up at rentapog.com</p>
    </div>
  `;
}

function getPlainTextFooter(email: string): string {
  return `\n\n---\nRentAPog - Daily Domain Rental Platform\nUnsubscribe: https://rentapog.com/unsubscribe?email=${encodeURIComponent(email)}\nYou're receiving this because you signed up at rentapog.com`;
}

const emailTemplates: { [key: string]: (affiliateCode: string, subdomain?: string, email?: string, paymentLink?: string) => { subject: string; html: string; text: string } } = {
    paymentTest: (code, subdomain, email = '', paymentLink = 'https://buy.stripe.com/test_fZu28q2QKeD7fYcghygA800') => {
      // You can pass a custom test payment link, or use the default test link
      return {
        subject: "Test Your Payment Flow (Stripe Test Mode)",
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1e40af;">Test Payment Link</h2>
          <p>Click the button below to test your payment flow in Stripe's test mode. No real money will be charged.</p>
          <p style="background: #f0f9ff; padding: 15px; border-radius: 8px; text-align: center;">
            <a href="${paymentLink}" style="color: #fff; background: #2563eb; font-size: 18px; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 6px; display: inline-block;">Pay with Stripe (Test Mode)</a>
          </p>
          <p style="margin-top: 20px; color: #64748b; font-size: 14px;">Use Stripe's test card number: <strong>4242 4242 4242 4242</strong> with any future expiry and CVC.</p>
          ${getEmailFooter(email)}
        </div>`,
        text: `Test Payment Link\n\nTest your payment flow in Stripe's test mode. No real money will be charged.\n\n${paymentLink}\n\nUse Stripe's test card number: 4242 4242 4242 4242 with any future expiry and CVC.${getPlainTextFooter(email)}`
      };
    },
  day0: (code, subdomain, email = '') => {
    const subdomainUrl = subdomain ? formatSubdomainUrl(subdomain) : null;
    const link = subdomainUrl ? `https://${subdomainUrl}` : `https://packages.rentapog.com/?aff=${code}`;
    const linkDisplay = subdomainUrl || `packages.rentapog.com/?aff=${code}`;
    return {
      subject: "Your Unique Affiliate Link Inside",
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1e40af;">Welcome to RentAPog!</h2>
        <p>Your affiliate link is ready to start earning commissions:</p>
        <p style="background: #f0f9ff; padding: 15px; border-radius: 8px; text-align: center;">
          <a href="${link}" style="color: #2563eb; font-size: 18px; font-weight: bold; text-decoration: underline;">${linkDisplay}</a>
        </p>
        <p>Start sharing and earn 100% on 1st and 3rd+ sales!</p>
        ${getEmailFooter(email)}
      </div>`,
      text: `Welcome to RentAPog!\n\nYour affiliate link is ready to start earning commissions:\n\n${link}\n\nStart sharing and earn 100% on 1st and 3rd+ sales!${getPlainTextFooter(email)}`
    };
  },
  day2: (code, subdomain, email = '') => {
    const subdomainUrl = subdomain ? formatSubdomainUrl(subdomain) : null;
    const link = subdomainUrl ? `https://${subdomainUrl}` : `https://packages.rentapog.com/?aff=${code}`;
    const linkDisplay = subdomainUrl || `packages.rentapog.com/?aff=${code}`;
    return {
      subject: "3 Ways to Earn This Week",
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1e40af;">3 Ways to Earn This Week</h2>
        <p>Share your link:</p>
        <p style="background: #f0f9ff; padding: 15px; border-radius: 8px; text-align: center;">
          <a href="${link}" style="color: #2563eb; font-size: 18px; font-weight: bold; text-decoration: underline;">${linkDisplay}</a>
        </p>
        <ol>
          <li>Share with friends and get 100% on their 1st sale</li>
          <li>Post in communities and watch referrals roll in</li>
          <li>Use your referrals to earn even more</li>
        </ol>
        ${getEmailFooter(email)}
      </div>`,
      text: `3 Ways to Earn This Week\n\nShare your link: ${link}\n\n1. Share with friends and get 100% on their 1st sale\n2. Post in communities and watch referrals roll in\n3. Use your referrals to earn even more${getPlainTextFooter(email)}`
    };
  },
  day4: (code, subdomain, email = '') => {
    const subdomainUrl = subdomain ? formatSubdomainUrl(subdomain) : null;
    const link = subdomainUrl ? `https://${subdomainUrl}` : `https://packages.rentapog.com/?aff=${code}`;
    const linkDisplay = subdomainUrl || `packages.rentapog.com/?aff=${code}`;
    return {
      subject: "Members Earning $200+ Per Week",
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1e40af;">Members Earning $200+ Per Week</h2>
        <p>Top affiliates are crushing it! Get your referral link out there:</p>
        <p style="background: #f0f9ff; padding: 15px; border-radius: 8px; text-align: center;">
          <a href="${link}" style="color: #2563eb; font-size: 18px; font-weight: bold; text-decoration: underline;">${linkDisplay}</a>
        </p>
        <p>Each referral you send can generate daily commissions for you!</p>
        ${getEmailFooter(email)}
      </div>`,
      text: `Members Earning $200+ Per Week\n\nTop affiliates are crushing it! Get your referral link out there:\n\n${link}\n\nEach referral you send can generate daily commissions for you!${getPlainTextFooter(email)}`
    };
  },
  day6: (code, subdomain, email = '') => {
    const subdomainUrl = subdomain ? formatSubdomainUrl(subdomain) : null;
    const link = subdomainUrl ? `https://${subdomainUrl}` : `https://rentapog.com/?aff=${code}`;
    const linkDisplay = subdomainUrl || `rentapog.com/?aff=${code}`;
    return {
      subject: "Your Earnings Dashboard Is Ready",
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1e40af;">Your Earnings Dashboard Is Ready</h2>
        <p>Time to start sharing your link and earning! Your link:</p>
        <p style="background: #f0f9ff; padding: 15px; border-radius: 8px; text-align: center;">
          <a href="${link}" style="color: #2563eb; font-size: 18px; font-weight: bold; text-decoration: underline;">${linkDisplay}</a>
        </p>
        <p>Each signup gets you closer to passive daily income.</p>
        ${getEmailFooter(email)}
      </div>`,
      text: `Your Earnings Dashboard Is Ready\n\nTime to start sharing your link and earning! Your link:\n\n${link}\n\nEach signup gets you closer to passive daily income.${getPlainTextFooter(email)}`
    };
  },
  day8: (code, subdomain, email = '') => {
    const subdomainUrl = subdomain ? formatSubdomainUrl(subdomain) : null;
    const link = subdomainUrl ? `https://${subdomainUrl}` : `https://rentapog.com/?aff=${code}`;
    const linkDisplay = subdomainUrl || `rentapog.com/?aff=${code}`;
    return {
      subject: "Don't Leave Money on the Table",
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1e40af;">Don't Leave Money on the Table</h2>
        <p>Every day you're not sharing your link is money you're missing out on.</p>
        <p style="background: #f0f9ff; padding: 15px; border-radius: 8px; text-align: center;">
          <a href="${link}" style="color: #2563eb; font-size: 18px; font-weight: bold; text-decoration: underline;">${linkDisplay}</a>
        </p>
        <p>Start sharing now!</p>
        ${getEmailFooter(email)}
      </div>`,
      text: `Don't Leave Money on the Table\n\nEvery day you're not sharing your link is money you're missing out on.\n\n${link}\n\nStart sharing now!${getPlainTextFooter(email)}`
    };
  },
  day10: (code, subdomain, email = '') => {
    const subdomainUrl = subdomain ? formatSubdomainUrl(subdomain) : null;
    const link = subdomainUrl ? `https://${subdomainUrl}` : `https://packages.rentapog.com/?aff=${code}`;
    const linkDisplay = subdomainUrl || `packages.rentapog.com/?aff=${code}`;
    return {
      subject: "Time to Scale Your Earnings",
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1e40af;">Time to Scale Your Earnings</h2>
        <p>Don't miss out on daily commissions!</p>
        <p style="background: #f0f9ff; padding: 15px; border-radius: 8px; text-align: center;">
          <a href="${link}" style="color: #2563eb; font-size: 18px; font-weight: bold; text-decoration: underline;">${linkDisplay}</a>
        </p>
        <p>Share now and start earning!</p>
        ${getEmailFooter(email)}
      </div>`,
      text: `Time to Scale Your Earnings\n\nDon't miss out on daily commissions!\n\n${link}\n\nShare now and start earning!${getPlainTextFooter(email)}`
    };
  },
  day14: (code, subdomain, email = '') => {
    const subdomainUrl = subdomain ? formatSubdomainUrl(subdomain) : null;
    const link = subdomainUrl ? `https://${subdomainUrl}` : `https://rentapog.com/?aff=${code}`;
    const linkDisplay = subdomainUrl || `rentapog.com/?aff=${code}`;
    return {
      subject: "Level Up Your Earnings",
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1e40af;">Level Up Your Earnings</h2>
        <p>Ready to take your affiliate income to the next level?</p>
        <p style="background: #f0f9ff; padding: 15px; border-radius: 8px; text-align: center;">
          <a href="${link}" style="color: #2563eb; font-size: 18px; font-weight: bold; text-decoration: underline;">${linkDisplay}</a>
        </p>
        <p>Upgrade to premium for even more earning potential!</p>
        ${getEmailFooter(email)}
      </div>`,
      text: `Level Up Your Earnings\n\nReady to take your affiliate income to the next level?\n\n${link}\n\nUpgrade to premium for even more earning potential!${getPlainTextFooter(email)}`
    };
  },
};

let resend: Resend | null = null;

function initializeResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[Email Worker] ✗ CRITICAL: RESEND_API_KEY not set!");
    return false;
  }
  resend = new Resend(apiKey);
  return true;
}

export async function sendTestEmail(toEmail: string) {
  try {
    if (!initializeResend() || !resend) return false;
    
    const unsubscribeUrl = `https://rentapog.com/unsubscribe?email=${encodeURIComponent(toEmail)}`;
    await resend.emails.send({
      from: "RentAPog <sales@rentapog.com>",
      to: toEmail,
      subject: "Test Email - RentAPog System",
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1>Test email sent successfully!</h1>
        <p>Your email system is working with Resend!</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #6b7280;">
          <p>RentAPog - Daily Domain Rental Platform</p>
          <p><a href="${unsubscribeUrl}" style="color: #6b7280;">Unsubscribe</a></p>
        </div>
      </div>`,
      text: `Test email sent successfully!\n\nYour email system is working with Resend!\n\n---\nRentAPog - Daily Domain Rental Platform\nUnsubscribe: ${unsubscribeUrl}`,
    });
    console.log(`[Email Worker] ✓ Test email sent to ${toEmail}`);
    return true;
  } catch (error: any) {
    console.error("[Email Worker] ✗ Test email failed:", error?.message);
    return false;
  }
}

export async function startEmailWorker() {
  console.log("[Email Worker] ✓ Starting email scheduler...");
  console.log(`[Email Worker] Resend API Key: ${process.env.RESEND_API_KEY ? "SET" : "NOT SET"}`);
  
  if (process.env.RESEND_API_KEY) {
    console.log(`[Email Worker] API Key Preview: ${process.env.RESEND_API_KEY.substring(0, 10)}...`);
  } else {
    console.error("[Email Worker] ✗✗✗ CRITICAL: RESEND_API_KEY is NOT configured!");
    console.error("[Email Worker] Email autoresponder will NOT work!");
    console.error("[Email Worker] Set RESEND_API_KEY in your Render environment variables:");
    console.error("[Email Worker] https://dashboard.render.com → Your Service → Environment");
  }

  if (!initializeResend()) {
    console.error("[Email Worker] ✗ Cannot start - Resend not configured");
    return;
  }

  setInterval(async () => {
    try {
      const pendingEmails = await storage.getPendingEmails();
      if (pendingEmails.length === 0) return;
      
      console.log(`[Email Worker] ✓ Found ${pendingEmails.length} pending emails`);

      for (const record of pendingEmails) {
        try {
          const template = emailTemplates[record.emailType as keyof typeof emailTemplates];
          if (!template) {
            console.error(`[Email Worker] ✗ Unknown email type: ${record.emailType}`);
            await storage.markEmailAsFailed(record.id);
            continue;
          }

          // Check if user has 3+ referrals - if so, use different affiliate link
          let affiliateCodeToUse = record.referralCode;
          let userSubdomain: string | undefined;
          
          try {
            const referrals = await storage.getUserReferrals(record.userId || "");
            if (referrals && referrals.length >= 3) {
              // User has 3+ referrals, increment affiliate link
              // For example: rentapog → rentapog-2, rentapog-2 → rentapog-3, etc
              const baseName = record.referralCode.split("-")[0];
              const currentSuffix = record.referralCode.split("-")[1];
              const nextNum = (currentSuffix ? parseInt(currentSuffix) : 1) + 1;
              affiliateCodeToUse = `${baseName}-${nextNum}`;
              console.log(`[Email Worker] ℹ User has 3+ referrals. Using new affiliate link: ${affiliateCodeToUse}`);
            }
          } catch (referralErr) {
            console.error(`[Email Worker] ✗ Could not check referrals:`, referralErr);
            // Continue with original affiliate code if lookup fails
          }
          
          // Look up user's subdomain if they have one
          try {
            if (record.userId) {
              const domains = await storage.getDomainRentals(record.userId);
              if (domains && domains.length > 0 && domains[0].domainName) {
                userSubdomain = domains[0].domainName;
                console.log(`[Email Worker] ℹ Found user subdomain: ${userSubdomain}`);
              }
            }
          } catch (domainErr) {
            console.error(`[Email Worker] ✗ Could not look up subdomain:`, domainErr);
          }

          const { subject, html, text } = template(affiliateCodeToUse, userSubdomain, record.email);
          await resend!.emails.send({
            from: "RentAPog <sales@rentapog.com>",
            to: record.email,
            subject,
            html,
            text,
          });

          await storage.markEmailAsSent(record.id);
          console.log(`[Email Worker] ✓ SENT ${record.emailType} → ${record.email}`);
        } catch (err: any) {
          console.error(`[Email Worker] ✗ Send failed to ${record.email}:`, err?.message);
          await storage.markEmailAsFailed(record.id);
        }
      }
    } catch (err: any) {
      console.error("[Email Worker] ✗ Error:", err?.message);
    }
  }, 10000);
}
