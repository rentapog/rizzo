
import type { Express, Request, Response } from "express";
import { type Server } from "http";
import { storage } from "./storage";
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

// Helper: Get site branding
function getSiteBranding() {
  const siteName = process.env.SITE_NAME || "RentAPog";
  const siteEmail = process.env.SITE_EMAIL || "sales@rentapog.com";
  return {
    name: siteName,
    email: siteEmail,
    fromEmail: `${siteName} <${siteEmail}>`,
  };
}

// Helper: Send email via Resend
async function sendEmail({ to, subject, html, text }: { to: string; subject: string; html: string; text: string }) {
  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM || 'support@rentapog.com',
      to,
      subject,
      html,
      text,
    });
    if (result && (result as any).id) {
      console.log(`[Email] ✓ Sent via Resend to ${to}`);
      return { success: true, provider: 'resend', id: (result as any).id };
    } else {
      console.error(`[Email] ✗✗✗ Resend failed to send to ${to}`);
      return { success: false, error: "Resend failed" };
    }
  } catch (error: any) {
    console.error(`[Email] ✗✗✗ Resend error: ${error?.message || error}`);
    return { success: false, error, provider: 'resend' };
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // --- SQUARE PAYMENT ENDPOINT ---
  app.post("/api/payments/square/create-checkout", async (req, res) => {
    try {
      const square = require('square');
      const Client = square.Client;
      const Environment = square.Environment;
      const { price, email, packageTitle } = req.body;
      const allowedPrices = [20,49,99,149,199,249,299,349,399,449,499];
      if (!allowedPrices.includes(Number(price))) {
        return res.status(400).json({ error: "Invalid package price" });
      }
      const squareClient = new Client({
        accessToken: process.env.SQUARE_ACCESS_TOKEN,
        environment: Environment.Sandbox,
      });
      const { result: orderResult } = await squareClient.ordersApi.createOrder({
        order: {
          locationId: process.env.SQUARE_LOCATION_ID || "L88917K1V6Y6A",
          lineItems: [
            {
              name: packageTitle || `RentAPog Package $${price}`,
              quantity: "1",
              basePriceMoney: {
                amount: Number(price) * 100,
                currency: "AUD"
              }
            }
          ]
        }
      });
      const { result: checkoutResult } = await squareClient.checkoutApi.createCheckout(
        process.env.SQUARE_LOCATION_ID || "L88917K1V6Y6A",
        {
          order: { id: orderResult.order?.id },
          askForShippingAddress: false,
          merchantSupportEmail: process.env.SITE_EMAIL || "sales@rentapog.com",
          prePopulateBuyerEmail: email,
          redirectUrl: "https://packages.rentapog.com/payment-success"
        }
      );
      res.json({ url: checkoutResult.checkout?.checkoutPageUrl });
    } catch (error) {
      console.error("[Square] Error creating checkout:", error);
      res.status(500).json({ error: "Failed to create Square checkout" });
    }
  });

  // --- AFFILIATE EMAIL ENDPOINT ---
  app.post("/api/send-affiliate-email", async (req, res) => {
    const { toEmail, affiliateCode, subject, html, text } = req.body;
    if (!toEmail) return res.status(400).json({ error: "Missing toEmail" });
    try {
      const branding = getSiteBranding();
      const affCode = affiliateCode || "rentapog";
      const defaultSubject = subject || `Welcome to ${branding.name}`;
      const defaultHtml = html || `<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\"><h2 style=\"color: #1e40af;\">Welcome!</h2><p>Thank you for joining ${branding.name}. Your affiliate code is <b>${affCode}</b>.</p></div>`;
      const defaultText = text || `Welcome! Thank you for joining ${branding.name}. Your affiliate code is ${affCode}.`;
      const result = await sendEmail({
        to: toEmail,
        subject: defaultSubject,
        html: defaultHtml,
        text: defaultText
      });
      if (result && result.success) {
        return res.json({ success: true, id: result.id });
      } else {
        return res.status(500).json({ error: result?.error || "Failed to send email" });
      }
    } catch (err) {
      return res.status(500).json({ error: String(err) });
    }
  });

  // --- ANTHROPIC ADMIN ENDPOINT (EXAMPLE) ---
  // Only for admin/backoffice use, protected by admin auth (implement as needed)
  app.post("/api/admin/anthropic", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) return res.status(400).json({ error: "Missing prompt" });
      // Example: Use Anthropic Claude API (replace with your actual logic)
      const Anthropic = require("@anthropic-ai/sdk");
      const anthropic = new Anthropic({ apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY });
      const completion = await anthropic.completions.create({
        model: "claude-3-opus-20240229",
        max_tokens: 512,
        prompt,
      });
      res.json({ success: true, completion });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Anthropic error" });
    }
  });

  // --- BASIC USER ENDPOINTS (EXAMPLES) ---
  app.get("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUserById(id);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        referralCode: user.referralCode,
        affiliateLink: user.affiliateLink,
        accountBalance: user.accountBalance,
        referralBalance: user.referralBalance,
        salesCount: user.salesCount,
        subscriptionStatus: user.subscriptionStatus,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // --- USER REGISTRATION ENDPOINT ---
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, name, address, city, state, zip, country, referredBy } = req.body;
      if (!email || !password) return res.status(400).json({ error: "Missing email or password" });
      const existing = await storage.getUserByEmail(email);
      if (existing) return res.status(400).json({ error: "Email already registered" });
      // Generate referral code
      const referralCode = Math.random().toString(36).substring(2, 10);
      // Hash password (bcryptjs)
      const bcrypt = require('bcryptjs');
      const hashed = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        email,
        password: hashed,
        name,
        address,
        city,
        state,
        zip,
        country,
        referralCode,
        referredBy: referredBy || null,
        affiliateLink: referredBy || "admin",
      });
      // Send welcome email
      const branding = getSiteBranding();
      await sendEmail({
        to: email,
        subject: `Welcome to ${branding.name}`,
        html: `<h2>Welcome to ${branding.name}!</h2><p>Your account has been created.</p>`,
        text: `Welcome to ${branding.name}! Your account has been created.`,
      });
      res.json({ success: true, user: { id: user.id, email: user.email, referralCode: user.referralCode } });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // --- AFFILIATE HOMEPAGE SIGNUP ENDPOINT ---
  app.post("/api/affiliates/home-signup", async (req, res) => {
    try {
      const { email, affiliateLink } = req.body;
      if (!email) return res.status(400).json({ error: "Missing email" });
      const existing = await storage.getEmailLeadByEmail(email);
      if (existing) return res.status(400).json({ error: "Email already signed up" });
      const lead = await storage.createEmailLead({
        email,
        source: "homepage",
        affiliateLink: affiliateLink || "admin",
        assignedAffiliate: affiliateLink || "admin",
        verified: false,
      });
      // Send welcome email
      const branding = getSiteBranding();
      await sendEmail({
        to: email,
        subject: `Welcome to ${branding.name}`,
        html: `<h2>Welcome to ${branding.name}!</h2><p>Thanks for signing up as an affiliate.</p>`,
        text: `Welcome to ${branding.name}! Thanks for signing up as an affiliate.`,
      });
      res.json({ success: true, lead: { id: lead.id, email: lead.email } });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // Add more endpoints as needed...

  return httpServer;
}
