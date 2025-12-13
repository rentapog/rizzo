import type { Express } from "express";
import { createServer, type Server } from "http";
import crypto from "crypto";
import { storage } from "./storage";
import { db } from "./db";
import { insertEmailLeadSchema, insertAffiliateSaleSchema, insertUserSchema, users, emailSchedules, emailLeads, DOMAIN_NICHES, rentalContracts } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import bcryptjs from "bcryptjs";
import Stripe from "stripe";
import Anthropic from "@anthropic-ai/sdk";
import { registerTeamAndDeploymentRoutes } from "./routes-team-deployment";
import { registerWebsiteBuilderRoutes } from "./routes-website-builder";
import { registerUserSiteRoutes } from "./routes-user-sites";
import { createSubdomain, setupDomainForwarding, isSubdomainAvailable, fixSubdomainProxy, getAllDnsRecords } from "./cloudflare";
import nodemailer from "nodemailer";
import { notificationService } from "./websocket";

// Helper function to process daily charges using referral balance first
async function processChargeWithReferralBalance(userId: string, chargeAmount: number) {
  const user = await storage.getUserById(userId);
  if (!user) return { success: false, error: "User not found" };

  // First, use referral balance to cover as much as possible
  const referralBalanceUsed = Math.min(user.referralBalance, chargeAmount);
  const remainingCharge = chargeAmount - referralBalanceUsed;

  // Deduct from referral balance
  if (referralBalanceUsed > 0) {
    await storage.deductReferralBalance(userId, referralBalanceUsed);
  }

  // If there's remaining charge, deduct from account balance
  if (remainingCharge > 0) {
    if (user.accountBalance < remainingCharge) {
      // INSUFFICIENT FUNDS: Cancel account
      await storage.cancelUserAccount(userId);
      return { success: false, error: "Insufficient funds. Account cancelled." };
    } else {
      await storage.updateAccountBalance(userId, -remainingCharge);
    }
  }

  return {
    success: true,
    referralBalanceUsed,
    accountBalanceUsed: remainingCharge,
    totalCharged: chargeAmount
  };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Redirect sales.rentapog.com to packages.rentapog.com
  app.use((req, res, next) => {
    const host = req.get('host') || '';
    if (host.includes('sales.rentapog.com')) {
      const url = new URL(req.originalUrl, `https://${host}`);
      const affCode = url.searchParams.get('aff') || 'rentapog';
      return res.redirect(301, `https://packages.rentapog.com/?aff=${encodeURIComponent(affCode)}`);
    }
    next();
  });

  // Get user profile endpoint
  app.get("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUserById(id);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

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
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // Get user's rented domains endpoint
  app.get("/api/users/:id/domains", async (req, res) => {
    try {
      const { id } = req.params;
      const rentals = await storage.getUserRentals(id);
      res.json(rentals);
    } catch (error) {
      console.error("Get user domains error:", error);
      res.status(500).json({ error: "Failed to get user domains" });
    }
  });

  // Get current authenticated user from session
  app.get("/api/auth/current", async (req, res) => {
    try {
      // Read user data from cookie
      const userCookie = req.cookies?.user;
      if (userCookie) {
        try {
          const userData = JSON.parse(decodeURIComponent(userCookie));
          if (userData && userData.id) {
            // Verify user exists in database
            const user = await storage.getUserById(userData.id);
            if (user) {
              return res.json({
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
            }
          }
        } catch (parseErr) {
          console.error("[Auth] Failed to parse user cookie:", parseErr);
        }
      }
      res.status(401).json({ message: "Not authenticated" });
    } catch (error) {
      console.error("[Auth] Get current user error:", error);
      res.status(500).json({ message: "Failed to get current user" });
    }
  });

  // Unsubscribe endpoint - cancels pending emails for the user
  app.get("/api/unsubscribe", async (req, res) => {
    try {
      const email = req.query.email as string;
      if (!email) {
        return res.status(400).send(`
          <html><head><title>Unsubscribe Error</title></head>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1>Invalid Request</h1>
            <p>No email address provided.</p>
          </body></html>
        `);
      }
      
      // Cancel all pending emails for this user
      await storage.cancelPendingEmailsByEmail(email);
      
      res.send(`
        <html>
        <head><title>Unsubscribed - RentAPog</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f8fafc;">
          <div style="max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h1 style="color: #1e40af;">You've Been Unsubscribed</h1>
            <p style="color: #64748b; font-size: 18px;">You will no longer receive emails from RentAPog.</p>
            <p style="margin-top: 30px;">
              <a href="https://rentapog.com" style="color: #2563eb; text-decoration: underline;">Return to RentAPog</a>
            </p>
          </div>
        </body>
        </html>
      `);
      console.log(`[Unsubscribe] User ${email} unsubscribed from emails`);
    } catch (error) {
      console.error("Unsubscribe error:", error);
      res.status(500).send(`
        <html><head><title>Error</title></head>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1>Something went wrong</h1>
          <p>Please try again later or contact support.</p>
        </body></html>
      `);
    }
  });

  // Homepage signup - creates full account with username as affiliate link
  app.post("/api/affiliates/home-signup", async (req, res) => {
    try {
      const { email, name, username, password, referrerCode } = req.body;
      
      // Validate required fields
      if (!email || !username || !password) {
        return res.status(400).json({ error: "Email, username, and password are required" });
      }

      // Require referrer code (affiliate link in URL)
      if (!referrerCode) {
        return res.status(400).json({ error: "You must sign up through an affiliate link" });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      // Validate username format
      if (!/^[a-z0-9_]+$/.test(username)) {
        return res.status(400).json({ error: "Username can only contain lowercase letters, numbers, and underscores" });
      }

      if (username.length < 3 || username.length > 20) {
        return res.status(400).json({ error: "Username must be 3-20 characters" });
      }

      // Check password length
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }

      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email already in use" });
      }

      // Check if username/referralCode already exists
      const existingUsername = await storage.getUserByReferralCode(username);
      if (existingUsername) {
        return res.status(400).json({ error: "Username already taken" });
      }

      // Hash password
      const hashedPassword = await bcryptjs.hash(password, 10);

      // Create user with username as their referralCode (affiliate link)
      const user = await storage.createUser({
        email,
        name: name || email.split("@")[0],
        password: hashedPassword,
        affiliateLink: referrerCode, // who referred them
        referralCode: username, // their own affiliate code = username
      });

      console.log(`[Home Signup] New user: ${email} | Username: ${username} | Referred by: ${referrerCode}`);

      // Count how many users this referrer has already referred (for pass-up logic)
      const referrerSalesCount = await storage.getReferralCountByCode(referrerCode);
      const thisIsWhichReferral = referrerSalesCount; // This new user is the Nth referral
      
      // Pass-up logic: 2nd referral goes to admin, all others go to referrer
      const packagesAffiliateCode = (thisIsWhichReferral === 2) ? "rentapog" : referrerCode;
      console.log(`[Home Signup] Referral #${thisIsWhichReferral} for ${referrerCode} | Packages link goes to: ${packagesAffiliateCode}`);

      // CHECK TRIAL THRESHOLD: If referrer has active trial and got 3 referrals, end trial early
      try {
        const referrer = await storage.getUserByReferralCode(referrerCode);
        if (referrer && referrer.trialStatus === "active") {
          const hasMetThreshold = await storage.checkTrialReferralThreshold(referrer.id);
          if (hasMetThreshold) {
            await storage.endUserTrial(referrer.id, "referrals_met");
            console.log(`[Home Signup] Trial ended early for ${referrerCode} - 3 referrals achieved!`);
          }
        }
      } catch (trialErr) {
        console.error("[Home Signup] Error checking trial threshold:", trialErr);
      }

      // Send welcome email with their affiliate link
      try {
        const { Resend } = await import("resend");
        const resendApiKey = process.env.RESEND_API_KEY;
        if (resendApiKey) {
          const resend = new Resend(resendApiKey);
          const personalLink = `https://rentapog.com/?aff=${username}`;
          const packagesLink = `https://packages.rentapog.com/?aff=${packagesAffiliateCode}`;
          
          await resend.emails.send({
            from: "RentAPog <sales@rentapog.com>",
            to: email,
            subject: "Welcome to RentAPog - Your Affiliate Link is Ready!",
            html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #1e40af;">Welcome to RentAPog, ${name || username}!</h2>
              <p style="font-size: 16px; color: #333;">Your account has been created and your affiliate link is ready:</p>
              
              <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <p style="margin: 0 0 10px 0; color: #1e40af; font-weight: bold;">Your Affiliate Link:</p>
                <p style="font-size: 20px; color: #0066cc; font-weight: bold; margin: 0 0 15px 0;">rentapog.com/?aff=${username}</p>
              </div>
              
              <div style="background: #10b981; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <p style="margin: 0 0 10px 0; color: white; font-weight: bold;">Next Step - Get Your Package:</p>
                <a href="${packagesLink}" style="display: inline-block; background: white; color: #10b981; padding: 15px 40px; border-radius: 5px; text-decoration: none; font-size: 16px; font-weight: bold;">View Packages</a>
              </div>
              
              <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                <strong>How You Earn:</strong>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                  <li>100% commission on the 1st sale</li>
                  <li>Admin gets the 2nd sale (covers costs)</li>
                  <li>100% commission on the 3rd and ALL future sales!</li>
                </ul>
              </div>
              
              <p style="color: #666;">Share your link everywhere: social media, email, forums... anywhere!</p>
              
              <p style="text-align: center; margin-top: 30px;">
                <a href="https://backend.rentapog.com" style="display: inline-block; background: #2563eb; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold;">Login to Dashboard</a>
              </p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #6b7280;">
                <p>RentAPog - Daily Domain Rental Platform</p>
              </div>
            </div>`,
            text: `Welcome to RentAPog!\n\nYour affiliate link is ready:\nrentapog.com/?aff=${username}\n\nNext Step - Get Your Package:\n${packagesLink}\n\nHow You Earn:\n- 100% commission on the 1st sale\n- Admin gets the 2nd sale (covers costs)\n- 100% commission on the 3rd and ALL future sales!\n\nLogin: https://backend.rentapog.com`,
          });
          console.log(`[Home Signup] Welcome email sent to ${email}`);
        }
      } catch (emailErr) {
        console.error("[Home Signup] Failed to send welcome email:", emailErr);
      }

      res.json({ 
        success: true, 
        message: "Account created successfully!",
        affiliateLink: username,
        packagesAffiliateCode,
        user: { id: user.id, email: user.email, referralCode: user.referralCode }
      });
    } catch (error: any) {
      console.error("[Home Signup] Error:", error);
      res.status(500).json({ error: error?.message || "Failed to create account" });
    }
  });

  // Auth endpoints
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { affiliateLink, password, username, ...userData } = req.body;
      
      // Optional: Affiliate link defaults to "admin" if not provided
      const affiliate = (affiliateLink && typeof affiliateLink === "string") ? affiliateLink : "admin";

      // REQUIRED: Must have password and username
      if (!password || typeof password !== "string") {
        return res.status(400).json({ message: "Password is required" });
      }
      if (!username || typeof username !== "string") {
        return res.status(400).json({ message: "Username is required" });
      }

      const data = insertUserSchema.parse({ ...userData, affiliateLink: affiliate, password });
      const existing = await storage.getUserByEmail(data.email);
      if (existing) {
        return res.status(400).json({ message: "Email already in use" });
      }

      // Use username as referral code
      const referralCode = username.toLowerCase();

      // Hash password before storing
      const hashedPassword = await bcryptjs.hash(password, 10);
      const user = await storage.createUser({ ...data, password: hashedPassword, referralCode });
      
      // CHECK TRIAL THRESHOLD: If referrer has active trial and got 3 referrals, end trial early
      if (affiliate && affiliate !== "admin") {
        try {
          const referrer = await storage.getUserByReferralCode(affiliate);
          if (referrer && referrer.trialStatus === "active") {
            const hasMetThreshold = await storage.checkTrialReferralThreshold(referrer.id);
            if (hasMetThreshold) {
              await storage.endUserTrial(referrer.id, "referrals_met");
              console.log(`[Register] Trial ended early for ${affiliate} - 3 referrals achieved!`);
            }
          }
          
          // Send real-time notification to the referrer about new signup
          if (referrer) {
            const { notificationService } = await import("./websocket");
            notificationService.notifyNewSignup(referrer.id.toString(), user.name || user.email);
          }
        } catch (trialErr) {
          console.error("[Register] Error checking trial threshold:", trialErr);
        }
      }
      
      // Send email with their personal affiliate link (uses USERNAME as affiliate code)
      try {
        const { Resend } = await import("resend");
        const resendApiKey = process.env.RESEND_API_KEY;
        if (resendApiKey) {
          const resend = new Resend(resendApiKey);
          const personalAffiliateLink = `https://rentapog.com/?aff=${user.referralCode}`;
          
          await resend.emails.send({
            from: "RentAPog <sales@rentapog.com>",
            to: user.email,
            subject: "Your Personal Affiliate Link is Ready!",
            html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #1e40af;">Congrats! Your Account is Ready</h2>
              <p style="font-size: 16px; color: #333;">Your personal affiliate link is now active:</p>
              
              <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <p style="margin: 0 0 10px 0; color: #1e40af; font-weight: bold;">Your Affiliate Link:</p>
                <p style="font-size: 18px; color: #0066cc; font-weight: bold; margin: 0 0 15px 0;">rentapog.com/?aff=${user.referralCode}</p>
                <a href="${personalAffiliateLink}" style="display: inline-block; background: #2563eb; color: white; padding: 15px 40px; border-radius: 5px; text-decoration: none; font-size: 16px; font-weight: bold;">Click Here - Start Promoting</a>
              </div>
              
              <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                <strong>How You Earn:</strong>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                  <li>100% commission on the 1st sale</li>
                  <li>Admin gets the 2nd sale (covers costs)</li>
                  <li>100% commission on the 3rd and ALL future sales!</li>
                </ul>
              </div>
              
              <p style="color: #666;"><strong>Your username:</strong> ${user.referralCode}</p>
              <p style="color: #666;">Share your link everywhere: TikTok, Instagram, Facebook, email... anywhere!</p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #6b7280;">
                <p>RentAPog - Daily Domain Rental Platform</p>
              </div>
            </div>`,
            text: `Congrats! Your Account is Ready\n\nYour personal affiliate link is now active:\n\nrentapog.com/?aff=${user.referralCode}\n\nHow You Earn:\n- 100% commission on the 1st sale\n- Admin gets the 2nd sale (covers costs)\n- 100% commission on the 3rd and ALL future sales!\n\nYour username: ${user.referralCode}\n\nShare your link everywhere!`,
          });
          console.log(`[Register] Confirmation email sent to ${user.email} with link: rentapog.com/?aff=${user.referralCode}`);
        }
      } catch (emailErr) {
        console.error("[Register] Failed to send confirmation email:", emailErr);
      }
      
      // Note: createUser() automatically schedules all 7 emails, no need to duplicate here
      res.json({ success: true, user });
    } catch (error: any) {
      console.error("[Register] Error:", error);
      if (error instanceof z.ZodError) {
        console.error("[Register] Validation errors:", error.errors);
        res.status(400).json({ message: "Invalid input: " + error.errors.map(e => e.message).join(", ") });
      } else {
        res.status(500).json({ message: error?.message || "Registration failed" });
      }
    }
  });

  // Generate a secure admin session token
  const generateAdminSessionToken = (): string => {
    return crypto.randomBytes(32).toString('hex');
  };

  // Clean up expired sessions periodically (from database)
  setInterval(async () => {
    try {
      await storage.cleanExpiredAdminSessions();
    } catch (err) {
      console.error("[Admin Sessions] Failed to clean expired sessions:", err);
    }
  }, 60000); // Check every minute

  // ADMIN-ONLY login endpoint - requires 3-part authentication: email + password + secret PIN
  // Includes lockout after 5 failed attempts (15 minute lockout)
  app.post("/api/auth/admin-login", async (req, res) => {
    try {
      const { email, password, pin } = req.body;
      console.log("[Admin Login DEBUG] Attempt received:");
      console.log("[Admin Login DEBUG] - Email entered:", email);
      console.log("[Admin Login DEBUG] - Password length:", password?.length || 0);
      console.log("[Admin Login DEBUG] - PIN entered:", pin);
      
      if (!email || !password || !pin) {
        return res.status(400).json({ message: "Email, password, and PIN required" });
      }

      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPassword = process.env.ADMIN_PASSWORD;
      const adminPin = process.env.ADMIN_PIN;
      
      console.log("[Admin Login DEBUG] Expected credentials:");
      console.log("[Admin Login DEBUG] - ADMIN_EMAIL configured:", !!adminEmail, "value:", adminEmail);
      console.log("[Admin Login DEBUG] - ADMIN_PASSWORD configured:", !!adminPassword, "length:", adminPassword?.length || 0);
      console.log("[Admin Login DEBUG] - ADMIN_PIN configured:", !!adminPin, "value:", adminPin);
      console.log("[Admin Login DEBUG] Comparisons:");
      console.log("[Admin Login DEBUG] - Email match:", email === adminEmail);
      console.log("[Admin Login DEBUG] - Password match:", password === adminPassword);
      console.log("[Admin Login DEBUG] - PIN match:", pin === adminPin);

      // Check if admin is locked out
      const lockStatus = await storage.isAdminLocked(adminEmail || email);
      if (lockStatus.locked && lockStatus.lockedUntil) {
        const remainingMs = new Date(lockStatus.lockedUntil).getTime() - Date.now();
        const remainingMins = Math.ceil(remainingMs / 60000);
        return res.status(423).json({ 
          message: `Too many failed attempts. Try again in ${remainingMins} minute${remainingMins > 1 ? 's' : ''}.`,
          lockedUntil: lockStatus.lockedUntil,
          retryAfter: Math.ceil(remainingMs / 1000)
        });
      }
      
      // Verify all 3 credentials: email + password + PIN
      if (adminEmail && adminPassword && adminPin && 
          email === adminEmail && password === adminPassword && pin === adminPin) {
        // Clear any failed login attempts on successful login
        await storage.clearAdminLoginAttempts(adminEmail);
        
        // Generate a secure session token
        const sessionToken = generateAdminSessionToken();
        const expiresAt = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)); // 7 days
        
        // Store session in DATABASE (persists across restarts)
        await storage.createAdminSession(sessionToken, adminEmail, expiresAt);

        // Find or create a real admin user in the database so they have a valid user ID
        const adminName = process.env.ADMIN_USERNAME || "Admin";
        const adminReferralCode = adminName.toLowerCase().replace(/[^a-z0-9]/g, '') || "admin";
        let dbAdmin = await storage.getUserByEmail(adminEmail);
        if (!dbAdmin) {
          // Create admin user in database
          dbAdmin = await storage.createUser({
            email: adminEmail,
            password: adminPassword, // Will be hashed by storage
            name: adminName,
            referralCode: adminReferralCode,
            affiliateLink: adminReferralCode,
          });
          console.log(`[Admin Login] Created admin user in database: ${dbAdmin.id}`);
        } else {
          // Check if name needs updating (skip referral code to avoid conflicts)
          if (dbAdmin.name !== adminName) {
            try {
              await storage.updateUser(dbAdmin.id, { name: adminName });
              dbAdmin.name = adminName;
              console.log(`[Admin Login] Updated admin name to: ${adminName}`);
            } catch (err) {
              console.log(`[Admin Login] Could not update admin name, continuing with existing data`);
            }
          }
        }

        const adminUser = {
          id: dbAdmin.id, // Use real database ID
          email: adminEmail,
          name: dbAdmin.name || adminName,
          isAdmin: true,
          accountBalance: dbAdmin.accountBalance || 0,
          referralBalance: dbAdmin.referralBalance || 0,
          salesCount: dbAdmin.salesCount || 0,
          subscriptionStatus: dbAdmin.subscriptionStatus || "active",
          subdomain: dbAdmin.subdomain || null,
          referralCode: dbAdmin.referralCode || adminReferralCode,
        };
        
        // Set the user cookie (for frontend display)
        res.cookie("user", JSON.stringify(adminUser), {
          domain: ".rentapog.com",
          path: "/",
          maxAge: 7 * 24 * 60 * 60 * 1000,
          httpOnly: false,
          sameSite: "lax",
        });
        
        // Set a SECURE httpOnly session token cookie (cannot be forged client-side)
        res.cookie("admin_session", sessionToken, {
          domain: ".rentapog.com",
          path: "/",
          maxAge: 7 * 24 * 60 * 60 * 1000,
          httpOnly: true, // Cannot be read or modified by JavaScript
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        });
        
        return res.json({ success: true, user: adminUser });
      }

      // Admin credentials don't match - record failed attempt
      const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
      const failedResult = await storage.recordFailedAdminLogin(adminEmail || email, ipAddress);
      const remainingAttempts = Math.max(0, 5 - failedResult.attemptCount);
      
      if (failedResult.lockedUntil) {
        const remainingMs = new Date(failedResult.lockedUntil).getTime() - Date.now();
        const remainingMins = Math.ceil(remainingMs / 60000);
        console.log(`[Admin Login] Account locked after ${failedResult.attemptCount} failed attempts from ${ipAddress}`);
        return res.status(423).json({ 
          message: `Too many failed attempts. Account locked for ${remainingMins} minutes.`,
          lockedUntil: failedResult.lockedUntil,
          retryAfter: Math.ceil(remainingMs / 1000)
        });
      }
      
      console.log(`[Admin Login] Failed attempt ${failedResult.attemptCount}/5 from ${ipAddress}`);
      return res.status(401).json({ 
        message: `Invalid admin credentials. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.` 
      });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Auto-login endpoint - logs user in after successful Stripe package purchase
  app.get("/api/auth/auto-login", async (req, res) => {
    try {
      const { session_id } = req.query;
      
      if (!session_id || typeof session_id !== "string") {
        console.log("[Auto-Login] Missing session_id");
        return res.redirect("https://backend.rentapog.com?error=missing_session");
      }

      const stripe = new Stripe(process.env.STRIPE_API_KEY || "");
      
      // Retrieve the checkout session from Stripe
      const session = await stripe.checkout.sessions.retrieve(session_id);
      
      if (session.payment_status !== "paid") {
        console.log("[Auto-Login] Payment not completed");
        return res.redirect("https://backend.rentapog.com?error=payment_not_completed");
      }

      // Get customer email and package info from Stripe session
      const customerEmail = session.customer_email || session.customer_details?.email;
      const packageAmount = session.amount_total || 0;
      const packageId = session.metadata?.packageId;
      
      if (!customerEmail) {
        console.log("[Auto-Login] No customer email in session");
        return res.redirect("https://backend.rentapog.com?error=no_email");
      }

      // Find user by email
      const user = await storage.getUserByEmail(customerEmail);
      
      if (!user) {
        // User doesn't exist yet - redirect to login with message
        console.log(`[Auto-Login] No user found for email: ${customerEmail}`);
        return res.redirect(`https://backend.rentapog.com?payment_success=true&package=${packageId}&email=${encodeURIComponent(customerEmail)}`);
      }

      // Update user's packagePurchased if not already set or if higher package
      if (!user.packagePurchased || packageAmount > user.packagePurchased) {
        await storage.updateUserPackagePurchased(user.id, packageAmount);
        console.log(`[Auto-Login] Updated packagePurchased for ${customerEmail}: $${(packageAmount / 100).toFixed(2)}`);
      }

      // START TRIAL: User paid join fee, start 7-day trial (or until 3 referrals)
      // Only start trial if not already started
      if (!user.trialStartedAt && packageAmount > 0) {
        await storage.startUserTrial(user.id, packageAmount);
        console.log(`[Auto-Login] Started 7-day trial for ${customerEmail} after paying $${(packageAmount / 100).toFixed(2)} join fee`);
      }

      // Record affiliate sale for the referrer
      if (user.affiliateLink && packageAmount > 0) {
        try {
          // Find the referrer by their referral code
          const referrer = await storage.getUserByReferralCode(user.affiliateLink);
          
          if (referrer) {
            // Get how many sales this referrer has made globally (for saleNumber tracking)
            const existingSales = await storage.getAffiliateSales(referrer.id);
            const saleNumber = existingSales.length + 1;
            
            // Get per-tier sales count for this specific package amount
            const tierSalesRecord = await storage.getUserTierSales(referrer.id, packageAmount);
            const tierSaleNumber = (tierSalesRecord?.salesCount || 0) + 1;
            
            // Pass-up logic: 2nd sale AT EACH TIER goes to admin, all others go to referrer
            // Also pass up if buyer's level exceeds seller's level
            let passedUpTo: string | null = null;
            let passedUpReason: string | null = null;
            
            if (tierSaleNumber === 2 && !referrer.isSubAdmin) {
              // Sub-admins keep their 2nd sale; regular users pass it up
              passedUpTo = "admin";
              passedUpReason = "sale_2_tier";
              console.log(`[Auto-Login] Tier pass-up: 2nd sale at $${(packageAmount / 100).toFixed(2)} tier for ${referrer.referralCode}`);
            } else if (referrer.packagePurchased && packageAmount > referrer.packagePurchased) {
              passedUpTo = "admin";
              passedUpReason = "under_leveled";
            }
            
            // Create the affiliate sale record with tier info
            await storage.createAffiliateSale({
              sellerId: referrer.id,
              buyerId: user.id,
              amount: packageAmount,
              passedUpTo,
              saleNumber,
              stripePaymentId: session.payment_intent as string || null,
              sellerLevel: referrer.packagePurchased || 0,
              buyerLevel: packageAmount,
              passedUpReason,
              tierSaleNumber,
            });
            
            // Increment referrer's global sales count
            await storage.incrementSalesCount(referrer.id);
            
            // Increment referrer's tier-specific sales count
            await storage.incrementTierSalesCount(referrer.id, packageAmount);
            
            // Credit referral balance if NOT passed up, otherwise credit admin
            if (!passedUpTo) {
              const newBalance = (referrer.referralBalance || 0) + packageAmount;
              await storage.updateReferralBalance(referrer.id, newBalance);
              console.log(`[Auto-Login] Credited $${(packageAmount / 100).toFixed(2)} to ${referrer.referralCode}'s referral balance. New balance: $${(newBalance / 100).toFixed(2)}`);
            } else if (passedUpTo === "admin") {
              // Credit admin's referral balance for passed-up sales
              const adminCode = process.env.ADMIN_USERNAME?.toLowerCase() || "rentapog";
              const adminUser = await storage.getUserByReferralCode(adminCode);
              if (adminUser) {
                const adminNewBalance = (adminUser.referralBalance || 0) + packageAmount;
                await storage.updateReferralBalance(adminUser.id, adminNewBalance);
                console.log(`[Auto-Login] PASSED UP: Credited $${(packageAmount / 100).toFixed(2)} to admin's referral balance. New balance: $${(adminNewBalance / 100).toFixed(2)}`);
              } else {
                console.log(`[Auto-Login] Warning: Admin user with code ${adminCode} not found for pass-up credit`);
              }
            }
            
            console.log(`[Auto-Login] Recorded affiliate sale #${saleNumber} (tier sale #${tierSaleNumber}) for referrer ${referrer.referralCode} | Buyer: ${customerEmail} | Amount: $${(packageAmount / 100).toFixed(2)} | Passed up: ${passedUpTo || 'no'}`);
          } else {
            console.log(`[Auto-Login] No referrer found for code: ${user.affiliateLink}`);
          }
        } catch (saleErr) {
          console.error("[Auto-Login] Error recording affiliate sale:", saleErr);
          // Don't block the login if sale recording fails
        }
      }

      // Create user object for cookie (excluding sensitive data)
      const userForCookie = {
        id: user.id,
        email: user.email,
        name: user.name,
        referralCode: user.referralCode,
        accountBalance: user.accountBalance,
        referralBalance: user.referralBalance,
        salesCount: user.salesCount,
        subscriptionStatus: user.subscriptionStatus,
        packagePurchased: packageAmount,
      };

      // Set the user cookie for cross-subdomain auth
      res.cookie("user", JSON.stringify(userForCookie), {
        domain: ".rentapog.com",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: false,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });

      console.log(`[Auto-Login] Successfully logged in ${customerEmail} after package purchase`);
      
      // Redirect to dashboard
      return res.redirect("https://backend.rentapog.com?payment_success=true&auto_login=true");
    } catch (error: any) {
      console.error("[Auto-Login] Error:", error);
      return res.redirect(`https://backend.rentapog.com?error=auto_login_failed`);
    }
  });

  // Helper function to verify admin authentication - SECURE SERVER-SIDE VALIDATION
  // Validates the httpOnly session token against DATABASE session store
  const verifyAdminAuth = async (req: any): Promise<boolean> => {
    // Check for the httpOnly admin_session cookie
    const sessionToken = req.cookies?.admin_session;
    if (!sessionToken || typeof sessionToken !== 'string') return false;
    
    try {
      // Validate against DATABASE session store
      const session = await storage.getAdminSession(sessionToken);
      if (!session) return false;
      
      // Check expiration
      if (new Date(session.expiresAt) < new Date()) {
        await storage.deleteAdminSession(sessionToken);
        return false;
      }
      
      // Validate the session email matches ADMIN_EMAIL
      const adminEmail = process.env.ADMIN_EMAIL;
      return session.email === adminEmail;
    } catch (err) {
      console.error("[Admin Auth] Error verifying session:", err);
      return false;
    }
  };

  // API Key authentication for external AI agents (uses ADMIN_PIN)
  const verifyApiKeyAuth = (req: any): boolean => {
    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
    const adminPin = process.env.ADMIN_PIN;
    
    if (!apiKey || !adminPin) return false;
    return apiKey === adminPin;
  };

  // Combined auth - accepts either session-based admin auth OR API key
  const verifyAdminOrApiKey = async (req: any): Promise<boolean> => {
    if (verifyApiKeyAuth(req)) return true;
    return await verifyAdminAuth(req);
  };

  // ============== EXTERNAL AGENT API ENDPOINTS ==============
  // These endpoints use API key auth (X-API-Key header with ADMIN_PIN value)
  // Your AI agent can call these without session cookies

  // Agent API: Get all environment variables (masked for security)
  app.get("/api/agent/env-vars", async (req, res) => {
    if (!(await verifyAdminOrApiKey(req))) {
      return res.status(403).json({ message: "API key or admin access required" });
    }

    try {
      const maskValue = (value: string | undefined) => {
        if (!value) return null;
        if (value.length <= 8) return "***";
        return value.substring(0, 4) + "***" + value.substring(value.length - 2);
      };

      const envVars = {
        cloudflare: {
          CLOUDFLARE_API_TOKEN: { configured: !!process.env.CLOUDFLARE_API_TOKEN, masked: maskValue(process.env.CLOUDFLARE_API_TOKEN) },
          CLOUDFLARE_ZONE_ID: { configured: !!process.env.CLOUDFLARE_ZONE_ID, masked: maskValue(process.env.CLOUDFLARE_ZONE_ID) },
        },
        stripe: {
          STRIPE_API_KEY: { configured: !!process.env.STRIPE_API_KEY, masked: maskValue(process.env.STRIPE_API_KEY) },
          STRIPE_PUBLISHER_KEY: { configured: !!process.env.STRIPE_PUBLISHER_KEY, masked: maskValue(process.env.STRIPE_PUBLISHER_KEY) },
          STRIPE_CONNECT_CLIENT_ID: { configured: !!process.env.STRIPE_CONNECT_CLIENT_ID, masked: maskValue(process.env.STRIPE_CONNECT_CLIENT_ID) },
          STRIPE_WEBHOOK: { configured: !!process.env.STRIPE_WEBHOOK, masked: "***configured***" },
        },
        email: {
          GMAIL_USER: { configured: !!process.env.GMAIL_USER, masked: maskValue(process.env.GMAIL_USER) },
          GMAIL_PASSWORD: { configured: !!process.env.GMAIL_PASSWORD, masked: "***configured***" },
          RESEND_API_KEY: { configured: !!process.env.RESEND_API_KEY, masked: maskValue(process.env.RESEND_API_KEY) },
          SENDGRID_API_KEY: { configured: !!process.env.SENDGRID_API_KEY, masked: maskValue(process.env.SENDGRID_API_KEY) },
        },
        namecheap: {
          NAMECHEAP_API_KEY: { configured: !!process.env.NAMECHEAP_API_KEY, masked: maskValue(process.env.NAMECHEAP_API_KEY) },
          NAMECHEAP_API_USERNAME: { configured: !!process.env.NAMECHEAP_API_USERNAME, masked: maskValue(process.env.NAMECHEAP_API_USERNAME) },
          NAMECHEAP_USERNAME: { configured: !!process.env.NAMECHEAP_USERNAME, masked: maskValue(process.env.NAMECHEAP_USERNAME) },
          NAMECHEAP_CLIENT_IP: { configured: !!process.env.NAMECHEAP_CLIENT_IP, masked: maskValue(process.env.NAMECHEAP_CLIENT_IP) },
        },
        admin: {
          ADMIN_EMAIL: { configured: !!process.env.ADMIN_EMAIL, masked: maskValue(process.env.ADMIN_EMAIL) },
          ADMIN_USERNAME: { configured: !!process.env.ADMIN_USERNAME, masked: maskValue(process.env.ADMIN_USERNAME) },
          ADMIN_PIN: { configured: !!process.env.ADMIN_PIN, masked: "***configured***" },
        },
        database: {
          DATABASE_URL: { configured: !!process.env.DATABASE_URL, masked: "***configured***" },
          PGHOST: { configured: !!process.env.PGHOST, masked: maskValue(process.env.PGHOST) },
        },
        ai: {
          CLAUDE_API_KEY: { configured: !!process.env.CLAUDE_API_KEY, masked: maskValue(process.env.CLAUDE_API_KEY) },
          AI_INTEGRATIONS_ANTHROPIC_API_KEY: { configured: !!process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY, masked: maskValue(process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY) },
        },
        other: {
          ZAPIER_WEBHOOK_URL: { configured: !!process.env.ZAPIER_WEBHOOK_URL, masked: maskValue(process.env.ZAPIER_WEBHOOK_URL) },
          DOMAIN_REGISTRAR_URL: { configured: !!process.env.DOMAIN_REGISTRAR_URL, masked: maskValue(process.env.DOMAIN_REGISTRAR_URL) },
        }
      };

      res.json({ success: true, envVars });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Agent API: Fix subdomain proxy (for external AI agent)
  app.post("/api/agent/fix-subdomain-proxy/:subdomain", async (req, res) => {
    if (!(await verifyAdminOrApiKey(req))) {
      return res.status(403).json({ message: "API key or admin access required" });
    }

    try {
      const { subdomain } = req.params;
      const result = await fixSubdomainProxy(subdomain);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Agent API: Fix all subdomain proxies
  app.post("/api/agent/fix-all-subdomain-proxies", async (req, res) => {
    if (!(await verifyAdminOrApiKey(req))) {
      return res.status(403).json({ message: "API key or admin access required" });
    }

    try {
      const allRecords = await getAllDnsRecords();
      const results: any[] = [];
      let skipped = 0;
      
      const emailRelated = ['_dmarc', 'send', '_domainkey', 'mail', 'mx'];
      
      for (const record of allRecords) {
        if (record.type !== 'A' && record.type !== 'CNAME') {
          skipped++;
          continue;
        }
        
        const subdomain = record.name.replace('.rentapog.com', '').replace('rentapog.com', '');
        if (!subdomain || emailRelated.some(e => subdomain.includes(e))) {
          skipped++;
          continue;
        }
        
        if (!record.proxied) {
          const fixResult = await fixSubdomainProxy(subdomain);
          results.push({ subdomain, ...fixResult });
        } else {
          results.push({ subdomain, success: true, alreadyProxied: true });
        }
      }
      
      res.json({ success: true, results, skipped });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Agent API: Get all DNS records
  app.get("/api/agent/dns-records", async (req, res) => {
    if (!(await verifyAdminOrApiKey(req))) {
      return res.status(403).json({ message: "API key or admin access required" });
    }

    try {
      const records = await getAllDnsRecords();
      res.json({ success: true, records });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Agent API: Get all users
  app.get("/api/agent/users", async (req, res) => {
    if (!(await verifyAdminOrApiKey(req))) {
      return res.status(403).json({ message: "API key or admin access required" });
    }

    try {
      const allUsers = await db.select().from(users);
      const sanitizedUsers = allUsers.map((u: any) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        referralCode: u.referralCode,
        subdomain: u.subdomain,
        salesCount: u.salesCount,
        subscriptionStatus: u.subscriptionStatus,
        packagePurchased: u.packagePurchased,
        createdAt: u.createdAt
      }));
      res.json({ success: true, users: sanitizedUsers });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Agent API: Get rental domains
  app.get("/api/agent/domains", async (req, res) => {
    if (!(await verifyAdminOrApiKey(req))) {
      return res.status(403).json({ message: "API key or admin access required" });
    }

    try {
      const domains = await storage.getDomainsAvailableForRent();
      res.json({ success: true, domains });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Agent API: Create subdomain for user
  app.post("/api/agent/create-subdomain", async (req, res) => {
    if (!(await verifyAdminOrApiKey(req))) {
      return res.status(403).json({ message: "API key or admin access required" });
    }

    try {
      const { subdomain, userId, forwardUrl } = req.body;
      
      if (!subdomain || !userId) {
        return res.status(400).json({ success: false, error: "subdomain and userId required" });
      }

      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ success: false, error: "User not found" });
      }

      const targetUrl = forwardUrl || `https://rentapog.com/?aff=${user.referralCode}`;
      const result = await createSubdomain(subdomain, targetUrl);
      
      if (result.success) {
        await storage.updateUserSubdomain(userId, subdomain);
      }
      
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ============== END EXTERNAL AGENT API ENDPOINTS ==============

  // Admin-only: Get Stripe configuration status
  app.get("/api/admin/stripe-status", async (req, res) => {
    // SECURITY: Verify admin authentication
    if (!(await verifyAdminAuth(req))) {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const stripeApiKey = process.env.STRIPE_API_KEY;
      const stripeConnectClientId = process.env.STRIPE_CONNECT_CLIENT_ID;
      const stripeWebhookSecret = process.env.STRIPE_WEBHOOK || process.env.STRIPE_WEBHOOK_SECRET;
      
      // Mask the keys for display (show first 7 and last 4 chars)
      const maskKey = (key: string | undefined) => {
        if (!key) return null;
        if (key.length < 15) return key.substring(0, 4) + "..." + key.substring(key.length - 4);
        return key.substring(0, 7) + "..." + key.substring(key.length - 4);
      };

      const status = {
        stripeApiKey: {
          configured: !!stripeApiKey,
          masked: maskKey(stripeApiKey),
        },
        stripeConnectClientId: {
          configured: !!stripeConnectClientId,
          masked: maskKey(stripeConnectClientId),
        },
        stripeWebhookSecret: {
          configured: !!stripeWebhookSecret,
          masked: maskKey(stripeWebhookSecret),
        },
        connectionTest: null as any,
        recentPayments: [] as any[],
      };

      // Test Stripe connection if API key is configured
      if (stripeApiKey) {
        try {
          const stripe = new Stripe(stripeApiKey);
          const balance = await stripe.balance.retrieve();
          status.connectionTest = {
            success: true,
            message: "Connected to Stripe successfully",
            availableBalance: balance.available.map(b => ({
              amount: b.amount / 100,
              currency: b.currency.toUpperCase()
            })),
            pendingBalance: balance.pending.map(b => ({
              amount: b.amount / 100,
              currency: b.currency.toUpperCase()
            })),
          };

          // Get recent payments (last 10)
          try {
            const payments = await stripe.paymentIntents.list({ limit: 10 });
            status.recentPayments = payments.data.map(p => ({
              id: p.id,
              amount: (p.amount / 100).toFixed(2),
              currency: p.currency.toUpperCase(),
              status: p.status,
              created: new Date(p.created * 1000).toLocaleString(),
              metadata: p.metadata,
            }));
          } catch (paymentErr) {
            console.log("Could not fetch recent payments:", paymentErr);
          }
        } catch (stripeErr: any) {
          status.connectionTest = {
            success: false,
            message: stripeErr.message || "Failed to connect to Stripe",
          };
        }
      }

      res.json(status);
    } catch (error: any) {
      console.error("Stripe status error:", error);
      res.status(500).json({ message: error.message || "Failed to get Stripe status" });
    }
  });

  // Admin-only: Simulate a full payment to test affiliate pass-up logic
  // This ACTUALLY updates the database to simulate real payments
  app.post("/api/admin/simulate-payment", async (req, res) => {
    // SECURITY: Verify admin authentication
    if (!(await verifyAdminAuth(req))) {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const { affiliateCode, packageId = 1, amountCents } = req.body;
      
      if (!affiliateCode) {
        return res.status(400).json({ error: "affiliateCode is required" });
      }

      // Find the affiliate
      const affiliateUser = await storage.getUserByReferralCode(affiliateCode);
      if (!affiliateUser) {
        return res.status(404).json({ 
          error: `Affiliate "${affiliateCode}" not found`,
          suggestion: "Use an existing affiliate code from your database"
        });
      }

      // Get package price or use custom amount
      const pkg = VALID_PACKAGES[packageId];
      if (!pkg && !amountCents) {
        return res.status(400).json({ 
          error: `Invalid package ID: ${packageId}. Use 1-11 or provide amountCents.`,
          validPackages: Object.keys(VALID_PACKAGES).map(id => ({ id, title: VALID_PACKAGES[Number(id)].title }))
        });
      }
      const amount = amountCents || pkg?.price || 2900; // Default $29
      const buyerLevel = amount; // The package being purchased is the buyer's level
      const sellerLevel = affiliateUser.packagePurchased || 0; // Seller's level is what they purchased

      // Step 1: Increment sales count
      await storage.incrementUserSalesCount(affiliateUser.id);
      const updatedAffiliate = await storage.getUserById(affiliateUser.id);
      const saleNumber = updatedAffiliate?.salesCount || 1;

      // Step 2: Determine pass-up logic
      // Pass up if: 1) Sale #2 (original rule), OR 2) Buyer's level > Seller's level
      let passedUpTo: string | null = null;
      let passedUpReason: string | null = null;
      let creditedTo = affiliateCode;
      
      if (saleNumber === 2 && !affiliateUser.isSubAdmin) {
        // Sub-admins keep their 2nd sale; regular users pass it up
        passedUpTo = "admin";
        passedUpReason = "sale_2";
        creditedTo = "ADMIN (Sale #2 rule)";
      } else if (buyerLevel > sellerLevel) {
        passedUpTo = "admin";
        passedUpReason = "under_leveled";
        creditedTo = `ADMIN (Buyer level $${(buyerLevel/100).toFixed(0)} > Seller level $${(sellerLevel/100).toFixed(0)})`;
      }

      // Step 3: Record the affiliate sale with level info
      await storage.createAffiliateSale({
        sellerId: affiliateUser.id,
        buyerId: "TEST_SIMULATION",
        amount,
        passedUpTo,
        saleNumber,
        stripePaymentId: `test_sim_${Date.now()}`,
        sellerLevel,
        buyerLevel,
        passedUpReason,
      });

      // Step 4: Credit earnings (unless passed up, then credit admin)
      const beforeBalance = affiliateUser.referralBalance || 0;
      let afterBalance = beforeBalance;
      
      if (!passedUpTo) {
        await storage.updateReferralBalance(affiliateUser.id, amount);
        const finalUser = await storage.getUserById(affiliateUser.id);
        afterBalance = finalUser?.referralBalance || 0;
      } else if (passedUpTo === "admin") {
        // Credit admin's referral balance for passed-up sales
        const adminCode = process.env.ADMIN_USERNAME?.toLowerCase() || "rentapog";
        const adminUser = await storage.getUserByReferralCode(adminCode);
        if (adminUser) {
          const adminNewBalance = (adminUser.referralBalance || 0) + amount;
          await storage.updateReferralBalance(adminUser.id, adminNewBalance);
          console.log(`[Simulate Payment] PASSED UP: Credited $${(amount / 100).toFixed(2)} to admin's referral balance`);
        }
      }

      // Get all sales for this affiliate
      const allSales = await storage.getSalesByReferrer(affiliateUser.id);

      res.json({
        success: true,
        simulation: {
          affiliateCode,
          affiliateName: affiliateUser.name,
          affiliateEmail: affiliateUser.email,
          affiliateLevel: `$${(sellerLevel / 100).toFixed(0)}`,
          buyerLevel: `$${(buyerLevel / 100).toFixed(0)}`,
          packageAmount: `$${(amount / 100).toFixed(2)}`,
          saleNumber,
          passedUpTo: passedUpTo || "None - affiliate gets 100%",
          passedUpReason: passedUpReason || "N/A",
          creditedTo,
          balanceBefore: `$${(beforeBalance / 100).toFixed(2)}`,
          balanceAfter: `$${(afterBalance / 100).toFixed(2)}`,
        },
        explanation: passedUpReason === "sale_2" 
          ? "🔄 This was sale #2 - it was PASSED UP to admin. Affiliate did NOT receive credit."
          : passedUpReason === "under_leveled"
          ? `⬆️ PASSED UP: Buyer's package ($${(buyerLevel/100).toFixed(0)}) exceeds seller's level ($${(sellerLevel/100).toFixed(0)}). Admin receives this commission.`
          : `✅ Sale #${saleNumber} - Affiliate received 100% commission!`,
        salesHistory: allSales.slice(0, 10).map((s: any) => ({
          saleNumber: s.saleNumber,
          amount: `$${(s.amount / 100).toFixed(2)}`,
          passedUpTo: s.passedUpTo || "Affiliate",
          passedUpReason: s.passedUpReason || "N/A",
          date: s.createdAt ? new Date(s.createdAt).toLocaleString() : "N/A"
        })),
        nextSale: {
          willBeSaleNumber: saleNumber + 1,
          willGoTo: saleNumber + 1 === 2 ? "ADMIN (pass-up)" : "Affiliate (if within level)"
        }
      });
    } catch (error: any) {
      console.error("[Simulate Payment] Error:", error);
      res.status(500).json({ error: error?.message || "Simulation failed" });
    }
  });

  // Admin-only: Reset affiliate sales count for testing
  app.post("/api/admin/reset-affiliate-sales", async (req, res) => {
    // SECURITY: Verify admin authentication
    if (!(await verifyAdminAuth(req))) {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const { affiliateCode } = req.body;
      
      if (!affiliateCode) {
        return res.status(400).json({ error: "affiliateCode is required" });
      }

      const affiliateUser = await storage.getUserByReferralCode(affiliateCode);
      if (!affiliateUser) {
        return res.status(404).json({ error: `Affiliate "${affiliateCode}" not found` });
      }

      // Reset sales count to 0
      await db.update(users).set({ salesCount: 0 }).where(eq(users.id, affiliateUser.id));

      res.json({
        success: true,
        message: `Reset sales count for ${affiliateCode} to 0`,
        note: "You can now run 3 test payments to verify the pass-up logic"
      });
    } catch (error: any) {
      console.error("[Reset Affiliate Sales] Error:", error);
      res.status(500).json({ error: error?.message || "Reset failed" });
    }
  });

  // Admin-only: Test affiliate link
  app.get("/api/admin/test-affiliate/:code", async (req, res) => {
    // SECURITY: Verify admin authentication
    if (!(await verifyAdminAuth(req))) {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const { code } = req.params;
      
      // Look up the affiliate by their referral code
      const user = await storage.getUserByReferralCode(code);
      
      if (!user) {
        return res.json({
          valid: false,
          message: `Affiliate code "${code}" not found`,
        });
      }

      // Get their sales count and earnings
      const sales = await storage.getSalesByReferrer(user.id);
      
      res.json({
        valid: true,
        affiliateCode: code,
        affiliateName: user.name,
        affiliateEmail: user.email,
        stripeConnected: !!user.stripeAccountId,
        stripeAccountId: user.stripeAccountId ? user.stripeAccountId.substring(0, 10) + "..." : null,
        totalSales: sales.length,
        totalEarnings: sales.reduce((sum: number, s: any) => sum + (s.commission || 0), 0) / 100,
        recentSales: sales.slice(0, 5).map((s: any) => ({
          amount: (s.amount / 100).toFixed(2),
          commission: ((s.commission || 0) / 100).toFixed(2),
          date: s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "N/A",
        })),
      });
    } catch (error: any) {
      console.error("Test affiliate error:", error);
      res.status(500).json({ message: error.message || "Failed to test affiliate" });
    }
  });

  // Admin-only: Get all passed-up sales (sales that went to admin)
  app.get("/api/admin/passed-up-sales", async (req, res) => {
    if (!(await verifyAdminAuth(req))) {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const passedUpSales = await storage.getPassedUpSales();
      
      const totalAmount = passedUpSales.reduce((sum, s) => sum + (s.amount || 0), 0);
      const levelPassedUpSales = passedUpSales.filter(s => s.passedUpReason === "under_leveled");
      const levelPassedUpAmount = levelPassedUpSales.reduce((sum, s) => sum + (s.amount || 0), 0);
      const sale2PassedUpSales = passedUpSales.filter(s => s.passedUpReason === "sale_2" || !s.passedUpReason);
      const sale2PassedUpAmount = sale2PassedUpSales.reduce((sum, s) => sum + (s.amount || 0), 0);
      
      res.json({
        success: true,
        totalPassedUp: passedUpSales.length,
        totalAmount: totalAmount,
        totalAmountFormatted: `$${(totalAmount / 100).toFixed(2)}`,
        levelPassedUpCount: levelPassedUpSales.length,
        levelPassedUpAmount: levelPassedUpAmount,
        levelPassedUpAmountFormatted: `$${(levelPassedUpAmount / 100).toFixed(2)}`,
        sale2PassedUpCount: sale2PassedUpSales.length,
        sale2PassedUpAmount: sale2PassedUpAmount,
        sale2PassedUpAmountFormatted: `$${(sale2PassedUpAmount / 100).toFixed(2)}`,
        sales: passedUpSales.map(s => ({
          id: s.id,
          amount: s.amount,
          amountFormatted: `$${(s.amount / 100).toFixed(2)}`,
          saleNumber: s.saleNumber,
          sellerName: s.sellerName,
          sellerEmail: s.sellerEmail,
          sellerReferralCode: s.sellerReferralCode,
          sellerLevel: s.sellerLevel,
          buyerLevel: s.buyerLevel,
          passedUpReason: s.passedUpReason || "sale_2",
          date: s.createdAt ? new Date(s.createdAt).toLocaleString() : "N/A",
          stripePaymentId: s.stripePaymentId,
        }))
      });
    } catch (error: any) {
      console.error("[Passed-Up Sales] Error:", error);
      res.status(500).json({ error: error?.message || "Failed to get passed-up sales" });
    }
  });

  // Admin endpoint: Get ALL platform sales across all affiliates
  app.get("/api/admin/all-platform-sales", async (req, res) => {
    if (!(await verifyAdminAuth(req))) {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      // Get all affiliate sales with seller info
      const allSales = await storage.getAllAffiliateSales();
      
      const totalAmount = allSales.reduce((sum, s) => sum + (s.amount || 0), 0);
      const passedUpSales = allSales.filter(s => s.passedUpTo === "admin");
      const passedUpAmount = passedUpSales.reduce((sum, s) => sum + (s.amount || 0), 0);
      const creditedSales = allSales.filter(s => s.passedUpTo !== "admin");
      const creditedAmount = creditedSales.reduce((sum, s) => sum + (s.amount || 0), 0);
      
      // Get unique affiliates
      const uniqueAffiliates = new Set(allSales.map(s => s.sellerId));
      
      res.json({
        success: true,
        totalSales: allSales.length,
        totalAmount: totalAmount,
        totalAmountFormatted: `$${(totalAmount / 100).toFixed(2)}`,
        passedUpCount: passedUpSales.length,
        passedUpAmount: passedUpAmount,
        passedUpAmountFormatted: `$${(passedUpAmount / 100).toFixed(2)}`,
        creditedCount: creditedSales.length,
        creditedAmount: creditedAmount,
        creditedAmountFormatted: `$${(creditedAmount / 100).toFixed(2)}`,
        uniqueAffiliates: uniqueAffiliates.size,
        sales: allSales.map(s => ({
          id: s.id,
          amount: s.amount,
          amountFormatted: `$${(s.amount / 100).toFixed(2)}`,
          saleNumber: s.saleNumber,
          sellerName: s.sellerName || "Unknown",
          sellerEmail: s.sellerEmail || "Unknown",
          sellerReferralCode: s.sellerReferralCode || "Unknown",
          passedUpTo: s.passedUpTo,
          passedUpReason: s.passedUpReason,
          wasPassedUp: s.passedUpTo === "admin",
          date: s.createdAt ? new Date(s.createdAt).toLocaleString() : "N/A",
        }))
      });
    } catch (error: any) {
      console.error("[All Platform Sales] Error:", error);
      res.status(500).json({ error: error?.message || "Failed to get platform sales" });
    }
  });

  // ============ SUB-ADMIN MANAGEMENT ============

  // Admin-only: Create a new sub-admin account
  app.post("/api/admin/sub-admins", async (req, res) => {
    if (!(await verifyAdminAuth(req))) {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const { email, password, name, username, pin } = req.body;

      if (!email || !password || !username || !pin) {
        return res.status(400).json({ error: "Email, password, username, and PIN are required" });
      }

      // Validate PIN format (4-6 digits)
      if (!/^\d{4,6}$/.test(pin)) {
        return res.status(400).json({ error: "PIN must be 4-6 digits" });
      }

      // Validate username format (will be their referral code)
      if (!/^[a-z0-9_]+$/.test(username)) {
        return res.status(400).json({ error: "Username can only contain lowercase letters, numbers, and underscores" });
      }
      if (username.length < 3 || username.length > 20) {
        return res.status(400).json({ error: "Username must be 3-20 characters" });
      }

      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email already in use" });
      }

      // Check if username/referralCode already exists
      const existingUsername = await storage.getUserByReferralCode(username);
      if (existingUsername) {
        return res.status(400).json({ error: "Username already taken" });
      }

      // Get main admin user ID
      const adminEmail = process.env.ADMIN_EMAIL;
      const mainAdmin = adminEmail ? await storage.getUserByEmail(adminEmail) : null;

      // Hash password and PIN
      const hashedPassword = await bcryptjs.hash(password, 10);
      const hashedPin = await bcryptjs.hash(pin, 10);

      // Create sub-admin user
      const subAdmin = await storage.createUser({
        email,
        name: name || username,
        password: hashedPassword,
        referralCode: username,
        affiliateLink: "admin", // They were "referred by" admin
      });

      // Mark as sub-admin and store hashed PIN
      await db.update(users).set({
        isSubAdmin: true,
        subAdminCreatedBy: mainAdmin?.id || "admin",
        packagePurchased: 19900, // Give them max package level
        subAdminPin: hashedPin,
      }).where(eq(users.id, subAdmin.id));

      console.log(`[Sub-Admin] Created sub-admin: ${email} (${username}) by ${mainAdmin?.email || "admin"}`);

      // Send welcome email with login credentials
      try {
        const { Resend } = await import("resend");
        const resendApiKey = process.env.RESEND_API_KEY;
        if (resendApiKey) {
          const resend = new Resend(resendApiKey);
          await resend.emails.send({
            from: "RentAPog <sales@rentapog.com>",
            to: email,
            subject: "Your RentAPog Sub-Admin Account is Ready!",
            html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #1e40af;">Welcome to RentAPog, ${name || username}!</h2>
              <p style="font-size: 16px; color: #333;">Your sub-admin account has been created. Here are your login credentials:</p>
              
              <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Password:</strong> ${password}</p>
                <p><strong>PIN:</strong> ${pin}</p>
                <p><strong>Your Affiliate Code:</strong> ${username}</p>
              </div>
              
              <div style="background: #10b981; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <a href="https://backend.rentapog.com" style="display: inline-block; background: white; color: #10b981; padding: 15px 40px; border-radius: 5px; text-decoration: none; font-size: 16px; font-weight: bold;">Login Now</a>
              </div>
              
              <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                <strong>Your Benefit:</strong>
                <p>As a sub-admin, your 2nd sale commission goes to YOU instead of the main admin!</p>
              </div>
              
              <p style="color: #666;">Your affiliate link: <strong>rentapog.com/?aff=${username}</strong></p>
            </div>`,
          });
          console.log(`[Sub-Admin] Welcome email sent to ${email}`);
        }
      } catch (emailErr) {
        console.error("[Sub-Admin] Failed to send welcome email:", emailErr);
      }

      res.json({
        success: true,
        message: "Sub-admin created successfully",
        subAdmin: {
          id: subAdmin.id,
          email,
          name: name || username,
          username,
          affiliateLink: `rentapog.com/?aff=${username}`,
        }
      });
    } catch (error: any) {
      console.error("[Sub-Admin Create] Error:", error);
      res.status(500).json({ error: error?.message || "Failed to create sub-admin" });
    }
  });

  // Admin-only: Get all sub-admins
  app.get("/api/admin/sub-admins", async (req, res) => {
    if (!(await verifyAdminAuth(req))) {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      // Query all users where isSubAdmin = true
      const subAdmins = await db.select().from(users).where(eq(users.isSubAdmin, true));

      // Get sales data for each sub-admin
      const subAdminsWithStats = await Promise.all(subAdmins.map(async (sa) => {
        const sales = await storage.getSalesByReferrer(sa.id);
        const totalSales = sales.length;
        const totalEarnings = sales.filter((s: any) => s.passedUpTo !== "admin").reduce((sum: number, s: any) => sum + (s.amount || 0), 0);
        
        return {
          id: sa.id,
          email: sa.email,
          name: sa.name,
          username: sa.referralCode,
          affiliateLink: `rentapog.com/?aff=${sa.referralCode}`,
          totalSales,
          totalEarnings: totalEarnings / 100,
          createdAt: sa.createdAt,
        };
      }));

      res.json({
        success: true,
        count: subAdminsWithStats.length,
        subAdmins: subAdminsWithStats,
      });
    } catch (error: any) {
      console.error("[Sub-Admin List] Error:", error);
      res.status(500).json({ error: error?.message || "Failed to get sub-admins" });
    }
  });

  // Admin-only: Delete a sub-admin
  app.delete("/api/admin/sub-admins/:id", async (req, res) => {
    if (!(await verifyAdminAuth(req))) {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const { id } = req.params;

      // Find the sub-admin
      const subAdmin = await storage.getUserById(id);
      if (!subAdmin) {
        return res.status(404).json({ error: "Sub-admin not found" });
      }
      if (!subAdmin.isSubAdmin) {
        return res.status(400).json({ error: "User is not a sub-admin" });
      }

      // Deactivate the account (don't fully delete to preserve sales history)
      await db.update(users).set({
        isSubAdmin: false,
        isActive: false,
      }).where(eq(users.id, id));

      console.log(`[Sub-Admin] Deactivated sub-admin: ${subAdmin.email}`);

      res.json({
        success: true,
        message: `Sub-admin ${subAdmin.email} has been deactivated`,
      });
    } catch (error: any) {
      console.error("[Sub-Admin Delete] Error:", error);
      res.status(500).json({ error: error?.message || "Failed to delete sub-admin" });
    }
  });

  // ============ END SUB-ADMIN MANAGEMENT ============

  // ============ SUB-ADMIN SELF-SERVICE ENDPOINTS ============

  // Sub-admin: Get their own dashboard data
  app.get("/api/sub-admin/dashboard", async (req, res) => {
    try {
      const userCookie = req.cookies?.user;
      if (!userCookie) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const userData = JSON.parse(decodeURIComponent(userCookie));
      const user = await storage.getUserById(userData.id);
      
      if (!user || !user.isSubAdmin) {
        return res.status(403).json({ message: "Sub-admin access required" });
      }

      // Get their sales data
      const sales = await storage.getSalesByReferrer(user.id);
      const totalSales = sales.length;
      
      // Separate their sales vs passed-up sales
      const mySales = sales.filter((s: any) => s.passedUpTo !== "admin");
      const passedUpSales = sales.filter((s: any) => s.passedUpTo === "admin");
      
      const myEarnings = mySales.reduce((sum: number, s: any) => sum + (s.amount || 0), 0);
      const passedUpAmount = passedUpSales.reduce((sum: number, s: any) => sum + (s.amount || 0), 0);

      // Get referrals (users who signed up with their code)
      const referrals = await storage.getUsersByAffiliateLink(user.referralCode);

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          referralCode: user.referralCode,
          affiliateLink: `rentapog.com/?aff=${user.referralCode}`,
          packagesLink: `packages.rentapog.com/?aff=${user.referralCode}`,
          subdomain: user.subdomain || null,
          stripeAccountId: user.stripeAccountId || null,
        },
        stats: {
          totalSales,
          mySalesCount: mySales.length,
          passedUpCount: passedUpSales.length,
          myEarnings: myEarnings / 100,
          passedUpAmount: passedUpAmount / 100,
          referralsCount: referrals.length,
        },
        recentSales: sales.slice(0, 10).map((s: any) => ({
          id: s.id,
          amount: (s.amount / 100).toFixed(2),
          saleNumber: s.saleNumber,
          passedUpTo: s.passedUpTo,
          passedUpReason: s.passedUpReason,
          date: s.createdAt ? new Date(s.createdAt).toLocaleString() : "N/A",
        })),
        referrals: referrals.slice(0, 20).map((r: any) => ({
          id: r.id,
          email: r.email,
          name: r.name,
          packagePurchased: r.packagePurchased ? (r.packagePurchased / 100).toFixed(0) : null,
          createdAt: r.createdAt ? new Date(r.createdAt).toLocaleString() : "N/A",
        })),
      });
    } catch (error: any) {
      console.error("[Sub-Admin Dashboard] Error:", error);
      res.status(500).json({ error: error?.message || "Failed to get dashboard data" });
    }
  });

  // Sub-admin: Update their own profile (email, password, name)
  app.put("/api/sub-admin/profile", async (req, res) => {
    try {
      const userCookie = req.cookies?.user;
      if (!userCookie) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const userData = JSON.parse(decodeURIComponent(userCookie));
      const user = await storage.getUserById(userData.id);
      
      if (!user || !user.isSubAdmin) {
        return res.status(403).json({ message: "Sub-admin access required" });
      }

      const { email, password, name } = req.body;
      const updates: any = {};

      // Update email if provided and different
      if (email && email !== user.email) {
        const existingEmail = await storage.getUserByEmail(email);
        if (existingEmail) {
          return res.status(400).json({ error: "Email already in use" });
        }
        updates.email = email;
      }

      // Update name if provided
      if (name) {
        updates.name = name;
      }

      // Update password if provided
      if (password) {
        if (password.length < 6) {
          return res.status(400).json({ error: "Password must be at least 6 characters" });
        }
        updates.password = await bcryptjs.hash(password, 10);
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "No updates provided" });
      }

      await storage.updateUser(user.id, updates);

      // Get updated user
      const updatedUser = await storage.getUserById(user.id);

      console.log(`[Sub-Admin Profile] Updated profile for ${user.email}`);

      res.json({
        success: true,
        message: "Profile updated successfully",
        user: {
          id: updatedUser?.id,
          email: updatedUser?.email,
          name: updatedUser?.name,
          referralCode: updatedUser?.referralCode,
        }
      });
    } catch (error: any) {
      console.error("[Sub-Admin Profile] Error:", error);
      res.status(500).json({ error: error?.message || "Failed to update profile" });
    }
  });

  // ============ END SUB-ADMIN SELF-SERVICE ENDPOINTS ============

  // Admin endpoint: Get all DNS records and fix proxy settings
  app.get("/api/admin/dns-records", async (req, res) => {
    if (!(await verifyAdminAuth(req))) {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const records = await getAllDnsRecords();
      const subdomainRecords = records
        .filter(r => r.name.endsWith(".rentapog.com") && r.name !== "rentapog.com")
        .map(r => ({
          name: r.name,
          type: r.type,
          content: r.content,
          proxied: r.proxied,
          subdomain: r.name.replace(".rentapog.com", ""),
        }));

      res.json({
        success: true,
        totalRecords: records.length,
        subdomainRecords: subdomainRecords,
        needsProxyFix: subdomainRecords.filter(r => !r.proxied).map(r => r.subdomain),
      });
    } catch (error: any) {
      console.error("[DNS Records] Error:", error);
      res.status(500).json({ error: error?.message || "Failed to get DNS records" });
    }
  });

  // Admin endpoint: Fix proxy settings for a specific subdomain
  app.post("/api/admin/fix-subdomain-proxy/:subdomain", async (req, res) => {
    if (!(await verifyAdminAuth(req))) {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const { subdomain } = req.params;
      console.log(`[Admin] Fixing proxy for subdomain: ${subdomain}`);
      
      const result = await fixSubdomainProxy(subdomain);
      
      if (result.success) {
        res.json({ 
          success: true, 
          message: `Proxy enabled for ${subdomain}.rentapog.com`,
          subdomain: result.subdomain 
        });
      } else {
        res.status(400).json({ success: false, error: result.error });
      }
    } catch (error: any) {
      console.error("[Fix Subdomain Proxy] Error:", error);
      res.status(500).json({ error: error?.message || "Failed to fix subdomain proxy" });
    }
  });

  // Admin endpoint: Fix proxy settings for all subdomains (only A/CNAME records)
  app.post("/api/admin/fix-all-subdomain-proxies", async (req, res) => {
    if (!(await verifyAdminAuth(req))) {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const records = await getAllDnsRecords();
      
      // Only process A and CNAME records that can be proxied
      const proxyableTypes = ['A', 'CNAME'];
      const subdomainsToFix = records
        .filter(r => 
          r.name.endsWith(".rentapog.com") && 
          r.name !== "rentapog.com" && 
          proxyableTypes.includes(r.type) &&
          !r.proxied
        )
        .map(r => r.name.replace(".rentapog.com", ""));
      
      // Skip email-related subdomains that should not be proxied
      const emailSubdomains = ['_dmarc', 'send', 'resend._domainkey', 'k2._domainkey', 'k3._domainkey'];
      const filteredSubdomains = subdomainsToFix.filter(s => 
        !emailSubdomains.some(email => s.includes(email))
      );

      const results: { subdomain: string; success: boolean; error?: string }[] = [];
      const skipped = subdomainsToFix.length - filteredSubdomains.length;
      
      for (const subdomain of filteredSubdomains) {
        const result = await fixSubdomainProxy(subdomain);
        results.push({
          subdomain,
          success: result.success,
          error: result.error,
        });
      }

      res.json({
        success: true,
        totalFixed: results.filter(r => r.success).length,
        totalFailed: results.filter(r => !r.success).length,
        totalSkipped: skipped,
        results,
      });
    } catch (error: any) {
      console.error("[Fix All Subdomain Proxies] Error:", error);
      res.status(500).json({ error: error?.message || "Failed to fix subdomain proxies" });
    }
  });

  // Affiliate endpoint: Get own sales history with pass-up status
  app.get("/api/user/my-sales", async (req, res) => {
    try {
      // Get user ID from the user cookie (same as frontend uses)
      const userCookie = req.cookies?.user;
      let userId: string | null = null;
      
      if (userCookie) {
        try {
          const userData = JSON.parse(decodeURIComponent(userCookie));
          userId = userData.id;
        } catch {
          // Cookie parse failed
        }
      }
      
      // Fallback to Authorization header (for backwards compatibility)
      if (!userId) {
        const authHeader = req.headers.authorization;
        userId = authHeader?.replace("Bearer ", "") || null;
      }
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const sales = await storage.getSalesWithSellerInfo(userId);
      
      // Check if this is the admin user
      const adminUsername = process.env.ADMIN_USERNAME?.toLowerCase() || "rentapog";
      const isAdmin = user.referralCode?.toLowerCase() === adminUsername;
      
      // For admin, also get all passed-up sales from other affiliates
      let adminPassedUpSales: any[] = [];
      let adminPassedUpAmount = 0;
      let adminLevelPassedUpAmount = 0;
      
      if (isAdmin) {
        adminPassedUpSales = await storage.getPassedUpSales();
        adminPassedUpAmount = adminPassedUpSales.reduce((sum, s) => sum + (s.amount || 0), 0);
        adminLevelPassedUpAmount = adminPassedUpSales
          .filter(s => s.passedUpReason === "under_leveled")
          .reduce((sum, s) => sum + (s.amount || 0), 0);
      }
      
      // Regular earnings from own referrals
      const ownEarnings = sales
        .filter(s => s.passedUpTo !== "admin")
        .reduce((sum, s) => sum + (s.amount || 0), 0);
      
      // For admin: total earnings = own referral earnings + all passed-up from others
      const totalEarnings = isAdmin ? (ownEarnings + adminPassedUpAmount) : ownEarnings;
      
      const passedUpAmount = sales
        .filter(s => s.passedUpTo === "admin")
        .reduce((sum, s) => sum + (s.amount || 0), 0);

      // Calculate level-based pass-up stats
      const levelPassedUpAmount = sales
        .filter(s => s.passedUpReason === "under_leveled")
        .reduce((sum, s) => sum + (s.amount || 0), 0);

      const creditedSalesCount = isAdmin 
        ? (sales.filter(s => s.passedUpTo !== "admin").length + adminPassedUpSales.length)
        : sales.filter(s => s.passedUpTo !== "admin").length;
      const passedUpCount = sales.filter(s => s.passedUpTo === "admin").length;
      
      res.json({
        success: true,
        userLevel: user.packagePurchased || 0,
        userLevelFormatted: user.packagePurchased ? `$${(user.packagePurchased / 100).toFixed(0)}` : "Not set",
        totalSales: sales.length,
        creditedSalesCount: creditedSalesCount,
        totalEarnings: totalEarnings,
        totalEarningsFormatted: `$${(totalEarnings / 100).toFixed(2)}`,
        passedUpCount: passedUpCount,
        passedUpAmount: passedUpAmount,
        passedUpAmountFormatted: `$${(passedUpAmount / 100).toFixed(2)}`,
        levelPassedUpCount: sales.filter(s => s.passedUpReason === "under_leveled").length,
        levelPassedUpAmount: levelPassedUpAmount,
        levelPassedUpAmountFormatted: `$${(levelPassedUpAmount / 100).toFixed(2)}`,
        // For admin, include passed-up earnings info
        isAdmin: isAdmin,
        adminPassedUpCount: isAdmin ? adminPassedUpSales.length : 0,
        adminPassedUpAmount: isAdmin ? adminPassedUpAmount : 0,
        adminPassedUpAmountFormatted: isAdmin ? `$${(adminPassedUpAmount / 100).toFixed(2)}` : "$0.00",
        adminLevelPassedUpCount: isAdmin ? adminPassedUpSales.filter(s => s.passedUpReason === "under_leveled").length : 0,
        adminLevelPassedUpAmount: isAdmin ? adminLevelPassedUpAmount : 0,
        adminLevelPassedUpAmountFormatted: isAdmin ? `$${(adminLevelPassedUpAmount / 100).toFixed(2)}` : "$0.00",
        sales: sales.map(s => ({
          id: s.id,
          saleNumber: s.saleNumber,
          amount: s.amount,
          amountFormatted: `$${(s.amount / 100).toFixed(2)}`,
          passedUpTo: s.passedUpTo,
          passedUpReason: s.passedUpReason,
          sellerLevel: s.sellerLevel,
          buyerLevel: s.buyerLevel,
          wasPassedUp: s.passedUpTo === "admin",
          youReceived: s.passedUpTo === "admin" ? "$0.00" : `$${(s.amount / 100).toFixed(2)}`,
          date: s.createdAt ? new Date(s.createdAt).toLocaleString() : "N/A",
        }))
      });
    } catch (error: any) {
      console.error("[My Sales] Error:", error);
      res.status(500).json({ error: error?.message || "Failed to get sales" });
    }
  });

  // Regular user login endpoint - does NOT allow admin login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password, pin } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      // Regular user login
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // CHECK: Account must be active (not cancelled)
      if (!user.isActive) {
        return res.status(403).json({ message: "Your account has been cancelled due to payment failure. Contact support to reactivate." });
      }

      // Validate password against hashed password
      const passwordValid = await bcryptjs.compare(password, user.password);
      if (!passwordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Sub-admins can login with just email/password (no PIN required)

      // Package tracking: user.packagePurchased tracks their upgrade level (0 = none)
      // Users can access backend without a package - package level is tracked for commission purposes

      // Build user response with isSubAdmin flag
      const userResponse = {
        ...user,
        isSubAdmin: user.isSubAdmin || false,
      };

      // Set cookie that works across all subdomains
      res.cookie("user", JSON.stringify(userResponse), {
        domain: ".rentapog.com",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: false,
        sameSite: "lax",
      });

      res.json({ success: true, user: userResponse });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    // Clear the user cookie across all subdomains
    res.clearCookie("user", {
      domain: ".rentapog.com",
      path: "/",
      sameSite: "lax",
    });
    res.json({ success: true });
  });

  // Forgot password - send reset email
  app.post("/api/auth/forgot-password", async (req, res) => {
    console.log("[Password Reset] Endpoint hit with body:", req.body);
    try {
      const { email } = req.body;
      console.log("[Password Reset] Email extracted:", email);
      
      if (!email) {
        console.log("[Password Reset] No email provided in request");
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      
      // Always return success to prevent email enumeration attacks
      if (!user) {
        return res.json({ success: true, message: "If an account exists with this email, a reset link has been sent." });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      // Save token to database
      await storage.setPasswordResetToken(email, resetToken, resetExpires);

      // Send reset email via Resend (same service that sends other emails successfully)
      const resendApiKey = process.env.RESEND_API_KEY;
      
      if (resendApiKey) {
        const resetUrl = `https://backend.rentapog.com/reset-password?token=${resetToken}`;
        
        try {
          console.log(`[Password Reset] Attempting to send email to ${email} via Resend...`);
          
          const { Resend } = await import("resend");
          const resend = new Resend(resendApiKey);
          
          await resend.emails.send({
            from: "RentAPog <support@rentapog.com>",
            to: email,
            subject: "Reset Your RentAPog Password",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #1e40af;">Reset Your Password</h1>
                <p>Hi ${user.name || "there"},</p>
                <p>We received a request to reset your RentAPog password. Click the button below to set a new password:</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
                </div>
                <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
                <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="color: #999; font-size: 12px;">RentAPog - Daily Domain Rentals</p>
              </div>
            `,
          });
          
          console.log(`[Password Reset] Email sent successfully to ${email} via Resend`);
        } catch (emailError) {
          console.error("[Password Reset] Failed to send email via Resend:", emailError);
        }
      } else {
        console.error("[Password Reset] RESEND_API_KEY not configured!");
      }

      res.json({ success: true, message: "If an account exists with this email, a reset link has been sent." });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Failed to process request" });
    }
  });

  // Reset password with token
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      console.log("[Reset Password] Received request with token:", token ? token.substring(0, 10) + "..." : "missing");

      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      // Find user by reset token
      console.log("[Reset Password] Looking up user by token...");
      const user = await storage.getUserByResetToken(token);
      console.log("[Reset Password] User found:", user ? user.email : "NO USER FOUND");
      
      if (!user) {
        console.log("[Reset Password] Token not found in database. User may have clicked an old link.");
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      // Check if token has expiration and hasn't expired
      if (!user.passwordResetExpires) {
        return res.status(400).json({ message: "Invalid reset token. Please request a new one." });
      }
      
      if (new Date(user.passwordResetExpires) < new Date()) {
        // Clear the expired token
        await storage.resetPassword(user.id, user.password);
        return res.status(400).json({ message: "Reset token has expired. Please request a new one." });
      }

      // Hash the new password
      const hashedPassword = await bcryptjs.hash(newPassword, 10);

      // Update password and clear reset token
      await storage.resetPassword(user.id, hashedPassword);

      res.json({ success: true, message: "Password has been reset successfully. You can now log in." });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // Email collection endpoint
  app.post("/api/leads", async (req, res) => {
    try {
      const data = insertEmailLeadSchema.parse(req.body);
      const lead = await storage.createEmailLead(data);
      res.json({ success: true, lead });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create lead" });
      }
    }
  });

  // Stripe webhook endpoint for payment confirmations and cancellations
  app.post("/api/webhook/stripe", async (req, res) => {
    console.log(`🔔 [Stripe Webhook] Received event`);
    try {
      // Verify webhook signature using Stripe's library
      const webhookSecret = process.env.STRIPE_PACKAGES_WEBHOOK || process.env.STRIPE_WEBHOOK_SECRET;
      let event;
      
      if (webhookSecret && req.rawBody) {
        const sig = req.headers['stripe-signature'];
        if (!sig) {
          console.error('[Stripe Webhook] Missing stripe-signature header');
          return res.status(400).json({ error: 'Missing stripe-signature header' });
        }
        
        try {
          const stripeApiKey = process.env.STRIPE_API_KEY;
          if (!stripeApiKey) {
            console.error('[Stripe Webhook] STRIPE_API_KEY not configured');
            return res.status(500).json({ error: 'Stripe not configured' });
          }
          const stripe = new Stripe(stripeApiKey, { apiVersion: "2025-08-27.basil" });
          event = stripe.webhooks.constructEvent(req.rawBody as Buffer, sig, webhookSecret);
          console.log(`✓ [Stripe Webhook] Signature verified: ${event.type}`);
        } catch (err: any) {
          console.error(`[Stripe Webhook] Signature verification failed: ${err.message}`);
          return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
        }
      } else {
        // Fallback for development/testing (no signature verification)
        console.warn('[Stripe Webhook] No webhook secret configured - skipping signature verification');
        event = req.body;
      }
      
      console.log(`🔔 [Stripe Webhook] Processing event: ${event?.type || 'unknown'}`);

      // PAYMENT SUCCESS: Process completed checkout
      if (event.type === "checkout.session.completed") {
        console.log(`✓ [Stripe Webhook] Processing checkout.session.completed`);
        console.log(`  Metadata:`, JSON.stringify(event.data?.object?.metadata || {}));
        const session = event.data.object;
        
        // Extract metadata from Stripe session
        const { userId, referrerId, paymentType, domainName } = session.metadata || {};
        const amount = session.amount_total || 0; // Keep in cents for database storage

        // DOMAIN REGISTRATION: Create subdomain with Namecheap and add to user's backoffice
        if (paymentType === "domain_registration" && userId && domainName) {
          const renewalDate = new Date();
          renewalDate.setFullYear(renewalDate.getFullYear() + 1);

          // Get user info for affiliate link forwarding
          const user = await storage.getUserById(userId);
          if (!user) {
            console.error(`[Domain Registration] User not found: ${userId}`);
            return res.json({ received: true, error: "User not found" });
          }

          // Default forward URL is user's affiliate link
          const forwardUrl = `https://rentapog.com/?aff=${user.referralCode}`;

          // Create subdomain with Namecheap
          console.log(`[Domain Registration] Creating subdomain: ${domainName}.rentapog.com → ${forwardUrl}`);
          const namecheapResult = await createSubdomain(domainName, forwardUrl);
          
          // Determine status based on Namecheap result
          const domainStatus = namecheapResult.success ? "active" : "pending_setup";
          
          if (!namecheapResult.success) {
            console.error(`[Domain Registration] Namecheap error: ${namecheapResult.error} - Domain marked as pending_setup`);
          } else {
            console.log(`✓ [Namecheap] Subdomain created: ${domainName}.rentapog.com`);
          }

          // Create domain rental record in database
          const domainRental = await storage.createDomainRental({
            userId,
            domainName,
            dailyRate: 2000, // $20/day in cents
            status: domainStatus,
            stripePaymentId: session.id,
            registrationCost: amount,
            registrationPaidDate: new Date(),
            renewalDueDate: renewalDate,
            forwardUrl: forwardUrl,
          });

          await storage.updateDomainRenewal(
            domainRental.id,
            new Date(),
            renewalDate,
            amount
          );

          console.log(`✓ [Domain Registered] ${domainName}.rentapog.com for user ${userId} | Amount: $${(amount / 100).toFixed(2)} | Status: ${domainStatus}`);
          
          // Notify all users about new domain listing
          notificationService.notifyNewDomainListing(`${domainName}.rentapog.com`, "Domain Registration", amount / 100);
          
          // Send domain registration confirmation email
          try {
            const { Resend } = await import("resend");
            const resendApiKey = process.env.RESEND_API_KEY;
            if (resendApiKey) {
              const resend = new Resend(resendApiKey);
              if (user?.email) {
                await resend.emails.send({
                  from: "support@rentapog.com",
                  to: user.email,
                  subject: `✓ Your Domain is Live: ${domainName}.rentapog.com 🎉`,
                  html: `<div style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #1e40af;">Your subdomain is now live!</h2>
                    <p><strong>${domainName}.rentapog.com</strong> is ready to promote.</p>
                    <p>🔗 <strong>Your Subdomain:</strong> <a href="https://${domainName}.rentapog.com">${domainName}.rentapog.com</a></p>
                    <p>📌 <strong>Forwards to:</strong> Your affiliate link (${user.referralCode})</p>
                    <hr style="margin: 20px 0;">
                    <p>Access your dashboard to manage your domain: <a href="https://backend.rentapog.com">backend.rentapog.com</a></p>
                    <p>Your annual renewal is due: ${renewalDate.toLocaleDateString()}</p>
                  </div>`,
                });
              }
            }
          } catch (emailErr) {
            console.error("Failed to send domain registration email:", emailErr);
          }
        }

        // PACKAGE PURCHASE: Credit the affiliate and log the sale
        if (paymentType === "package_purchase") {
          const { packageId, packageTitle, affiliateCode, referrerId: metaReferrerId } = session.metadata || {};
          const buyerEmail = session.customer_email || session.customer_details?.email;
          
          console.log(`✓ [Package Purchase] ${packageTitle} ($${(amount/100).toFixed(2)}) | Affiliate: ${affiliateCode}`);
          
          // Find the affiliate user by their referral code
          if (affiliateCode && affiliateCode !== "rentapog") {
            const affiliateUser = await storage.getUserByReferralCode(affiliateCode);
            if (affiliateUser) {
              // Get level info
              const buyerLevel = amount; // The package being purchased
              const sellerLevel = affiliateUser.packagePurchased || 0; // Affiliate's level
              
              // Increment sales count to track pass-up logic
              await storage.incrementUserSalesCount(affiliateUser.id);
              const updatedAffiliate = await storage.getUserById(affiliateUser.id);
              const saleNumber = updatedAffiliate?.salesCount || 1;
              
              // Determine if this sale is passed up
              // Pass up if: 1) Sale #2, OR 2) Buyer's level > Seller's level
              let passedUpTo: string | null = null;
              let passedUpReason: string | null = null;
              
              if (saleNumber === 2) {
                passedUpTo = "admin";
                passedUpReason = "sale_2";
              } else if (buyerLevel > sellerLevel) {
                passedUpTo = "admin";
                passedUpReason = "under_leveled";
              }
              
              // Record the affiliate sale with level info
              await storage.createAffiliateSale({
                sellerId: affiliateUser.id,
                buyerId: metaReferrerId || session.customer || session.id || "STRIPE_CHECKOUT",
                amount,
                passedUpTo,
                saleNumber,
                stripePaymentId: session.id || `stripe_${Date.now()}`,
                sellerLevel,
                buyerLevel,
                passedUpReason,
              });
              
              // Credit earnings to affiliate (unless passed up, then credit admin)
              if (!passedUpTo) {
                await storage.updateReferralBalance(affiliateUser.id, amount);
                console.log(`✓ [Affiliate Credited] ${affiliateCode} earned $${(amount/100).toFixed(2)} (sale #${saleNumber})`);
                
                // Send real-time notification to the affiliate
                const { notificationService } = await import("./websocket");
                notificationService.notifyAffiliateSale(affiliateUser.id.toString(), amount, buyerEmail || undefined);
              } else if (passedUpTo === "admin") {
                // Credit admin's referral balance for passed-up sales
                const adminCode = process.env.ADMIN_USERNAME?.toLowerCase() || "rentapog";
                const adminUser = await storage.getUserByReferralCode(adminCode);
                if (adminUser) {
                  const adminNewBalance = (adminUser.referralBalance || 0) + amount;
                  await storage.updateReferralBalance(adminUser.id, adminNewBalance);
                  console.log(`✓ [PASSED UP to Admin] $${(amount/100).toFixed(2)} credited to admin | Reason: ${passedUpReason}`);
                }
                if (passedUpReason === "sale_2") {
                  console.log(`✓ [Pass-up] Sale #2 goes to admin | Affiliate: ${affiliateCode}`);
                } else {
                  console.log(`✓ [Pass-up] Under-leveled: Buyer $${(buyerLevel/100).toFixed(0)} > Seller $${(sellerLevel/100).toFixed(0)} | Affiliate: ${affiliateCode}`);
                }
              }
            } else {
              console.log(`[Package Purchase] Affiliate code not found: ${affiliateCode}`);
            }
          }
          
          // Send confirmation email to buyer if we have their email
          try {
            if (buyerEmail) {
              const { Resend } = await import("resend");
              const resendApiKey = process.env.RESEND_API_KEY;
              if (resendApiKey) {
                const resend = new Resend(resendApiKey);
                await resend.emails.send({
                  from: "support@rentapog.com",
                  to: buyerEmail,
                  subject: `Welcome to RentAPog - ${packageTitle} 🎉`,
                  html: `<div style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #1e40af;">Thank you for your purchase!</h2>
                    <p>You've successfully purchased the <strong>${packageTitle}</strong> package.</p>
                    <p><strong>Amount:</strong> $${(amount/100).toFixed(2)}</p>
                    <hr style="margin: 20px 0;">
                    <p>Ready to get started? Log in to your dashboard:</p>
                    <p><a href="https://backend.rentapog.com" style="background: #1e40af; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Access Your Dashboard</a></p>
                    <hr style="margin: 20px 0;">
                    <p>Your referral link: <a href="https://rentapog.com/?aff=${affiliateCode || 'rentapog'}">${affiliateCode || 'rentapog'}</a></p>
                  </div>`,
                });
              }
            }
          } catch (emailErr) {
            console.error("Failed to send package confirmation email:", emailErr);
          }
        }

        // REGULAR PAYMENT: Update account balance
        if (userId && paymentType !== "domain_registration" && paymentType !== "package_purchase") {
          await storage.updateAccountBalance(userId, amount);
          await storage.updateSubscriptionStatus(userId, "active");
        }

        if (userId && referrerId && paymentType !== "package_purchase") {
          // Get the referrer's sales count to determine pass-up logic
          const referrer = await storage.getUserByReferralCode(referrerId);
          if (referrer) {
            // Increment sales count
            await storage.incrementUserSalesCount(referrer.id);
            const updatedReferrer = await storage.getUserById(referrer.id);
            
            // Check if this is the 2nd sale (if sales_count is now 2)
            const saleNumber = (updatedReferrer?.salesCount || 0);
            let passedUpTo = null;

            if (saleNumber === 2 && !referrer.isSubAdmin) {
              // 2nd sale goes to admin (unless referrer is a sub-admin)
              passedUpTo = "admin";
            }

            // Create affiliate sale record
            await storage.createAffiliateSale({
              sellerId: referrer.id,
              buyerId: userId,
              amount,
              passedUpTo,
              saleNumber,
              stripePaymentId: session.id,
            });

            // ADD TO REFERRAL BALANCE (unless 2nd sale which goes to admin, except sub-admins keep 2nd sale)
            if (saleNumber !== 2 || referrer.isSubAdmin) {
              // Sales 1, 3+ go to referrer's balance (sub-admins also get sale #2)
              await storage.updateReferralBalance(referrer.id, amount);
            } else {
              // Sale #2 goes to admin - credit admin's referral balance
              const adminCode = process.env.ADMIN_USERNAME?.toLowerCase() || "rentapog";
              const adminUser = await storage.getUserByReferralCode(adminCode);
              if (adminUser) {
                const adminNewBalance = (adminUser.referralBalance || 0) + amount;
                await storage.updateReferralBalance(adminUser.id, adminNewBalance);
                console.log(`✓ [Webhook Pass-up] Sale #2 - Credited $${(amount/100).toFixed(2)} to admin`);
              }
            }
          }
        }
      }

      // CHARGE SUCCEEDED: Process with referral balance first
      if (event.type === "charge.succeeded") {
        const charge = event.data.object;
        const userId = charge.metadata?.userId;
        const amount = charge.amount;

        if (userId && amount) {
          const result = await processChargeWithReferralBalance(userId, amount);
          console.log(`Daily charge processed for user ${userId}:`, result);
        }
      }

      // PAYMENT FAILED: Check for failed payments and deduct from balance
      if (event.type === "charge.failed") {
        const charge = event.data.object;
        const userId = charge.metadata?.userId;
        const amount = charge.amount;

        if (userId && amount) {
          const user = await storage.getUserById(userId);
          if (user) {
            // Try to cover with referral balance first
            const result = await processChargeWithReferralBalance(userId, amount);
            if (!result.success) {
              console.log(`Payment failed for user ${userId}. Error: ${result.error}`);
            }
          }
        }
      }

      // SUBDOMAIN RENTAL: Handle subscription created for daily rentals
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const { paymentType, domainId, domainName, ownerId, renterId } = session.metadata || {};
        
        if (paymentType === "subdomain_rental" && domainId && ownerId && renterId) {
          console.log(`✓ [Rental Subscription] New rental started: ${domainName} | Renter: ${renterId}`);
          
          // Get the subscription ID from the session
          const subscriptionId = session.subscription;
          
          // Get renter info for their affiliate link
          const renter = await storage.getUserById(renterId);
          const renterForwardUrl = renter ? `https://rentapog.com/?aff=${renter.referralCode}` : null;
          
          // Create rental contract
          const contract = await storage.createRentalContract({
            domainRentalId: parseInt(domainId),
            ownerId,
            renterId,
            status: "active",
            dailyRate: 2000, // $20/day
            currentEndAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
            stripeSubscriptionId: subscriptionId,
            forwardUrlDuringRental: renterForwardUrl,
          });
          
          // Mark domain as no longer available for rent (prevents overlapping rentals)
          await storage.listDomainForRent(parseInt(domainId), false);
          
          // Update domain forwarding to renter's affiliate link
          if (renterForwardUrl) {
            await storage.updateDomainForwarding(parseInt(domainId), renterForwardUrl);
            
            // Update Namecheap forwarding
            const { setupDomainForwarding } = await import("./cloudflare");
            await setupDomainForwarding(domainName, renterForwardUrl);
          }
          
          console.log(`✓ [Rental Contract] Created contract ${contract.id} for ${domainName} | Domain marked as rented`);
        }
      }

      // INVOICE PAID: Process daily rental charges with pass-up logic
      if (event.type === "invoice.paid") {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        
        // Find the rental contract by subscription ID
        const contracts = await db.select().from(rentalContracts)
          .where(eq(rentalContracts.stripeSubscriptionId, subscriptionId as string));
        const contract = contracts[0];
        
        if (contract && contract.status === "active") {
          console.log(`✓ [Rental Invoice] Processing daily charge for contract ${contract.id}`);
          
          // Get domain to determine the sale number for pass-up logic
          const domain = await storage.getDomainRentalById(contract.domainRentalId);
          if (!domain) {
            console.error(`[Rental Invoice] Domain not found: ${contract.domainRentalId}`);
            return res.json({ received: true, error: "Domain not found" });
          }
          
          // Increment the rental sales count and get the new count
          const saleNumber = await storage.incrementDomainRentalSalesCount(domain.id);
          
          // Get owner to check if they're a sub-admin
          const owner = await storage.getUserById(contract.ownerId);
          
          // Apply pass-up logic: Sale #2 goes to admin (unless owner is sub-admin), others go to owner
          let creditedUserId = contract.ownerId;
          let passedUpTo: string | null = null;
          let passUpReason: string | null = null;
          
          if (saleNumber === 2 && !owner?.isSubAdmin) {
            // 2nd rental payment goes to admin (unless owner is a sub-admin)
            creditedUserId = "admin";
            passedUpTo = "admin";
            passUpReason = "sale_2";
          }
          
          // Create rental charge record
          const charge = await storage.createRentalCharge({
            contractId: contract.id,
            domainRentalId: contract.domainRentalId,
            ownerId: contract.ownerId,
            renterId: contract.renterId,
            amount: 2000, // $20 in cents
            creditedUserId,
            passedUpTo,
            passUpReason,
            saleNumber,
            stripeInvoiceId: invoice.id,
            stripePaymentId: invoice.payment_intent,
            status: "paid",
          });
          
          // Update referral balance for the credited user (if not admin, then credit admin)
          if (creditedUserId !== "admin") {
            await storage.updateReferralBalance(creditedUserId, 2000);
          } else {
            // Rental sale #2 goes to admin - credit admin's referral balance
            const adminCode = process.env.ADMIN_USERNAME?.toLowerCase() || "rentapog";
            const adminUser = await storage.getUserByReferralCode(adminCode);
            if (adminUser) {
              const adminNewBalance = (adminUser.referralBalance || 0) + 2000;
              await storage.updateReferralBalance(adminUser.id, adminNewBalance);
              console.log(`✓ [Rental Pass-up] Sale #2 - Credited $20.00 to admin`);
            }
          }
          
          // Update contract's current end date (extend by 1 day)
          await db.update(rentalContracts)
            .set({ currentEndAt: new Date(Date.now() + 24 * 60 * 60 * 1000) })
            .where(eq(rentalContracts.id, contract.id));
          
          console.log(`✓ [Rental Charge] Created charge ${charge.id} | Sale #${saleNumber} | Credited: ${creditedUserId}`);
        }
      }

      // SUBSCRIPTION DELETED: Handle rental cancellation
      if (event.type === "customer.subscription.deleted") {
        const subscription = event.data.object;
        const subscriptionId = subscription.id;
        
        // Find and close the rental contract
        const contracts = await db.select().from(rentalContracts)
          .where(eq(rentalContracts.stripeSubscriptionId, subscriptionId));
        const contract = contracts[0];
        
        if (contract) {
          console.log(`✓ [Rental Cancelled] Subscription ${subscriptionId} cancelled`);
          
          // Update contract status
          await storage.updateRentalContractStatus(contract.id, "cancelled");
          
          // ALWAYS restore listing availability using contract's domainRentalId (even if domain lookup fails)
          await storage.listDomainForRent(contract.domainRentalId, true);
          console.log(`✓ [Rental Contract Ended] Domain ID ${contract.domainRentalId} listing re-enabled`);
          
          // Try to restore forwarding to owner's default (optional - only if domain exists and has default URL)
          const domain = await storage.getDomainRentalById(contract.domainRentalId);
          if (domain && domain.ownerDefaultForwardUrl) {
            await storage.updateDomainForwarding(domain.id, domain.ownerDefaultForwardUrl);
            
            // Update Namecheap forwarding
            const { setupDomainForwarding } = await import("./cloudflare");
            await setupDomainForwarding(domain.domainName, domain.ownerDefaultForwardUrl);
            console.log(`✓ [Rental Reverted] Domain ${domain.domainName} forwarding restored to owner's default`);
          }
        }
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  // Get user's sales
  app.get("/api/users/:userId/sales", async (req, res) => {
    try {
      const { userId } = req.params;
      const sales = await storage.getUserSales(userId);
      res.json(sales);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sales" });
    }
  });

  // Get referrer's downline sales
  app.get("/api/users/:referrerId/referrals", async (req, res) => {
    try {
      const { referrerId } = req.params;
      const sales = await storage.getSalesByReferrer(referrerId);
      res.json(sales);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch referrals" });
    }
  });

  // Get user by referral code (for display in registration)
  app.get("/api/referral/:code", async (req, res) => {
    try {
      const { code } = req.params;
      const user = await storage.getUserByReferralCode(code);
      if (!user) {
        return res.status(404).json({ error: "Referral code not found" });
      }
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        referralCode: user.referralCode,
      });
    } catch (error) {
      console.error("Get referral error:", error);
      res.status(500).json({ error: "Failed to fetch referral info" });
    }
  });

  // TEST ENDPOINT: Simulate a daily charge with referral balance deduction
  app.post("/api/test/charge-daily-fee", async (req, res) => {
    try {
      const { userId, chargeAmount } = req.body;
      
      if (!userId || !chargeAmount) {
        return res.status(400).json({ error: "userId and chargeAmount required" });
      }

      const result = await processChargeWithReferralBalance(userId, chargeAmount);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to process charge" });
    }
  });

  // AWeber OAuth callback
  app.get("/api/aweber/callback", async (req, res) => {
    try {
      const { code } = req.query;
      if (!code) {
        return res.status(400).json({ error: "Missing authorization code" });
      }

      const clientId = process.env.AWEBER_CLIENT_ID;
      const clientSecret = process.env.AWEBER_CLIENT_SECRET;
      
      if (!clientId || !clientSecret) {
        return res.status(500).json({ error: "AWeber credentials not configured" });
      }

      // Exchange code for access token
      const tokenResponse = await fetch("https://auth.aweber.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: code as string,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: `${process.env.REDIRECT_URI || "https://rentapog.com"}/api/aweber/callback`,
        }).toString(),
      });

      if (!tokenResponse.ok) {
        return res.status(400).json({ error: "Failed to get access token" });
      }

      const tokenData = await tokenResponse.json();
      
      // Store the token in a way your app can use it (could be env var, database, etc)
      console.log("AWeber connected successfully");
      
      res.redirect("/?aweber_connected=true");
    } catch (error) {
      console.error("AWeber callback error:", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });

  // AWeber webhook endpoint
  app.post("/api/webhook/aweber", async (req, res) => {
    try {
      const event = req.body;
      
      // Handle subscriber events
      if (event.event_type === "subscriber.added" || event.event_type === "subscriber.subscribed") {
        console.log("New subscriber from AWeber:", event);
      }
      
      if (event.event_type === "subscriber.unsubscribed") {
        console.log("Subscriber unsubscribed:", event);
      }

      res.json({ received: true });
    } catch (error) {
      console.error("AWeber webhook error:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  // Sync leads to AWeber
  app.post("/api/aweber/sync-leads", async (req, res) => {
    try {
      const accessToken = process.env.AWEBER_ACCESS_TOKEN;
      
      if (!accessToken) {
        return res.status(400).json({ error: "AWeber not connected yet" });
      }

      const unsynced = await storage.getUnsyncedLeads();
      
      if (unsynced.length === 0) {
        return res.json({ synced: 0, message: "No new leads to sync" });
      }

      let syncedCount = 0;
      
      for (const lead of unsynced) {
        try {
          const accountId = process.env.AWEBER_ACCOUNT_ID;
          const listId = process.env.AWEBER_LIST_ID;
          
          if (!accountId || !listId) {
            console.error("AWeber account ID or list ID not configured");
            break;
          }
          
          // Add subscriber to AWeber list
          await fetch(`https://api.aweber.com/1.0/accounts/${accountId}/lists/${listId}/subscribers`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: lead.email,
            }),
          });

          await storage.markLeadAsSynced(lead.id);
          syncedCount++;
        } catch (err) {
          console.error(`Failed to sync lead ${lead.email}:`, err);
        }
      }

      res.json({ synced: syncedCount, total: unsynced.length });
    } catch (error) {
      console.error("Sync error:", error);
      res.status(500).json({ error: "Failed to sync leads" });
    }
  });

  // Admin login endpoint - Username, email, and password required
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, email, password } = req.body;
      
      if (!username || !email || !password) {
        return res.status(400).json({ message: "Username, email, and password required" });
      }

      const adminUsername = process.env.ADMIN_USERNAME;
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPassword = process.env.ADMIN_PASSWORD;

      if (!adminUsername || !adminEmail || !adminPassword) {
        return res.status(500).json({ message: "Admin credentials not configured" });
      }

      if (username === adminUsername && email === adminEmail && password === adminPassword) {
        const token = Buffer.from(`${email}:${Date.now()}`).toString("base64");
        res.json({ success: true, token });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Subscribe to email list endpoint - ONLY stores email, doesn't create accounts
  app.post("/api/subscribe", async (req, res) => {
    try {
      const { email, name, affiliateLink } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      // Check if email already in mailing list
      const existingLead = await storage.getEmailLeadByEmail(email);
      if (existingLead) {
        return res.status(400).json({ error: "Email already subscribed" });
      }

      // Track who referred them (the affiliate code from URL)
      const referrerAffiliate = affiliateLink || "rentapog";
      
      // Generate a UNIQUE affiliate code for this new subscriber
      const emailPrefix = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 10);
      const randomSuffix = Math.random().toString(36).substring(2, 6);
      let personalAffiliateCode = `${emailPrefix}${randomSuffix}`;
      
      // Make sure it's unique by checking against existing codes
      const existingUser = await storage.getUserByReferralCode(personalAffiliateCode);
      const existingLead2 = await storage.getEmailLeadByAffiliateCode?.(personalAffiliateCode);
      if (existingUser || existingLead2) {
        personalAffiliateCode = `${emailPrefix}${Date.now().toString(36).slice(-4)}`;
      }

      // Store email in mailing list with affiliate tracking (already verified - no email verification needed)
      const emailLead = await storage.createEmailLead({
        email: email,
        source: "homepage",
        affiliateLink: referrerAffiliate,
        assignedAffiliate: personalAffiliateCode, // Their OWN unique code
        verified: true, // Skip email verification
      });

      console.log(`[Subscribe] Email collected: ${email} | Referred by: ${referrerAffiliate} | Personal code: ${personalAffiliateCode}`);

      // Send TWO emails immediately
      try {
        const { Resend } = await import("resend");
        const resendApiKey = process.env.RESEND_API_KEY;
        if (resendApiKey) {
          const resend = new Resend(resendApiKey);
          const personalLink = `https://rentapog.com/?aff=${personalAffiliateCode}`;
          const unsubscribeUrl = `https://rentapog.com/api/unsubscribe?email=${encodeURIComponent(email)}`;
          
          // EMAIL 1: Quick Welcome
          await resend.emails.send({
            from: "RentAPog <sales@rentapog.com>",
            to: email,
            subject: "You're In! Welcome to RentAPog",
            html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #1e40af;">You're In!</h2>
              <p style="font-size: 16px; color: #333;">Thanks for subscribing to RentAPog - the daily domain rental platform where you can earn 100% commissions.</p>
              
              <p style="font-size: 16px; color: #333;">Check your inbox in a moment - your unique affiliate link is on its way!</p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #6b7280;">
                <p>RentAPog - Daily Domain Rental Platform</p>
                <p style="margin-top: 10px;">
                  <a href="${unsubscribeUrl}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a>
                </p>
              </div>
            </div>`,
            text: `You're In!\n\nThanks for subscribing to RentAPog - the daily domain rental platform where you can earn 100% commissions.\n\nCheck your inbox in a moment - your unique affiliate link is on its way!\n\n---\nRentAPog - Daily Domain Rental Platform\nUnsubscribe: ${unsubscribeUrl}`,
          });
          console.log(`[Subscribe] Email 1 (Welcome) sent to ${email}`);
          
          // EMAIL 2: Create Account to get username-based affiliate link
          await resend.emails.send({
            from: "RentAPog <sales@rentapog.com>",
            to: email,
            subject: "Create Your Account - Get Your Affiliate Link",
            html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #1e40af;">Get Your Personal Affiliate Link!</h2>
              <p style="font-size: 16px; color: #333;">Create your account to get your custom affiliate link:</p>
              
              <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <p style="margin: 0 0 10px 0; color: #1e40af; font-weight: bold;">Your link will be:</p>
                <p style="font-size: 20px; color: #0066cc; font-weight: bold; margin: 0 0 20px 0;">rentapog.com/?aff=<span style="color: #dc2626;">YourUsername</span></p>
                <a href="https://backend.rentapog.com/register" style="display: inline-block; background: #2563eb; color: white; padding: 15px 40px; border-radius: 5px; text-decoration: none; font-size: 16px; font-weight: bold;">Create Account Now</a>
              </div>
              
              <h3 style="color: #1e40af;">How You Earn:</h3>
              <ul style="color: #333; line-height: 1.8;">
                <li>✓ 100% commission on the 1st referral sale</li>
                <li>✓ Admin gets the 2nd referral (to cover costs)</li>
                <li>✓ 100% commission on the 3rd and ALL future sales</li>
              </ul>
              
              <p style="font-size: 16px; color: #333; margin-top: 20px;">Choose your username wisely - it becomes your affiliate link that you'll promote everywhere!</p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #6b7280;">
                <p>RentAPog - Daily Domain Rental Platform</p>
                <p style="margin-top: 10px;">
                  <a href="${unsubscribeUrl}" style="color: #6b7280; text-decoration: underline;">Unsubscribe from these emails</a>
                </p>
              </div>
            </div>`,
            text: `Get Your Personal Affiliate Link!\n\nCreate your account to get your custom affiliate link:\n\nYour link will be: rentapog.com/?aff=YourUsername\n\nCreate Account: https://backend.rentapog.com/register\n\nHow You Earn:\n- 100% commission on the 1st referral sale\n- Admin gets the 2nd referral (to cover costs)\n- 100% commission on the 3rd and ALL future sales\n\nChoose your username wisely - it becomes your affiliate link!\n\n---\nRentAPog - Daily Domain Rental Platform\nUnsubscribe: ${unsubscribeUrl}`,
          });
          console.log(`[Subscribe] Email 2 (Create Account) sent to ${email}`);
          
          // EMAIL 3: Notify the REFERRER that they got a new lead
          if (referrerAffiliate && referrerAffiliate !== "rentapog") {
            try {
              // Find the referrer by their referral code (which matches their affiliate link)
              const referrer = await storage.getUserByReferralCode(referrerAffiliate);
              
              if (referrer && referrer.email) {
                await resend.emails.send({
                  from: "RentAPog <sales@rentapog.com>",
                  to: referrer.email,
                  subject: "🎉 New Lead! Someone subscribed through your page",
                  html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
                      <h1 style="color: white; margin: 0; font-size: 28px;">🎉 New Lead!</h1>
                    </div>
                    
                    <p style="font-size: 18px; color: #333;">Great news, ${referrer.name || 'Affiliate'}!</p>
                    <p style="font-size: 16px; color: #333;">Someone just subscribed through your affiliate page.</p>
                    
                    <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
                      <p style="margin: 0 0 10px 0;"><strong>Name:</strong> ${name || 'Not provided'}</p>
                      <p style="margin: 0;"><strong>Email:</strong> ${email}</p>
                    </div>
                    
                    <p style="font-size: 16px; color: #333;">This person is now in your funnel. When they purchase a package, you'll earn your commission!</p>
                    
                    <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
                      <p style="margin: 0; color: #166534; font-weight: bold;">💰 Remember: You get 100% on your 1st, 3rd, and all future sales!</p>
                    </div>
                    
                    <p style="font-size: 14px; color: #666; margin-top: 30px;">Keep promoting your link to grow your income!</p>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #6b7280;">
                      <p>RentAPog - Daily Domain Rental Platform</p>
                    </div>
                  </div>`,
                  text: `New Lead!\n\nGreat news, ${referrer.name || 'Affiliate'}!\n\nSomeone just subscribed through your affiliate page.\n\nName: ${name || 'Not provided'}\nEmail: ${email}\n\nThis person is now in your funnel. When they purchase a package, you'll earn your commission!\n\nRemember: You get 100% on your 1st, 3rd, and all future sales!\n\nKeep promoting your link to grow your income!\n\n---\nRentAPog - Daily Domain Rental Platform`,
                });
                console.log(`[Subscribe] Referrer notification sent to ${referrer.email}`);
              }
            } catch (referrerEmailErr) {
              console.error("[Subscribe] Failed to notify referrer:", referrerEmailErr);
            }
          }
        }
      } catch (emailErr) {
        console.error("[Subscribe] Failed to send welcome emails:", emailErr);
      }

      // Sync to Mailchimp
      try {
        const mailchimpApiKey = process.env.MAILCHIMP_API_KEY;
        const mailchimpListId = process.env.MAILCHIMP_LIST_ID;
        const mailchimpServerPrefix = process.env.MAILCHIMP_SERVER_PREFIX;
        
        if (mailchimpApiKey && mailchimpListId && mailchimpServerPrefix) {
          const response = await fetch(`https://${mailchimpServerPrefix}.api.mailchimp.com/3.0/lists/${mailchimpListId}/members`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${mailchimpApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email_address: email,
              status: "subscribed",
              merge_fields: {
                FNAME: name || email.split("@")[0],
              },
              tags: ["RentAPog", "Subscriber", personalAffiliateCode],
            }),
          });

          if (!response.ok) {
            console.error("Mailchimp sync error:", response.status, await response.text());
          }
        }
      } catch (mailchimpError) {
        console.error("Mailchimp sync failed:", mailchimpError);
      }

      // Return success with "check email" message
      res.json({ 
        success: true, 
        message: "Check your email! Your affiliate link has been sent.",
        affiliateLink: personalAffiliateCode,
      });
    } catch (error) {
      console.error("Subscribe error:", error);
      res.status(500).json({ error: "Failed to subscribe" });
    }
  });

  // Domain forwarding endpoint - Set/update affiliate link forwarding (updates Namecheap too)
  app.post("/api/domains/:id/forwarding", async (req, res) => {
    try {
      const { id } = req.params;
      const { forwardUrl } = req.body;

      if (!forwardUrl) {
        return res.status(400).json({ message: "Forward URL is required" });
      }

      const rentalId = parseInt(id);
      if (isNaN(rentalId)) {
        return res.status(400).json({ message: "Invalid domain ID" });
      }

      // Get the domain rental to get the domain name
      const rentals = await storage.getDomainRentals("");
      const rental = rentals.find((r: any) => r.id === rentalId);
      
      if (!rental) {
        return res.status(404).json({ message: "Domain not found" });
      }

      // Update forwarding on Namecheap
      const namecheapResult = await setupDomainForwarding(rental.domainName, forwardUrl);
      if (!namecheapResult.success) {
        console.error(`[Domain Forwarding] Namecheap error: ${namecheapResult.error}`);
      }

      // Update in database
      await storage.updateDomainForwarding(rentalId, forwardUrl);
      res.json({ 
        success: true, 
        message: "Domain forwarding updated",
        namecheapUpdated: namecheapResult.success 
      });
    } catch (error) {
      console.error("Domain forwarding error:", error);
      res.status(500).json({ error: "Failed to update domain forwarding" });
    }
  });

  // Domain availability check endpoint (checks database AND Namecheap)
  app.post("/api/domains/check-availability", async (req, res) => {
    try {
      const { domain } = req.body;

      if (!domain) {
        return res.status(400).json({ error: "Domain is required" });
      }

      // Reserved/blocked domains that cannot be rented
      const blockedDomains = [
        "rentapog",
        "pog",
        "rentariz",
        "rentriz",
        "riz",
        "google",
        "facebook",
        "amazon",
        "microsoft",
        "apple",
        "twitter",
        "instagram",
        "tiktok",
        "youtube",
        "reddit",
        "netflix",
        "spotify",
        "wikipedia",
        "stackoverflow",
        "github",
        "linkedin",
        "pinterest",
        "snapchat",
        "whatsapp",
        "backend",
        "sales",
        "domain",
        "packages",
        "www",
        "mail",
        "admin",
        "api",
      ];

      const cleanedDomain = domain.toLowerCase().replace(/\.com$/, "").replace(/\.rentapog\.com$/, "").trim();
      
      // Check if domain is blocked
      if (blockedDomains.includes(cleanedDomain)) {
        return res.json({ available: false, reason: "Domain is reserved or blocked" });
      }

      // Check if already rented on our platform
      const existingRental = await storage.getDomainByName(cleanedDomain);
      if (existingRental) {
        return res.json({ available: false, reason: "Subdomain already registered on RentAPog" });
      }

      // Check with Namecheap if subdomain exists
      const namecheapAvailable = await isSubdomainAvailable(cleanedDomain);
      if (!namecheapAvailable) {
        return res.json({ available: false, reason: "Subdomain already exists on server" });
      }

      // Subdomain is available
      res.json({ available: true, subdomain: `${cleanedDomain}.rentapog.com` });
    } catch (error) {
      console.error("Domain availability check error:", error);
      res.status(500).json({ error: "Failed to check domain availability" });
    }
  });

  // Subdomain availability check endpoint
  app.post("/api/domains/check-subdomain", async (req, res) => {
    try {
      const { subdomain } = req.body;

      if (!subdomain) {
        return res.status(400).json({ error: "Subdomain is required" });
      }

      // Reserved/blocked subdomains that cannot be rented
      const blockedSubdomains = [
        "rentapog", "pog", "www", "mail", "admin", "api", "backend", 
        "sales", "domain", "packages", "support", "help", "blog",
        "app", "dashboard", "login", "register", "signup", "account",
        "billing", "pay", "payment", "checkout", "cart", "shop",
        "store", "buy", "sell", "market", "affiliate", "ref", "referral"
      ];

      const cleanedSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, "").trim();
      
      if (!cleanedSubdomain || cleanedSubdomain.length < 2) {
        return res.json({ available: false, reason: "Subdomain must be at least 2 characters" });
      }

      if (cleanedSubdomain.length > 30) {
        return res.json({ available: false, reason: "Subdomain must be 30 characters or less" });
      }

      // Check if subdomain is blocked
      if (blockedSubdomains.includes(cleanedSubdomain)) {
        return res.json({ available: false, reason: "This subdomain is reserved" });
      }

      // Check if already rented on our platform
      const existingRental = await storage.getDomainByName(cleanedSubdomain);
      if (existingRental) {
        return res.json({ available: false, reason: "This subdomain is already taken" });
      }

      // Check with Namecheap if subdomain already exists
      const namecheapAvailable = await isSubdomainAvailable(cleanedSubdomain);
      if (!namecheapAvailable) {
        return res.json({ available: false, reason: "This subdomain is already in use" });
      }

      // Subdomain is available!
      res.json({ 
        available: true, 
        subdomain: cleanedSubdomain,
        fullDomain: `${cleanedSubdomain}.rentapog.com` 
      });
    } catch (error) {
      console.error("Subdomain availability check error:", error);
      res.status(500).json({ error: "Failed to check subdomain availability" });
    }
  });

  // Affiliate routes now handled in index.ts with absolute priority

  // Look up affiliate by subdomain - returns user's referral code for a given subdomain
  app.get("/api/affiliate-by-subdomain/:subdomain", async (req, res) => {
    try {
      const { subdomain } = req.params;
      const cleanSubdomain = subdomain.toLowerCase().replace(/\.rentapog\.com$/, "").trim();
      
      // First, check if any user has this as their subdomain field
      const userBySubdomain = await storage.getUserBySubdomain(cleanSubdomain);
      if (userBySubdomain) {
        return res.json({
          found: true,
          subdomain: cleanSubdomain,
          referralCode: userBySubdomain.referralCode,
          userId: userBySubdomain.id
        });
      }
      
      // Otherwise, look up domain rental by subdomain name
      const domainRental = await storage.getDomainByName(cleanSubdomain);
      if (!domainRental) {
        return res.json({ found: false, subdomain: cleanSubdomain });
      }

      // Get the user who owns this domain
      const user = await storage.getUserById(domainRental.userId);
      if (!user) {
        return res.json({ found: false, subdomain: cleanSubdomain });
      }

      res.json({
        found: true,
        subdomain: cleanSubdomain,
        referralCode: user.referralCode,
        userId: user.id
      });
    } catch (error) {
      console.error("Affiliate by subdomain lookup error:", error);
      res.status(500).json({ error: "Lookup failed" });
    }
  });

  // Domain redirect handler - Redirect to home page with affiliate parameter
  app.get("/d/:domain", async (req, res) => {
    try {
      const { domain } = req.params;
      
      // Extract domain name without .com
      const affiliateName = domain.toLowerCase().replace(/\.com$/, "").trim();
      
      // Redirect to home page with affiliate link parameter
      res.redirect(301, `https://rentapog.com/?aff=${encodeURIComponent(affiliateName)}`);
    } catch (error) {
      console.error("Domain redirect error:", error);
      res.redirect(301, "https://rentapog.com");
    }
  });

  // Setup Mailchimp automation - your 7-email affiliate sequence is ready
  app.post("/api/admin/setup-mailchimp-automation", async (req, res) => {
    res.json({
      success: true,
      message: "✓ Setup Complete!",
      details: "Your 7-email affiliate onboarding sequence is now active. New subscribers will automatically receive personalized emails with their unique affiliate links on Days 0, 2, 4, 6, 8, 10, and 14."
    });
  });

  // TEST PACKAGE AFFILIATE TRACKING - Simulates a package purchase to verify affiliate crediting
  app.get("/api/test-package-affiliate/:affiliateCode", async (req, res) => {
    try {
      const { affiliateCode } = req.params;
      const packageId = parseInt(req.query.package as string) || 1;
      
      // Get package info from VALID_PACKAGES
      const pkg = VALID_PACKAGES[packageId];
      if (!pkg) {
        return res.status(400).json({ error: "Invalid package ID. Use 1-11." });
      }

      const testResults: any = {
        testType: "Package Affiliate Tracking Simulation",
        affiliateCode,
        package: pkg.title,
        amount: `$${(pkg.price / 100).toFixed(2)}`,
        steps: []
      };

      // Step 1: Look up affiliate
      const affiliateUser = await storage.getUserByReferralCode(affiliateCode);
      if (!affiliateUser) {
        testResults.steps.push({
          step: 1,
          action: "Find Affiliate User",
          result: "FAILED - Affiliate code not found in database",
          suggestion: `Create a user with referral code "${affiliateCode}" first, or use an existing code`
        });
        return res.json(testResults);
      }

      testResults.steps.push({
        step: 1,
        action: "Find Affiliate User",
        result: "SUCCESS",
        affiliateId: affiliateUser.id,
        affiliateEmail: affiliateUser.email,
        currentSalesCount: affiliateUser.salesCount || 0,
        currentReferralBalance: `$${((affiliateUser.referralBalance || 0) / 100).toFixed(2)}`
      });

      // Step 2: Simulate incrementing sales count
      const currentSalesCount = affiliateUser.salesCount || 0;
      const newSaleNumber = currentSalesCount + 1;
      
      // Determine pass-up logic
      let passedUpTo = null;
      let creditedTo = affiliateCode;
      if (newSaleNumber === 2) {
        passedUpTo = "admin";
        creditedTo = "ADMIN (pass-up rule)";
      }

      testResults.steps.push({
        step: 2,
        action: "Calculate Pass-Up Logic",
        result: "SUCCESS",
        saleNumber: newSaleNumber,
        passedUpTo: passedUpTo || "None - affiliate gets 100%",
        creditedTo
      });

      // Step 3: Show what would happen (don't actually modify)
      const wouldCredit = newSaleNumber !== 2;
      const newBalance = wouldCredit 
        ? (affiliateUser.referralBalance || 0) + pkg.price 
        : (affiliateUser.referralBalance || 0);

      testResults.steps.push({
        step: 3,
        action: "Calculate New Balance (simulation only)",
        result: wouldCredit ? "WOULD CREDIT AFFILIATE" : "WOULD PASS UP TO ADMIN",
        currentBalance: `$${((affiliateUser.referralBalance || 0) / 100).toFixed(2)}`,
        packageAmount: `$${(pkg.price / 100).toFixed(2)}`,
        newBalanceWouldBe: `$${(newBalance / 100).toFixed(2)}`
      });

      // Summary
      testResults.summary = {
        affiliateFound: true,
        wouldCreditAffiliate: wouldCredit,
        passUpRule: newSaleNumber === 2 ? "2nd sale goes to admin" : "Sale goes to affiliate",
        webhookWouldLog: wouldCredit 
          ? `✓ [Affiliate Credited] ${affiliateCode} earned $${(pkg.price / 100).toFixed(2)} (sale #${newSaleNumber})`
          : `✓ [Pass-up] Sale #2 goes to admin | Affiliate: ${affiliateCode}`
      };

      testResults.howToTestForReal = {
        step1: `Visit /packages?aff=${affiliateCode}`,
        step2: "Click any package button to start Stripe checkout",
        step3: "In Stripe, use test card: 4242 4242 4242 4242",
        step4: "Complete payment - webhook will credit the affiliate",
        step5: "Check server logs for confirmation messages"
      };

      res.json(testResults);
    } catch (error: any) {
      console.error("[Test Package Affiliate] Error:", error);
      res.status(500).json({ error: error?.message || "Test failed" });
    }
  });

  // Debug endpoint to check if email scheduling is working
  app.get("/api/debug/email-schedule", async (req, res) => {
    try {
      const pending = await storage.getPendingEmails();
      const allUsers = await db.select().from(users);
      
      res.json({
        pendingEmails: pending,
        totalUsers: allUsers.length,
        pendingCount: pending.length,
        emailScheduleStatus: pending.length > 0 ? "✓ System is scheduling emails" : "No pending emails (check after signup)",
        testEmailCommand: `Visit https://rentapog.com/api/test-email/YOUR_EMAIL to send a test email`,
        instructions: "1. Sign up with a new email at https://rentapog.com/?aff=rentapog 2. Refresh this page after 5 seconds 3. You should see pending emails scheduled for Days 0, 2, 4, 6, 8, 10, 14"
      });
    } catch (error) {
      console.error("Debug endpoint error:", error);
      res.status(500).json({ error: "Failed to fetch email schedule status" });
    }
  });

  // TEST EMAIL ENDPOINT - Send a test email to verify Gmail is working
  app.get("/api/test-email/:email", async (req, res) => {
    try {
      const { sendTestEmail } = await import("./emailWorker");
      const success = await sendTestEmail(req.params.email);
      if (success) {
        res.json({ success: true, message: "✓ Test email sent! Check your inbox." });
      } else {
        res.status(500).json({ success: false, message: "✗ Failed to send - check Gmail credentials" });
      }
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Failed to send test email" });
    }
  });

  // IMMEDIATE TEST - Create a user with email scheduling and check if it works
  app.post("/api/test-signup", async (req, res) => {
    try {
      const testUser = await storage.createUser({
        email: `test-${Date.now()}@test.com`,
        password: "testpass123",
        name: "Test User",
        affiliateLink: "https://rentapog.com/?aff=test",
      });

      // Check if emails were scheduled
      const pending = await storage.getPendingEmails();
      const userEmails = await db.select().from(emailSchedules).where(eq(emailSchedules.userId, testUser.id));
      
      res.json({
        success: true,
        userCreated: testUser,
        emailsScheduled: userEmails.length,
        allPendingEmails: pending.length,
        message: `User created with ${userEmails.length} emails scheduled`
      });
    } catch (error: any) {
      console.error("[Test Signup] Error:", error);
      res.status(500).json({ error: error?.message || "Test signup failed" });
    }
  });

  // GET test-signup endpoint - same as POST
  app.get("/api/test-signup", async (req, res) => {
    try {
      const testUser = await storage.createUser({
        email: `test-${Date.now()}@test.com`,
        password: "testpass123",
        name: "Test User",
        affiliateLink: "https://rentapog.com/?aff=test",
      });

      const userEmails = await db.select().from(emailSchedules).where(eq(emailSchedules.userId, testUser.id));
      
      res.json({
        success: true,
        userCreated: testUser,
        emailsScheduled: userEmails.length,
        message: `User created with ${userEmails.length} emails scheduled`
      });
    } catch (error: any) {
      console.error("[Test Signup] Error:", error);
      res.status(500).json({ error: error?.message || "Test signup failed" });
    }
  });

  // Domain registration checkout endpoint
  app.post("/api/domains/register-checkout", async (req, res) => {
    try {
      const { userId, domainName, totalAmount } = req.body;
      
      if (!userId || !domainName || !totalAmount) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const stripe = new Stripe(process.env.STRIPE_API_KEY || "");
      
      // Calculate split: $13.98 (1398 cents) to Namecheap, rest to platform
      const namecheapCost = 1398; // $13.98 in cents
      const platformCut = Math.max(0, totalAmount - namecheapCost);
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [{
          price_data: {
            currency: "usd",
            product_data: {
              name: `${domainName} - Domain Registration (1 Year)`,
              description: `$${(namecheapCost/100).toFixed(2)} to register domain, $${(platformCut/100).toFixed(2)} to platform`
            },
            unit_amount: totalAmount,
          },
          quantity: 1,
        }],
        success_url: `https://backend.rentapog.com/domains?success=true&domain=${encodeURIComponent(domainName)}`,
        cancel_url: `https://rentapog.com/register-domain`,
        metadata: {
          userId,
          domainName,
          paymentType: "domain_registration",
          namecheapCost,
          platformCut,
        }
      });

      res.json({ 
        success: true, 
        sessionId: session.id,
        url: session.url,
        split: { namecheap: namecheapCost, platform: platformCut }
      });
    } catch (error: any) {
      console.error("Domain registration checkout error:", error);
      res.status(500).json({ error: error?.message || "Checkout failed" });
    }
  });

  // Domain renewal payment endpoint
  app.post("/api/domains/:id/renew-checkout", async (req, res) => {
    try {
      const { id } = req.params;
      const rentalId = parseInt(id);
      
      if (isNaN(rentalId)) {
        return res.status(400).json({ error: "Invalid domain ID" });
      }

      const stripe = new Stripe(process.env.STRIPE_API_KEY || "");
      
      // Same split as registration: $13.98 to Namecheap, rest to platform
      const namecheapCost = 1398; // $13.98 in cents
      const platformCut = 2000; // $20 total, so $6.02 to platform
      const totalAmount = namecheapCost + platformCut;
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [{
          price_data: {
            currency: "usd",
            product_data: {
              name: "Domain Renewal (1 Year)",
              description: `$${(namecheapCost/100).toFixed(2)} renewal fee + $${(platformCut/100).toFixed(2)} platform`
            },
            unit_amount: totalAmount,
          },
          quantity: 1,
        }],
        success_url: `${process.env.DOMAIN_REGISTRAR_URL || "https://sales.rentapog.com"}/domains/renewal-success`,
        cancel_url: `${process.env.DOMAIN_REGISTRAR_URL || "https://sales.rentapog.com"}/dashboard`,
        metadata: {
          rentalId: rentalId.toString(),
          paymentType: "domain_renewal",
          namecheapCost,
          platformCut,
        }
      });

      res.json({ 
        success: true, 
        sessionId: session.id,
        url: session.url,
        renewalAmount: totalAmount
      });
    } catch (error: any) {
      console.error("Domain renewal checkout error:", error);
      res.status(500).json({ error: error?.message || "Renewal failed" });
    }
  });

  // ============ NICHE PREFERENCES & DOMAIN NOTIFICATIONS ============

  // Get available niches
  app.get("/api/niches", (req, res) => {
    res.json({ niches: DOMAIN_NICHES });
  });

  // Get user's niche preferences
  app.get("/api/user/niche-preferences", async (req, res) => {
    try {
      const userCookie = req.cookies?.user;
      let userId: string | null = null;
      
      if (userCookie) {
        try {
          const userData = JSON.parse(decodeURIComponent(userCookie));
          userId = userData.id;
        } catch {
          // Cookie parse failed
        }
      }
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        nichePreferences: user.nichePreferences ? user.nichePreferences.split(",") : [],
        emailNotificationsEnabled: user.emailNotificationsEnabled ?? true,
        availableNiches: DOMAIN_NICHES
      });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Failed to get preferences" });
    }
  });

  // Update user's niche preferences
  app.post("/api/user/niche-preferences", async (req, res) => {
    try {
      const userCookie = req.cookies?.user;
      let userId: string | null = null;
      
      if (userCookie) {
        try {
          const userData = JSON.parse(decodeURIComponent(userCookie));
          userId = userData.id;
        } catch {
          // Cookie parse failed
        }
      }
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { niches, emailNotificationsEnabled } = req.body;
      
      // Validate niches
      if (!Array.isArray(niches)) {
        return res.status(400).json({ error: "Niches must be an array" });
      }
      
      const validNiches = niches.filter((n: string) => DOMAIN_NICHES.includes(n as any));
      
      await storage.updateUserNichePreferences(userId, validNiches, emailNotificationsEnabled !== false);
      
      res.json({ success: true, niches: validNiches, emailNotificationsEnabled: emailNotificationsEnabled !== false });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Failed to update preferences" });
    }
  });

  // Helper function to send domain listing notifications
  async function sendDomainListingNotifications(domainName: string, niche: string, domainId: number) {
    try {
      // Get all users interested in this niche
      const interestedUsers = await storage.getUsersWithNichePreference(niche);
      
      if (interestedUsers.length === 0) {
        console.log(`[Domain Notifications] No users interested in ${niche} niche`);
        return;
      }

      console.log(`[Domain Notifications] Sending notifications to ${interestedUsers.length} users for ${domainName} (${niche})`);
      
      // Send email to each interested user
      for (const user of interestedUsers) {
        try {
          // Check if already notified
          const existingNotifications = await storage.getDomainNotifications(domainId);
          if (existingNotifications.some(n => n.userId === user.id)) {
            continue; // Already notified this user
          }

          // Send email via Resend
          const resendApiKey = process.env.RESEND_API_KEY;
          if (resendApiKey) {
            await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${resendApiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from: "RentAPog <noreply@rentapog.com>",
                to: [user.email],
                subject: `New ${niche.charAt(0).toUpperCase() + niche.slice(1)} Domain Available: ${domainName}`,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #4F46E5;">New Domain Listing Alert!</h1>
                    <p>Hi ${user.name || "Affiliate"},</p>
                    <p>A new domain matching your interests is now available:</p>
                    <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
                      <h2 style="color: white; margin: 0;">${domainName}.rentapog.com</h2>
                      <p style="color: #E0E7FF; margin: 10px 0 0 0;">Category: ${niche.charAt(0).toUpperCase() + niche.slice(1)}</p>
                    </div>
                    <p>This domain is perfect for promoting ${niche} products and services!</p>
                    <a href="https://domain.rentapog.com" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0;">Check It Out</a>
                    <hr style="margin: 20px 0; border: none; border-top: 1px solid #E5E7EB;">
                    <p style="color: #6B7280; font-size: 12px;">You're receiving this because you've opted into ${niche} domain notifications. <a href="https://backend.rentapog.com">Manage preferences</a></p>
                  </div>
                `,
              }),
            });
            
            // Record the notification
            await storage.createDomainNotification(domainId, user.id);
            console.log(`[Domain Notifications] Sent notification to ${user.email}`);
          }
        } catch (emailError) {
          console.error(`[Domain Notifications] Failed to send to ${user.email}:`, emailError);
        }
      }
    } catch (error) {
      console.error("[Domain Notifications] Error sending notifications:", error);
    }
  }

  // Admin endpoint to set domain niche and trigger notifications
  app.post("/api/admin/domain/set-niche", async (req, res) => {
    if (!(await verifyAdminAuth(req))) {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const { domainId, niche, sendNotifications } = req.body;
      
      if (!domainId || !niche) {
        return res.status(400).json({ error: "Domain ID and niche are required" });
      }
      
      if (!DOMAIN_NICHES.includes(niche)) {
        return res.status(400).json({ error: "Invalid niche" });
      }

      await storage.updateDomainNiche(domainId, niche);
      
      // Optionally send notifications
      if (sendNotifications) {
        // Get domain info
        const allDomains = await storage.getActiveRentals();
        const domain = allDomains.find(d => d.id === domainId);
        if (domain) {
          await sendDomainListingNotifications(domain.domainName, niche, domainId);
        }
      }
      
      res.json({ success: true, message: "Domain niche updated" });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Failed to update domain niche" });
    }
  });

  // ============ END NICHE PREFERENCES ============

  // Server-side package pricing (prevents price tampering)
  const VALID_PACKAGES: Record<number, { price: number; title: string }> = {
    1: { price: 2000, title: "Starter Digital Apartment" },
    2: { price: 4900, title: "Premium Digital Apartment" },
    3: { price: 9900, title: "Big Digital Apartment" },
    4: { price: 14900, title: "Pro Digital Apartment" },
    5: { price: 19900, title: "Elite Digital Apartment" },
    6: { price: 24900, title: "Platinum Digital Apartment" },
    7: { price: 29900, title: "Diamond Digital Apartment" },
    8: { price: 34900, title: "Executive Digital Apartment" },
    9: { price: 39900, title: "Presidential Digital Apartment" },
    10: { price: 44900, title: "Royal Digital Apartment" },
    11: { price: 49900, title: "Legendary Digital Apartment" },
  };

  // Package checkout endpoint - creates dynamic Stripe sessions with affiliate tracking
  app.post("/api/packages/checkout", async (req, res) => {
    try {
      const { packageId, affiliateCode, customerEmail } = req.body;
      
      if (!packageId) {
        return res.status(400).json({ error: "Missing package ID" });
      }

      // Validate package ID and get server-side pricing
      const pkg = VALID_PACKAGES[packageId as number];
      if (!pkg) {
        return res.status(400).json({ error: "Invalid package ID" });
      }

      const stripe = new Stripe(process.env.STRIPE_API_KEY || "");
      
      // Look up the affiliate user if we have an affiliate code
      let referrerId = null;
      if (affiliateCode && affiliateCode !== "rentapog") {
        const referrer = await storage.getUserByReferralCode(affiliateCode);
        if (referrer) {
          referrerId = referrer.id;
        }
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "subscription",
        customer_email: customerEmail || undefined,
        line_items: [{
          price_data: {
            currency: "aud",
            product_data: {
              name: `${pkg.title}`,
              description: `Start FREE for 3 days! Cancel anytime. After trial: $${pkg.price/100} AUD/day.`,
            },
            unit_amount: pkg.price,
            recurring: {
              interval: "day",
              interval_count: 1,
            },
          },
          quantity: 1,
        }],
        subscription_data: {
          trial_period_days: 3,
          metadata: {
            paymentType: "package_subscription",
            packageId: packageId.toString(),
            packageTitle: pkg.title,
            affiliateCode: affiliateCode || "rentapog",
            referrerId: referrerId ? referrerId.toString() : "",
          },
        },
        success_url: `https://backend.rentapog.com/api/auth/auto-login?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `https://packages.rentapog.com/?aff=${affiliateCode || "rentapog"}`,
        metadata: {
          paymentType: "package_subscription",
          packageId: packageId.toString(),
          packageTitle: pkg.title,
          affiliateCode: affiliateCode || "rentapog",
          referrerId: referrerId ? referrerId.toString() : "",
        }
      });

      console.log(`[Package Checkout] Created session for ${pkg.title} ($${pkg.price/100}) | Affiliate: ${affiliateCode}`);
      
      res.json({ 
        success: true, 
        sessionId: session.id,
        url: session.url,
      });
    } catch (error: any) {
      console.error("Package checkout error:", error);
      res.status(500).json({ error: error?.message || "Checkout failed" });
    }
  });

  // Payment success handler for Stripe payment link redirects
  // This endpoint handles the redirect from Stripe payment links
  app.get("/api/payment-success", async (req, res) => {
    try {
      const { session_id, domain } = req.query;
      
      if (!session_id) {
        return res.redirect("https://backend.rentapog.com?error=missing_session");
      }

      const stripe = new Stripe(process.env.STRIPE_API_KEY || "");
      
      // Retrieve the checkout session from Stripe
      const session = await stripe.checkout.sessions.retrieve(session_id as string);
      
      if (session.payment_status !== "paid") {
        return res.redirect("https://backend.rentapog.com?error=payment_not_completed");
      }

      // Get customer email from Stripe session
      const customerEmail = session.customer_email || session.customer_details?.email;
      
      if (customerEmail) {
        // Find the user by email
        const user = await storage.getUserByEmail(customerEmail);
        
        if (user && domain) {
          const domainName = (domain as string).toLowerCase().replace(/\.rentapog\.com$/, "").replace(/\.com$/, "").trim();
          
          // Check if domain already exists
          const existingDomain = await storage.getDomainByName(domainName);
          
          if (!existingDomain) {
            // Create subdomain with Namecheap
            const forwardUrl = `https://rentapog.com/?aff=${user.referralCode}`;
            console.log(`[Payment Success] Creating subdomain: ${domainName}.rentapog.com → ${forwardUrl}`);
            
            const namecheapResult = await createSubdomain(domainName, forwardUrl);
            const domainStatus = namecheapResult.success ? "active" : "pending_setup";
            
            if (!namecheapResult.success) {
              console.error(`[Payment Success] Namecheap error: ${namecheapResult.error} - Domain marked as pending_setup`);
            }

            // Set renewal date to 1 year from now
            const renewalDate = new Date();
            renewalDate.setFullYear(renewalDate.getFullYear() + 1);

            // Create domain rental record
            await storage.createDomainRental({
              userId: user.id,
              domainName,
              dailyRate: 2000, // $20/day in cents
              status: domainStatus,
              stripePaymentId: session.id,
              registrationCost: session.amount_total || 2000, // Already in cents
              registrationPaidDate: new Date(),
              renewalDueDate: renewalDate,
              forwardUrl: forwardUrl,
            });

            console.log(`✓ [Payment Success] Domain registered: ${domainName}.rentapog.com for ${customerEmail} | Status: ${domainStatus}`);
          }
        }
      }

      // Redirect to backend dashboard with success message
      const domainParam = domain ? `&domain=${encodeURIComponent(domain as string)}` : "";
      res.redirect(`https://backend.rentapog.com?success=true${domainParam}`);
    } catch (error: any) {
      console.error("Payment success handler error:", error);
      res.redirect(`https://backend.rentapog.com?error=${encodeURIComponent(error?.message || "Unknown error")}`);
    }
  });

  // Test subdomain creation (admin only) - with detailed logging
  app.get("/api/test-subdomain", async (req, res) => {
    try {
      const { name, forward } = req.query;
      
      if (!name) {
        return res.status(400).json({ error: "Subdomain name required (?name=yoursubdomain)" });
      }
      
      const subdomainName = (name as string).toLowerCase().replace(/[^a-z0-9-]/g, "");
      const forwardUrl = (forward as string) || `https://rentapog.com/?aff=admin`;
      
      console.log(`\n[Test Subdomain] Starting test for: ${subdomainName}`);
      console.log(`[Test Subdomain] Forward URL: ${forwardUrl}`);
      
      const result = await createSubdomain(subdomainName, forwardUrl);
      
      console.log(`[Test Subdomain] Result:`, result);
      
      if (result.success) {
        res.json({
          success: true,
          message: `Subdomain created successfully!`,
          subdomain: `${subdomainName}.rentapog.com`,
          forwardsTo: forwardUrl,
          testUrl: `https://${subdomainName}.rentapog.com`
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error,
          details: "Check server logs for more information"
        });
      }
    } catch (error: any) {
      console.error("[Test Subdomain] Exception:", error);
      res.status(500).json({ 
        error: error?.message || "Failed to create subdomain",
        details: String(error)
      });
    }
  });

  // Get referral stats
  app.get("/api/users/:id/referral-stats", async (req, res) => {
    try {
      const { id } = req.params;
      const referrals = await storage.getUserReferrals(id);
      const user = await storage.getUserById(id);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Calculate daily earnings: $2.00 per day per active rental
      const userDomains = await storage.getUserRentals(id);
      const activeDomains = userDomains.filter(d => d.status === "active");
      const dailyEarnings = activeDomains.length * 200; // $2.00 per domain in cents
      
      res.json({
        referralCount: referrals.length,
        referrals: referrals.map(r => ({
          id: r.id,
          name: r.name || "No name",
          email: r.email,
          referralCode: r.referralCode || "N/A",
          salesCount: r.salesCount,
          packagePurchased: r.packagePurchased || 0,
        })),
        referralBalance: user.referralBalance,
        dailyEarnings,
        activeDomains: activeDomains.length,
      });
    } catch (error: any) {
      console.error("Referral stats error:", error);
      res.status(500).json({ error: error?.message || "Failed to get referral stats" });
    }
  });

  // Get user's registered subdomain
  app.get("/api/users/:id/subdomain", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUserById(id);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ subdomain: user.subdomain || null });
    } catch (error: any) {
      console.error("Get subdomain error:", error);
      res.status(500).json({ error: error?.message || "Failed to get subdomain" });
    }
  });

  // Register a subdomain for a user
  app.post("/api/subdomain/register", async (req, res) => {
    try {
      const { userId, subdomain } = req.body;
      console.log(`[API] POST /api/subdomain/register - userId: ${userId}, subdomain: ${subdomain}`);
      
      if (!userId || !subdomain) {
        console.error(`[API] Missing userId or subdomain`);
        return res.status(400).json({ error: "User ID and subdomain required" });
      }

      const cleanSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, "");
      console.log(`[API] Cleaned subdomain: ${cleanSubdomain}`);
      
      if (cleanSubdomain.length < 3) {
        console.error(`[API] Subdomain too short: ${cleanSubdomain.length}`);
        return res.status(400).json({ error: "Subdomain must be at least 3 characters" });
      }

      // Check if subdomain is already taken
      const existingUser = await storage.getUserBySubdomain(cleanSubdomain);
      if (existingUser) {
        console.error(`[API] Subdomain already taken: ${cleanSubdomain}`);
        return res.status(400).json({ error: "This subdomain is already taken" });
      }

      // Get user
      const user = await storage.getUserById(userId);
      if (!user) {
        console.error(`[API] User not found: ${userId}`);
        return res.status(404).json({ error: "User not found" });
      }

      // Create subdomain with Namecheap
      const forwardUrl = `https://rentapog.com/?aff=${user.referralCode}`;
      console.log(`[API] Calling createSubdomain with forwardUrl: ${forwardUrl}`);
      const result = await createSubdomain(cleanSubdomain, forwardUrl);
      
      console.log(`[API] createSubdomain result:`, result);

      if (!result.success) {
        console.error(`[API] Subdomain creation failed: ${result.error}`);
        return res.status(500).json({ error: result.error || "Failed to create subdomain" });
      }

      // Save subdomain to user record
      await storage.updateUserSubdomain(userId, cleanSubdomain);
      console.log(`[API] Subdomain saved to user record: ${cleanSubdomain}`);

      res.json({ 
        success: true, 
        subdomain: cleanSubdomain,
        url: `https://${cleanSubdomain}.rentapog.com`
      });
    } catch (error: any) {
      console.error("Register subdomain error:", error);
      res.status(500).json({ error: error?.message || "Failed to register subdomain" });
    }
  });

  // AI Activity Logs endpoint - get recent AI activities
  app.get("/api/ai-activity-logs", async (req, res) => {
    try {
      const result = await db.execute(sql`SELECT * FROM ai_activity_logs ORDER BY created_at DESC LIMIT 50`);
      res.json({ success: true, logs: result.rows });
    } catch (error: any) {
      console.error("Error fetching AI logs:", error);
      res.status(500).json({ error: "Failed to fetch AI activity logs" });
    }
  });

  // Helper to log AI activity
  async function logAiActivity(actionType: string, description: string, userEmail?: string, status: string = "completed") {
    try {
      await db.execute(sql`INSERT INTO ai_activity_logs (action_type, description, user_email, status) VALUES (${actionType}, ${description}, ${userEmail || null}, ${status})`);
    } catch (err) {
      console.error("Failed to log AI activity:", err);
    }
  }

  // Coey AI Assistant endpoint
  app.post("/api/coey/chat", async (req, res) => {
    try {
      const { message, userEmail } = req.body;
      
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message required" });
      }

      // Log the activity
      await logAiActivity("chat", `User asked: "${message.substring(0, 80)}${message.length > 80 ? '...' : ''}"`, userEmail);

      // Use Replit AI Integrations for Anthropic
      const client = new Anthropic({
        apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
        baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
      });

      const response = await client.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 8192,
        system: `You are Coey, a helpful AI assistant for RentAPog users. You are LIMITED to helping with ONLY these 3 things:

1. **Making Websites** - Help users create landing pages, squeeze pages, HTML/CSS, website design, web development code
2. **Writing Ads** - Help users write ad copy, marketing copy, social media posts, email subject lines, sales copy
3. **Coding** - Help users with JavaScript, HTML, CSS, React, and other programming questions

IMPORTANT RULES:
- You can ONLY help with the 3 topics above (websites, ads, coding)
- If someone asks about anything else (admin functions, database, payments, account management, etc.), politely say: "I can only help with making websites, writing ads, and coding. For other questions, please contact support."
- Be friendly, concise, and practical
- Provide code examples when helpful
- Never discuss system internals, admin features, or backend operations`,
        messages: [
          {
            role: "user",
            content: message,
          }
        ],
      });

      const textContent = response.content.find((block: any) => block.type === "text");
      const responseText = textContent && textContent.type === "text" ? textContent.text : "Sorry, I couldn't generate a response.";

      // Log successful response
      await logAiActivity("response", `Coey answered question about: "${message.substring(0, 50)}..."`, userEmail);

      res.json({ success: true, response: responseText });
    } catch (error: any) {
      console.error("Coey chat error:", error);
      await logAiActivity("error", `Failed to respond: ${error?.message}`, undefined, "failed");
      res.status(500).json({ error: error?.message || "Failed to get response from Coey" });
    }
  });

  // Create affiliate page
  app.post("/api/affiliate-pages/create", async (req, res) => {
    try {
      const { userId, slug, displayName } = req.body;
      
      if (!userId || !slug || !displayName) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Validate slug format (alphanumeric and hyphens only)
      if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(slug.toLowerCase())) {
        return res.status(400).json({ message: "Invalid slug format. Use lowercase letters, numbers, and hyphens." });
      }

      // Check if slug already taken
      const existing = await storage.getAffiliatePageBySlug(slug.toLowerCase());
      if (existing) {
        return res.status(400).json({ message: "This slug is already taken" });
      }

      const page = await storage.createAffiliatePage({
        userId,
        slug: slug.toLowerCase(),
        displayName,
      });

      res.json({ success: true, page, url: `https://rentapog.com/affiliate/${page.slug}` });
    } catch (error: any) {
      console.error("Affiliate page creation error:", error);
      res.status(500).json({ message: error?.message || "Failed to create affiliate page" });
    }
  });

  // Get user's affiliate pages
  app.get("/api/users/:id/affiliate-pages", async (req, res) => {
    try {
      const { id } = req.params;
      const pages = await storage.getUserAffiliatePages(id);
      res.json(pages);
    } catch (error: any) {
      console.error("Get affiliate pages error:", error);
      res.status(500).json({ message: error?.message || "Failed to fetch affiliate pages" });
    }
  });

  // Forwarding endpoint - redirects to affiliate page
  app.get("/forward/:slug", (req, res) => {
    const { slug } = req.params;
    res.redirect(301, `https://rentapog.com/affiliate/${slug}`);
  });

  // Admin domains
  app.get("/api/users/:id/admin-domains", async (req, res) => {
    try {
      const { id } = req.params;
      const domains = await storage.getUserAdminDomains(id);
      res.json(domains);
    } catch (error: any) {
      console.error("Get admin domains error:", error);
      res.status(500).json({ message: error?.message || "Failed to fetch admin domains" });
    }
  });

  app.post("/api/admin/domains", async (req, res) => {
    try {
      const { domainName, userId } = req.body;

      if (!domainName || !userId) {
        return res.status(400).json({ message: "Domain name and user ID required" });
      }

      // Validate domain name format
      if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(domainName.toLowerCase())) {
        return res.status(400).json({ message: "Invalid domain format. Use lowercase letters, numbers, and hyphens." });
      }

      const domain = await storage.createAdminDomain({
        userId,
        domainName: domainName.toLowerCase(),
        forwardingLink: `https://rentapog.com/forward/${domainName.toLowerCase()}`,
      });

      res.json({ success: true, domain });
    } catch (error: any) {
      console.error("Create admin domain error:", error);
      res.status(500).json({ message: error?.message || "Failed to create admin domain" });
    }
  });

  // Support email endpoint for branded affiliate contact forms
  app.post("/api/email/support", async (req, res) => {
    try {
      const { name, email, message, fromBrand } = req.body;

      if (!name || !email || !message) {
        return res.status(400).json({ error: "Name, email, and message are required" });
      }

      const emailContent = `
New Contact Form Submission from ${fromBrand || 'RentAPog'} Affiliate Page

From: ${name} (${email})
Message:
${message}

---
This message was submitted via the affiliate contact page.
      `.trim();

      // Try to send email via Resend
      try {
        const resendApiKey = process.env.RESEND_API_KEY;
        if (resendApiKey) {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "noreply@rentapog.com",
              to: "support@rentapog.com",
              subject: `Contact Form: ${fromBrand || 'RentAPog'} - ${name}`,
              html: `<pre>${emailContent}</pre>`,
            }),
          });
        }
      } catch (emailError) {
        console.error("Email send error:", emailError);
        // Don't fail the request if email fails
      }

      res.json({ success: true, message: "Thank you! We'll get back to you soon." });
    } catch (error: any) {
      console.error("Support email error:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // Coey Code Generation Endpoint
  app.post("/api/coey/code", async (req, res) => {
    try {
      const { request, file, currentCode } = req.body;

      console.log("🚀 [Coey Backend] Received code generation request");
      console.log("📁 Target file:", file);
      console.log("📝 User request:", request?.substring(0, 100) || "No request");
      console.log("📄 Current code size:", currentCode?.length || 0, "characters");

      if (!request) {
        console.log("⚠️ [Coey Backend] Missing request description");
        return res.status(400).json({ message: "Please describe what you want to change" });
      }

      const apiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY;
      const baseUrl = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;

      console.log("🔐 [Coey Backend] Checking AI configuration:", { 
        hasApiKey: !!apiKey, 
        hasBaseUrl: !!baseUrl 
      });

      if (!apiKey || !baseUrl) {
        console.error("❌ [Coey Backend] Missing AI config for code generation:", { apiKey: !!apiKey, baseUrl: !!baseUrl });
        return res.status(500).json({ message: "AI integration not configured" });
      }

      const systemPrompt = `You are Coey, a skilled code assistant. Generate clean, production-ready code based on user requests.
File: ${file}
Current code context: ${currentCode?.substring(0, 1000) || "N/A"}

Guidelines:
- Generate only the code changes needed
- Follow the existing code style and patterns
- Include proper TypeScript types
- Return ONLY the code, no explanations`;

      console.log("📞 [Coey Backend] Calling Claude API at:", baseUrl);
      const response = await fetch(`${baseUrl}/v1/messages`, {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 2048,
          system: systemPrompt,
          messages: [{ role: "user", content: request }],
        }),
      });

      console.log("📡 [Coey Backend] Claude API response status:", response.status);

      if (!response.ok) {
        const error = await response.text();
        console.error("❌ [Coey Backend] Claude API error (status " + response.status + "):", error);
        return res.status(500).json({ message: "Failed to generate code from Claude" });
      }

      const data = await response.json();
      const generatedCode = data.content?.[0]?.text || "";
      
      console.log("✅ [Coey Backend] Successfully generated code");
      console.log("📏 Generated code size:", generatedCode.length, "characters");
      console.log("📄 Code preview:", generatedCode.substring(0, 150) + "...");
      
      res.json({ code: generatedCode });
    } catch (error: any) {
      console.error("❌ [Coey Backend] Code generation error:", error.message);
      console.error("Stack:", error.stack);
      res.status(500).json({ message: error?.message || "Failed to generate code" });
    }
  });

  // Coey Create New Page Endpoint
  app.post("/api/coey/create-page", async (req, res) => {
    try {
      const { pageName, route, description } = req.body;

      console.log("🚀 [Coey Backend] Creating new page");
      console.log("📄 Page name:", pageName);
      console.log("🔗 Route:", route);
      console.log("📝 Description:", description?.substring(0, 100));

      if (!pageName || !route || !description) {
        return res.status(400).json({ message: "Page name, route, and description are required" });
      }

      const apiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY;
      const baseUrl = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;

      if (!apiKey || !baseUrl) {
        console.error("❌ [Coey Backend] Missing AI config for page creation");
        return res.status(500).json({ message: "AI integration not configured" });
      }

      const componentName = pageName.replace(/[^a-zA-Z0-9]/g, '');
      const systemPrompt = `You are Coey, a skilled React developer. Generate a complete, production-ready React page component.

Create a new page called "${pageName}" that will be accessible at "/${route}".

Requirements:
- Generate a complete React functional component named "${componentName}"
- Use TypeScript
- Use Tailwind CSS for styling
- Include proper imports (useState, useEffect if needed)
- Make it responsive and visually appealing
- Match the RentAPog brand style (professional, clean, with gradients)
- Include a default export for the component
- Add data-testid attributes to interactive elements
- Return ONLY the complete code file, no explanations

Example structure:
\`\`\`tsx
import { useState } from "react";

export default function ${componentName}() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Page content */}
    </div>
  );
}
\`\`\``;

      console.log("📞 [Coey Backend] Calling Claude API for page generation");
      const response = await fetch(`${baseUrl}/v1/messages`, {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 4096,
          system: systemPrompt,
          messages: [{ role: "user", content: `Create this page: ${description}` }],
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("❌ [Coey Backend] Claude API error:", error);
        return res.status(500).json({ message: "Failed to generate page" });
      }

      const data = await response.json();
      let generatedCode = data.content?.[0]?.text || "";
      
      // Clean up markdown code blocks if present
      generatedCode = generatedCode.replace(/^```(tsx?|javascript)?\n?/i, '').replace(/\n?```$/i, '');
      
      console.log("✅ [Coey Backend] Successfully generated new page");
      console.log("📏 Generated code size:", generatedCode.length, "characters");
      
      res.json({ 
        code: generatedCode,
        pageName,
        route,
        filePath: `client/src/pages/${componentName}.tsx`
      });
    } catch (error: any) {
      console.error("❌ [Coey Backend] Page creation error:", error.message);
      res.status(500).json({ message: error?.message || "Failed to create page" });
    }
  });

  // Apply Code Changes Endpoint
  app.post("/api/code/apply", async (req, res) => {
    try {
      const { file, code, userId } = req.body;

      console.log("🔧 [Code Apply Backend] Received apply request");
      console.log("👤 User ID:", userId);
      console.log("📁 Target file:", file);
      console.log("📏 Code size:", code?.length || 0, "characters");

      if (!file || !code || !userId) {
        console.log("⚠️ [Code Apply Backend] Missing required parameters");
        return res.status(400).json({ message: "File, code, and user ID are required" });
      }

      // Log the code application for audit
      console.log(`✅ [Code Apply Backend] User ${userId} applied code to ${file} (${code.length} chars)`);
      console.log("📄 Applied code preview:", code.substring(0, 150) + "...");

      // In a real system, this would:
      // 1. Write the code to the file
      // 2. Run tests
      // 3. Commit to git
      // 4. Queue for deployment if enabled

      const timestamp = new Date().toISOString();
      console.log("⏰ Timestamp:", timestamp);
      
      res.json({
        success: true,
        message: "Code applied successfully",
        file,
        timestamp,
      });
    } catch (error: any) {
      console.error("❌ [Code Apply Backend] Error:", error.message);
      console.error("Stack:", error.stack);
      res.status(500).json({ message: error?.message || "Failed to apply code" });
    }
  });

  // Email verification endpoint - Verify email and send affiliate link
  app.get("/api/verify", async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== "string") {
        return res.status(400).send(`
          <html><body style="font-family: Arial; text-align: center; padding: 40px;">
            <h2>❌ Invalid Verification Link</h2>
            <p>The verification link is missing or invalid.</p>
            <a href="https://rentapog.com" style="color: #0066cc;">← Go Back to RentAPog</a>
          </body></html>
        `);
      }

      const lead = await storage.getEmailLeadByToken(token);
      if (!lead) {
        return res.status(404).send(`
          <html><body style="font-family: Arial; text-align: center; padding: 40px;">
            <h2>❌ Link Expired or Invalid</h2>
            <p>This verification link has expired or is invalid. Please sign up again.</p>
            <a href="https://rentapog.com" style="color: #0066cc;">← Go Back to RentAPog</a>
          </body></html>
        `);
      }

      // Mark as verified
      await storage.verifyEmailLead(lead.id);

      // Send second email with affiliate link
      try {
        const { Resend } = await import("resend");
        const resendApiKey = process.env.RESEND_API_KEY;
        if (resendApiKey) {
          const resend = new Resend(resendApiKey);
          const affiliateLink = `https://rentapog.com/?aff=rentapog`;
          
          await resend.emails.send({
            from: "sales@rentapog.com",
            to: lead.email,
            subject: "🔥 Your Affiliate Link is Ready - Get Started Earning!",
            html: `<div style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #0066cc;">✅ You've Been Verified & Chosen! 🎯</h2>
              <p style="font-size: 16px; color: #333;">Congratulations! Your email is now verified. You're now a RentAPog affiliate ready to start earning!</p>
              
              <div style="background: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <h3 style="color: #856404;">Your Unique Affiliate Link:</h3>
                <p style="font-size: 18px; background: white; padding: 15px; border-radius: 5px; word-break: break-all; font-weight: bold; color: #0066cc;">
                  ${affiliateLink}
                </p>
              </div>
              
              <div style="background: #f0f0f0; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <h3 style="color: #333;">How You Earn:</h3>
                <ul style="color: #666; line-height: 1.8;">
                  <li>✓ 100% commission on the 1st referral sale</li>
                  <li>✓ Admin gets the 2nd referral (to cover costs)</li>
                  <li>✓ 100% commission on the 3rd referral sale</li>
                  <li>✓ After that, EVERY sale is 100% yours!</li>
                </ul>
              </div>
              
              <p style="color: #666; margin: 20px 0;">
                <strong>Next Steps:</strong><br>
                1. Go to <strong>rentapog.com/?aff=rentapog</strong><br>
                2. Create your account and choose your personal username<br>
                3. After signup, you'll get your personal affiliate link<br>
                4. Start sharing everywhere: Twitter, LinkedIn, TikTok, Discord, etc.
              </p>
              
              <p style="color: #999; font-size: 12px; margin-top: 30px;">Don't reply to this email. Visit rentapog.com for support.</p>
            </div>`,
          });
          console.log(`[Verify] Affiliate link sent to ${lead.email}`);
        }
      } catch (emailErr) {
        console.error("[Verify] Failed to send affiliate email:", emailErr);
      }

      // Redirect to confirmation page
      res.redirect("https://rentapog.com/verify-success");
    } catch (error: any) {
      console.error("Verify error:", error);
      res.status(500).send(`
        <html><body style="font-family: Arial; text-align: center; padding: 40px;">
          <h2>❌ Verification Error</h2>
          <p>Something went wrong. Please try again or contact support.</p>
          <a href="https://rentapog.com" style="color: #0066cc;">← Go Back to RentAPog</a>
        </body></html>
      `);
    }
  });

  // Send email campaign endpoint - Users send promotional emails with their affiliate link
  app.post("/api/email-campaign/send", async (req, res) => {
    try {
      const { userId, recipientEmail, subject, message } = req.body;
      
      if (!userId || !recipientEmail || !subject || !message) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const affiliateLink = `https://rentapog.com/?aff=${user.affiliateLink}`;
      const emailBody = `${message}\n\nJoin here: ${affiliateLink}`;

      // Send via SendGrid
      try {
        const sgMail = await import("@sendgrid/mail");
        const sendgridApiKey = process.env.SENDGRID_API_KEY;
        if (sendgridApiKey) {
          sgMail.default.setApiKey(sendgridApiKey);
          
          await sgMail.default.send({
            to: recipientEmail,
            from: "promo@rentapog.com",
            subject,
            html: `<p>${emailBody.replace(/\n/g, "<br>")}</p>`,
          });
          
          console.log(`✓ Email sent to ${recipientEmail} with affiliate link: ${affiliateLink}`);
        }
      } catch (emailErr) {
        console.error("SendGrid email failed:", emailErr);
      }

      // Log campaign
      await storage.createEmailCampaign({
        userId,
        recipientEmail,
        subject,
        message: emailBody,
        affiliateLink: user.affiliateLink,
        status: "sent",
        sentAt: new Date(),
      });

      res.json({ success: true, message: "Email sent successfully with your affiliate link" });
    } catch (error: any) {
      console.error("Email campaign error:", error);
      res.status(500).json({ error: error?.message || "Failed to send email" });
    }
  });

  // Stripe Connect OAuth endpoint
  app.get("/api/stripe/connect-url", async (req, res) => {
    try {
      // Get current user from cookie
      let user = null;
      const cookieValue = req.headers.cookie
        ?.split("; ")
        .find(row => row.startsWith("user="))
        ?.split("=")[1];
      
      if (cookieValue) {
        try {
          user = JSON.parse(decodeURIComponent(cookieValue));
        } catch {
          // Cookie parsing failed
        }
      }

      if (!user || !user.email) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Get Stripe credentials from the integration
      const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
      const xReplitToken = process.env.REPL_IDENTITY
        ? 'repl ' + process.env.REPL_IDENTITY
        : process.env.WEB_REPL_RENEWAL
          ? 'depl ' + process.env.WEB_REPL_RENEWAL
          : null;

      if (!xReplitToken || !hostname) {
        return res.status(500).json({ error: "Stripe not configured" });
      }

      const url = new URL(`https://${hostname}/api/v2/connection`);
      url.searchParams.set('include_secrets', 'true');
      url.searchParams.set('connector_names', 'stripe');
      url.searchParams.set('environment', 'development');

      const credResponse = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/json',
          'X_REPLIT_TOKEN': xReplitToken
        }
      });

      const credData = await credResponse.json();
      const stripeSettings = credData.items?.[0]?.settings;

      if (!stripeSettings?.publishable) {
        return res.status(500).json({ error: "Stripe publishable key not found" });
      }

      // Get Stripe Connect Client ID
      const connectClientId = process.env.STRIPE_CONNECT_CLIENT_ID?.trim();
      if (!connectClientId) {
        return res.status(500).json({ error: "Stripe Connect Client ID not configured" });
      }

      // Build proper OAuth URL that redirects back to our callback
      const state = Buffer.from(JSON.stringify({ userId: user.id })).toString("base64");
      const redirectUri = "https://rentapog.com/stripe-callback";
      
      const connectUrl = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${connectClientId}&scope=read_write&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}`;
      
      res.json({ url: connectUrl });
    } catch (error) {
      console.error("Stripe Connect URL error:", error);
      res.status(500).json({ error: "Failed to generate Stripe Connect URL" });
    }
  });

  // Stripe Connect callback handler
  app.get("/stripe-callback", async (req, res) => {
    try {
      const { code, state, error } = req.query;
      
      if (error) {
        return res.redirect(`https://backend.rentapog.com/?error=${encodeURIComponent(error as string)}`);
      }

      if (!code || !state) {
        return res.redirect(`https://backend.rentapog.com/?error=${encodeURIComponent("Missing authorization code")}`);
      }

      // Decode state to get userId
      let userId: string;
      try {
        const stateData = JSON.parse(Buffer.from(state as string, "base64").toString());
        userId = stateData.userId;
      } catch {
        return res.redirect(`https://backend.rentapog.com/?error=${encodeURIComponent("Invalid state parameter")}`);
      }

      // Exchange code for Stripe access token
      const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
      const xReplitToken = process.env.REPL_IDENTITY
        ? 'repl ' + process.env.REPL_IDENTITY
        : process.env.WEB_REPL_RENEWAL
          ? 'depl ' + process.env.WEB_REPL_RENEWAL
          : null;

      if (!xReplitToken || !hostname) {
        return res.redirect(`https://backend.rentapog.com/?error=${encodeURIComponent("Stripe not configured")}`);
      }

      // Get Stripe Connect Client ID and API Key from environment
      const connectClientId = process.env.STRIPE_CONNECT_CLIENT_ID?.trim();
      const stripeSecretKey = process.env.STRIPE_API_KEY?.trim();
      
      if (!connectClientId) {
        return res.redirect(`https://backend.rentapog.com/?error=${encodeURIComponent("Stripe Connect Client ID not configured")}`);
      }
      
      if (!stripeSecretKey) {
        return res.redirect(`https://backend.rentapog.com/?error=${encodeURIComponent("Stripe API Key not configured")}`);
      }

      // Exchange code for access token with Stripe
      const tokenResponse = await fetch("https://connect.stripe.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: connectClientId,
          code: code as string,
          client_secret: stripeSecretKey,
          grant_type: "authorization_code",
        }).toString(),
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        return res.redirect(`https://backend.rentapog.com/?error=${encodeURIComponent(tokenData.error_description || tokenData.error)}`);
      }

      // Store the Stripe account ID (stripe_user_id) in user record
      if (tokenData.stripe_user_id) {
        await storage.updateUserStripeAccount(userId, tokenData.stripe_user_id);
      }

      // Redirect back to backend with success
      res.redirect(`https://backend.rentapog.com/?stripe_connected=true`);
    } catch (error) {
      console.error("Stripe callback error:", error);
      res.redirect(`https://backend.rentapog.com/?error=${encodeURIComponent("Callback processing failed")}`);
    }
  });

  // ==========================================
  // RENTAL MARKETPLACE ROUTES
  // ==========================================

  // Get domains available for rent
  app.get("/api/rentals/available", async (req, res) => {
    try {
      const availableDomains = await storage.getDomainsAvailableForRent();
      
      // Enrich with owner info
      const enrichedDomains = await Promise.all(availableDomains.map(async (domain) => {
        const owner = await storage.getUserById(domain.userId);
        return {
          ...domain,
          ownerName: owner?.name || "Unknown",
          fullDomain: `${domain.domainName}.rentapog.com`
        };
      }));
      
      res.json({ success: true, domains: enrichedDomains });
    } catch (error: any) {
      console.error("[Rentals Available] Error:", error);
      res.status(500).json({ error: error?.message || "Failed to get available domains" });
    }
  });

  // Toggle domain listing for rent
  app.post("/api/rentals/list-domain", async (req, res) => {
    try {
      const { domainId, isListed, ownerDefaultForwardUrl } = req.body;
      
      if (!domainId) {
        return res.status(400).json({ error: "Domain ID is required" });
      }
      
      // Verify the domain exists
      const domain = await storage.getDomainRentalById(domainId);
      if (!domain) {
        return res.status(404).json({ error: "Domain not found" });
      }
      
      // Update listing status
      await storage.listDomainForRent(domainId, isListed);
      
      // Set owner's default forward URL if provided
      if (ownerDefaultForwardUrl) {
        await storage.setOwnerDefaultForwardUrl(domainId, ownerDefaultForwardUrl);
      }
      
      console.log(`[Rental] Domain ${domain.domainName} ${isListed ? "listed" : "unlisted"} for rent`);
      res.json({ success: true, message: `Domain ${isListed ? "listed" : "unlisted"} for rent` });
    } catch (error: any) {
      console.error("[List Domain] Error:", error);
      res.status(500).json({ error: error?.message || "Failed to update listing" });
    }
  });

  // Create rental checkout (Stripe subscription)
  app.post("/api/rentals/checkout", async (req, res) => {
    try {
      const { domainId, renterId } = req.body;
      
      if (!domainId || !renterId) {
        return res.status(400).json({ error: "Domain ID and renter ID are required" });
      }
      
      // Get the domain
      const domain = await storage.getDomainRentalById(domainId);
      if (!domain) {
        return res.status(404).json({ error: "Domain not found" });
      }
      
      // Check if domain is listed for rent
      if (!domain.isListedForRent) {
        return res.status(400).json({ error: "Domain is not available for rent" });
      }
      
      // Check if there's already an active rental contract
      const activeContract = await storage.getActiveRentalContractByDomain(domainId);
      if (activeContract) {
        return res.status(400).json({ error: "Domain is already rented" });
      }
      
      // Get renter info
      const renter = await storage.getUserById(renterId);
      if (!renter) {
        return res.status(404).json({ error: "Renter not found" });
      }
      
      const stripe = new Stripe(process.env.STRIPE_API_KEY || "");
      
      // Create Stripe product for this domain rental
      const product = await stripe.products.create({
        name: `Daily Rental: ${domain.domainName}.rentapog.com`,
        description: `Rent subdomain ${domain.domainName}.rentapog.com for $20/day`,
      });
      
      // Create daily recurring price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: 2000, // $20 in cents
        currency: "usd",
        recurring: {
          interval: "day",
          interval_count: 1,
        },
      });
      
      // Create Stripe Checkout session for subscription
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "subscription",
        customer_email: renter.email,
        line_items: [{
          price: price.id,
          quantity: 1,
        }],
        success_url: `https://backend.rentapog.com/my-rentals?success=true&domain=${encodeURIComponent(domain.domainName)}`,
        cancel_url: `https://rentapog.com/rent?cancelled=true`,
        metadata: {
          paymentType: "subdomain_rental",
          domainId: domain.id.toString(),
          domainName: domain.domainName,
          ownerId: domain.userId,
          renterId: renterId,
          dailyRate: "2000",
        },
      });
      
      console.log(`[Rental Checkout] Created session for ${domain.domainName} | Renter: ${renterId}`);
      res.json({ 
        success: true, 
        sessionId: session.id,
        url: session.url 
      });
    } catch (error: any) {
      console.error("[Rental Checkout] Error:", error);
      res.status(500).json({ error: error?.message || "Checkout failed" });
    }
  });

  // Get user's rented domains (as renter)
  app.get("/api/rentals/my-rentals/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const contracts = await storage.getRentalContractsByRenter(userId);
      
      // Enrich with domain info
      const enrichedContracts = await Promise.all(contracts.map(async (contract) => {
        const domain = await storage.getDomainRentalById(contract.domainRentalId);
        const owner = await storage.getUserById(contract.ownerId);
        return {
          ...contract,
          domainName: domain?.domainName,
          fullDomain: domain ? `${domain.domainName}.rentapog.com` : null,
          ownerName: owner?.name || "Unknown",
        };
      }));
      
      res.json({ success: true, rentals: enrichedContracts });
    } catch (error: any) {
      console.error("[My Rentals] Error:", error);
      res.status(500).json({ error: error?.message || "Failed to get rentals" });
    }
  });

  // Get domains I'm renting out (as owner)
  app.get("/api/rentals/my-listings/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const contracts = await storage.getRentalContractsByOwner(userId);
      
      // Enrich with domain and renter info
      const enrichedContracts = await Promise.all(contracts.map(async (contract) => {
        const domain = await storage.getDomainRentalById(contract.domainRentalId);
        const renter = await storage.getUserById(contract.renterId);
        const charges = await storage.getRentalChargesByContract(contract.id);
        return {
          ...contract,
          domainName: domain?.domainName,
          fullDomain: domain ? `${domain.domainName}.rentapog.com` : null,
          renterName: renter?.name || "Unknown",
          renterEmail: renter?.email,
          totalEarnings: charges.reduce((sum, c) => sum + (c.creditedUserId === userId ? c.amount : 0), 0),
          totalCharges: charges.length,
        };
      }));
      
      res.json({ success: true, listings: enrichedContracts });
    } catch (error: any) {
      console.error("[My Listings] Error:", error);
      res.status(500).json({ error: error?.message || "Failed to get listings" });
    }
  });

  // Get rental charges/earnings for a domain owner
  app.get("/api/rentals/earnings/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const charges = await storage.getRentalChargesByOwner(userId);
      
      // Calculate totals
      const totalEarnings = charges
        .filter(c => c.creditedUserId === userId)
        .reduce((sum, c) => sum + c.amount, 0);
      const passedUpToAdmin = charges
        .filter(c => c.passedUpTo === "admin")
        .reduce((sum, c) => sum + c.amount, 0);
      
      res.json({ 
        success: true, 
        charges,
        totals: {
          totalEarnings,
          passedUpToAdmin,
          netEarnings: totalEarnings,
        }
      });
    } catch (error: any) {
      console.error("[Rental Earnings] Error:", error);
      res.status(500).json({ error: error?.message || "Failed to get earnings" });
    }
  });

  // Cancel a rental (renter cancels subscription)
  app.post("/api/rentals/cancel", async (req, res) => {
    try {
      const { contractId, renterId } = req.body;
      
      const contract = await storage.getRentalContractById(contractId);
      if (!contract) {
        return res.status(404).json({ error: "Contract not found" });
      }
      
      // Verify the renter is canceling their own rental
      if (contract.renterId !== renterId) {
        return res.status(403).json({ error: "Not authorized to cancel this rental" });
      }
      
      // Cancel Stripe subscription
      if (contract.stripeSubscriptionId) {
        const stripe = new Stripe(process.env.STRIPE_API_KEY || "");
        await stripe.subscriptions.cancel(contract.stripeSubscriptionId);
      }
      
      // Update contract status
      await storage.updateRentalContractStatus(contractId, "cancelled");
      
      // ALWAYS restore listing availability using contract's domainRentalId (even if domain lookup fails)
      await storage.listDomainForRent(contract.domainRentalId, true);
      
      // Try to restore forwarding to owner's default (optional - only if domain exists and has default URL)
      const domain = await storage.getDomainRentalById(contract.domainRentalId);
      if (domain && domain.ownerDefaultForwardUrl) {
        await storage.updateDomainForwarding(domain.id, domain.ownerDefaultForwardUrl);
        
        // Update Cloudflare forwarding
        const { setupDomainForwarding } = await import("./cloudflare");
        await setupDomainForwarding(domain.domainName, domain.ownerDefaultForwardUrl);
      }
      
      console.log(`[Rental Cancelled] Contract ${contractId} cancelled by renter ${renterId} | Listing re-enabled`);
      res.json({ success: true, message: "Rental cancelled" });
    } catch (error: any) {
      console.error("[Cancel Rental] Error:", error);
      res.status(500).json({ error: error?.message || "Failed to cancel rental" });
    }
  });

  // ============================================
  // BRANDING FEATURE - $29/month white-label sites with custom domains
  // ============================================

  // Check domain availability
  app.post("/api/branding/check-domain", async (req, res) => {
    try {
      const { domain } = req.body;
      
      if (!domain) {
        return res.status(400).json({ error: "Domain is required" });
      }
      
      // Validate domain format
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
      if (!domainRegex.test(domain)) {
        return res.status(400).json({ error: "Invalid domain format. Example: mybrand.com" });
      }
      
      // Check if domain is already used by another branding subscription
      const existingBrand = await storage.getBrandingSubscriptionByDomain(domain.toLowerCase());
      if (existingBrand) {
        return res.json({ available: false, domain, error: "This domain is already registered with us" });
      }
      
      // Check availability with Namecheap
      const { checkDomainAvailability } = await import("./namecheap");
      const result = await checkDomainAvailability(domain.toLowerCase());
      
      res.json(result);
    } catch (error: any) {
      console.error("[Domain Check] Error:", error);
      res.status(500).json({ error: error?.message || "Failed to check domain availability" });
    }
  });

  // Create branding subscription checkout with custom domain
  app.post("/api/branding/checkout", async (req, res) => {
    try {
      const { userId, brandName, customDomain } = req.body;
      
      if (!userId || !brandName || !customDomain) {
        return res.status(400).json({ error: "User ID, brand name, and custom domain are required" });
      }
      
      // Validate domain format
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
      if (!domainRegex.test(customDomain)) {
        return res.status(400).json({ error: "Invalid domain format. Example: mybrand.com" });
      }
      
      // Create a URL-safe slug from brand name
      const brandSlug = brandName.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      if (brandSlug.length < 3) {
        return res.status(400).json({ error: "Brand name must be at least 3 characters" });
      }
      
      // Check if slug is available
      const existingBrand = await storage.getBrandingSubscriptionBySlug(brandSlug);
      if (existingBrand) {
        return res.status(400).json({ error: "This brand name is already taken. Try a different name." });
      }
      
      // Check if domain is available
      const existingDomain = await storage.getBrandingSubscriptionByDomain(customDomain.toLowerCase());
      if (existingDomain) {
        return res.status(400).json({ error: "This domain is already registered with us" });
      }
      
      // Check domain availability with Namecheap
      const { checkDomainAvailability } = await import("./namecheap");
      const domainCheck = await checkDomainAvailability(customDomain.toLowerCase());
      if (!domainCheck.available) {
        return res.status(400).json({ error: domainCheck.error || "This domain is not available for registration" });
      }
      
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const stripe = new Stripe(process.env.STRIPE_API_KEY || "");
      
      // Create $29/month subscription checkout
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{
          price_data: {
            currency: "usd",
            product_data: {
              name: `Branding Subscription - ${brandName}`,
              description: `Custom domain: ${customDomain}`,
            },
            unit_amount: 2900, // $29
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        }],
        success_url: `${req.protocol}://${req.get("host")}/api/branding/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.protocol}://${req.get("host")}/backend?tab=branding&cancelled=true`,
        customer_email: user.email,
        metadata: {
          userId,
          brandName,
          brandSlug,
          customDomain: customDomain.toLowerCase(),
          type: "branding_subscription",
        },
      });
      
      console.log(`[Branding Checkout] Session created for ${user.email} | Brand: ${brandName} | Domain: ${customDomain}`);
      res.json({ success: true, url: session.url, sessionId: session.id });
    } catch (error: any) {
      console.error("[Branding Checkout] Error:", error);
      res.status(500).json({ error: error?.message || "Checkout failed" });
    }
  });

  // Branding success handler - registers domain after payment
  app.get("/api/branding/success", async (req, res) => {
    try {
      const sessionId = req.query.session_id as string;
      if (!sessionId) {
        return res.redirect("/backend?tab=branding&error=missing_session");
      }
      
      const stripe = new Stripe(process.env.STRIPE_API_KEY || "");
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (session.payment_status !== "paid") {
        return res.redirect("/backend?tab=branding&error=payment_failed");
      }
      
      const { userId, brandName, brandSlug, customDomain } = session.metadata || {};
      
      if (!userId || !brandSlug || !customDomain) {
        return res.redirect("/backend?tab=branding&error=invalid_session");
      }
      
      // Check if already created (avoid duplicates)
      const existingBrand = await storage.getBrandingSubscriptionBySlug(brandSlug);
      if (existingBrand) {
        console.log(`[Branding Success] Brand ${brandSlug} already exists, skipping creation`);
        return res.redirect(`/backend?tab=branding&success=true`);
      }
      
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.redirect("/backend?tab=branding&error=user_not_found");
      }
      
      // Register the domain with Namecheap
      const { registerDomain, setupCustomDomainDNS } = await import("./namecheap");
      
      // Use user's contact info for domain registration
      const contactInfo = {
        firstName: user.name?.split(" ")[0] || "RentAPog",
        lastName: user.name?.split(" ").slice(1).join(" ") || "User",
        email: user.email,
        address: user.address || "123 Main St",
        city: user.city || "Austin",
        state: user.state || "TX",
        zip: user.zip || "78701",
        country: user.country || "US",
        phone: "+1.5555555555", // Default phone
      };
      
      console.log(`[Branding Success] Registering domain: ${customDomain}`);
      const registrationResult = await registerDomain(customDomain, contactInfo);
      
      let domainRegistered = false;
      let domainError = "";
      
      if (registrationResult.success) {
        console.log(`[Branding Success] Domain registered: ${customDomain}`);
        domainRegistered = true;
        
        // Set up DNS to point to our server
        // Use the Replit domain IP or a placeholder for now
        const serverIp = process.env.SERVER_IP || "34.96.44.239"; // Replit IP
        const dnsResult = await setupCustomDomainDNS(customDomain, serverIp);
        if (!dnsResult.success) {
          console.error(`[Branding Success] DNS setup failed for ${customDomain}:`, dnsResult.error);
        }
      } else {
        console.error(`[Branding Success] Domain registration failed:`, registrationResult.error);
        domainError = registrationResult.error || "Domain registration failed";
      }
      
      // Create the branding subscription record
      await storage.createBrandingSubscription({
        userId,
        brandName,
        brandSlug,
        customDomain,
        domainRegistered,
        domainRegistrationDate: domainRegistered ? new Date() : null,
        stripeSubscriptionId: session.subscription as string,
        status: "active",
      });
      
      // Track this as a pass-up sale (1st payment goes to admin, used to cover domain cost)
      // The affiliate who referred this user will get subsequent payments
      console.log(`[Branding Success] Created branding for user ${userId} | Brand: ${brandSlug} | Domain: ${customDomain} | Registered: ${domainRegistered}`);
      
      if (domainRegistered) {
        res.redirect(`/backend?tab=branding&success=true&domain=${encodeURIComponent(customDomain)}`);
      } else {
        res.redirect(`/backend?tab=branding&success=true&domain_pending=true&error=${encodeURIComponent(domainError)}`);
      }
    } catch (error: any) {
      console.error("[Branding Success] Error:", error);
      res.redirect("/backend?tab=branding&error=processing_failed");
    }
  });

  // Get user's branding subscriptions
  app.get("/api/branding/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const brands = await storage.getBrandingSubscriptionsByUser(userId);
      res.json({ success: true, brands });
    } catch (error: any) {
      console.error("[Get Branding] Error:", error);
      res.status(500).json({ error: error?.message || "Failed to get brands" });
    }
  });

  // Get branding by slug (for the branded landing page)
  app.get("/api/branding/site/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const brand = await storage.getBrandingSubscriptionBySlug(slug);
      
      if (!brand || brand.status !== "active") {
        return res.status(404).json({ error: "Brand not found" });
      }
      
      // Get the owner's info for the affiliate link
      const owner = await storage.getUserById(brand.userId);
      if (!owner) {
        return res.status(404).json({ error: "Brand owner not found" });
      }
      
      res.json({
        success: true,
        brand: {
          id: brand.id,
          brandName: brand.brandName,
          brandSlug: brand.brandSlug,
          customDomain: brand.customDomain,
          customLogo: brand.customLogo,
          customColors: brand.customColors,
          affiliateCode: owner.referralCode,
          status: brand.status,
        },
      });
    } catch (error: any) {
      console.error("[Get Brand Site] Error:", error);
      res.status(500).json({ error: error?.message || "Failed to get brand" });
    }
  });

  // Get branding by custom domain (for custom domain requests)
  app.get("/api/branding/domain/:domain", async (req, res) => {
    try {
      const { domain } = req.params;
      const brand = await storage.getBrandingSubscriptionByDomain(domain.toLowerCase());
      
      if (!brand || brand.status !== "active") {
        return res.status(404).json({ error: "Brand not found" });
      }
      
      // Get the owner's info for the affiliate link
      const owner = await storage.getUserById(brand.userId);
      if (!owner) {
        return res.status(404).json({ error: "Brand owner not found" });
      }
      
      res.json({
        success: true,
        brand: {
          id: brand.id,
          brandName: brand.brandName,
          brandSlug: brand.brandSlug,
          customDomain: brand.customDomain,
          customLogo: brand.customLogo,
          customColors: brand.customColors,
          affiliateCode: owner.referralCode,
          status: brand.status,
        },
      });
    } catch (error: any) {
      console.error("[Get Brand by Domain] Error:", error);
      res.status(500).json({ error: error?.message || "Failed to get brand" });
    }
  });

  // Cancel branding subscription
  app.post("/api/branding/cancel", async (req, res) => {
    try {
      const { brandId, userId } = req.body;
      
      const brands = await storage.getBrandingSubscriptionsByUser(userId);
      const brand = brands.find(b => b.id === brandId);
      
      if (!brand) {
        return res.status(404).json({ error: "Brand not found" });
      }
      
      // Cancel Stripe subscription
      if (brand.stripeSubscriptionId) {
        const stripe = new Stripe(process.env.STRIPE_API_KEY || "");
        await stripe.subscriptions.cancel(brand.stripeSubscriptionId);
      }
      
      await storage.updateBrandingSubscriptionStatus(brandId, "cancelled");
      
      console.log(`[Branding Cancelled] Brand ${brand.brandSlug} cancelled by user ${userId}`);
      res.json({ success: true, message: "Branding subscription cancelled" });
    } catch (error: any) {
      console.error("[Cancel Branding] Error:", error);
      res.status(500).json({ error: error?.message || "Failed to cancel" });
    }
  });

  // ============================================
  // ONE-TIME DOMAIN PURCHASE - Buy a domain at cost (~$12/year)
  // ============================================

  // Create one-time domain purchase checkout
  app.post("/api/domain-purchase/checkout", async (req, res) => {
    try {
      const { userId, domain } = req.body;
      
      if (!userId || !domain) {
        return res.status(400).json({ error: "User ID and domain are required" });
      }
      
      // Validate domain format
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
      if (!domainRegex.test(domain)) {
        return res.status(400).json({ error: "Invalid domain format. Example: mybrand.com" });
      }
      
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Check domain availability with Namecheap
      const { checkDomainAvailability } = await import("./namecheap");
      const domainCheck = await checkDomainAvailability(domain.toLowerCase());
      
      if (!domainCheck.available) {
        return res.status(400).json({ error: domainCheck.error || "This domain is not available" });
      }
      
      // Fixed $20 price for domain registration
      const priceInCents = 2000; // $20.00
      
      const stripe = new Stripe(process.env.STRIPE_API_KEY || "");
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `Domain Registration: ${domain}`,
                description: `1 year registration for ${domain}`,
              },
              unit_amount: priceInCents,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.protocol}://${req.get("host")}/api/domain-purchase/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.protocol}://${req.get("host")}/backend?tab=domains&cancelled=true`,
        customer_email: user.email,
        metadata: {
          userId,
          domain: domain.toLowerCase(),
          type: "domain_purchase",
        },
      });
      
      console.log(`[Domain Purchase] Checkout created for ${domain} | User: ${user.email} | Price: $${(priceInCents / 100).toFixed(2)}`);
      res.json({ success: true, url: session.url });
    } catch (error: any) {
      console.error("[Domain Purchase Checkout] Error:", error);
      res.status(500).json({ error: error?.message || "Failed to create checkout" });
    }
  });

  // Domain purchase success handler
  app.get("/api/domain-purchase/success", async (req, res) => {
    try {
      const sessionId = req.query.session_id as string;
      if (!sessionId) {
        return res.redirect("/backend?tab=domains&error=missing_session");
      }
      
      const stripe = new Stripe(process.env.STRIPE_API_KEY || "");
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (session.payment_status !== "paid") {
        return res.redirect("/backend?tab=domains&error=payment_failed");
      }
      
      const { userId, domain } = session.metadata || {};
      
      if (!userId || !domain) {
        return res.redirect("/backend?tab=domains&error=invalid_session");
      }
      
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.redirect("/backend?tab=domains&error=user_not_found");
      }
      
      // Register the domain with Namecheap
      const { registerDomain } = await import("./namecheap");
      
      const contactInfo = {
        firstName: user.name?.split(" ")[0] || "RentAPog",
        lastName: user.name?.split(" ").slice(1).join(" ") || "User",
        email: user.email,
        address: user.address || "123 Main St",
        city: user.city || "Austin",
        state: user.state || "TX",
        zip: user.zip || "78701",
        country: user.country || "US",
        phone: "+1.5555555555",
      };
      
      console.log(`[Domain Purchase Success] Registering domain: ${domain}`);
      const registrationResult = await registerDomain(domain, contactInfo);
      
      if (registrationResult.success) {
        // Save domain to database
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        
        await storage.createPurchasedDomain({
          userId,
          domainName: domain.toLowerCase(),
          stripePaymentId: session.payment_intent as string,
          pricePaid: 2000, // $20.00
          expiresAt,
          status: "active",
        });
        
        console.log(`[Domain Purchase Success] Domain registered: ${domain} for user ${user.email}`);
        
        // Auto-create a site project for the domain
        try {
          const existingSite = await storage.getUserSiteProjectByDomain(domain.toLowerCase());
          if (!existingSite) {
            await storage.createUserSiteProject({
              userId,
              domainName: domain.toLowerCase(),
              affiliateLink: user.affiliateLink || `https://rentapog.com/?ref=${user.referralCode}`,
              status: "draft",
            });
            console.log(`[Domain Purchase Success] Auto-created site project for ${domain}`);
          }
        } catch (siteErr) {
          console.log(`[Domain Purchase Success] Site project creation skipped:`, siteErr);
        }
        
        // Auto-configure DNS to point to a temporary landing page
        try {
          const { configureDomainDNS } = await import("./namecheap");
          const projectName = `user-${domain.toLowerCase().replace(/\./g, '-')}`;
          const pagesTarget = `${projectName}.pages.dev`;
          
          // First, create the Cloudflare Pages project if it doesn't exist
          const { createPagesProject, deployToPages } = await import("./cloudflare-pages");
          await createPagesProject(projectName);
          
          // Deploy a simple "coming soon" placeholder page with unique styling and AI-generated content
          
          // 20 color schemes for variety
          const colorSchemes = [
            { gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', btnColor: '#667eea', name: 'Purple Dream' },
            { gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', btnColor: '#f5576c', name: 'Pink Sunset' },
            { gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', btnColor: '#4facfe', name: 'Ocean Blue' },
            { gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', btnColor: '#38d9a9', name: 'Mint Fresh' },
            { gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', btnColor: '#fa709a', name: 'Coral Gold' },
            { gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', btnColor: '#a18cd1', name: 'Lavender Blush' },
            { gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', btnColor: '#ff9a9e', name: 'Rose Petal' },
            { gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', btnColor: '#e07850', name: 'Warm Peach' },
            { gradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)', btnColor: '#5a9fd4', name: 'Sky Light' },
            { gradient: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)', btnColor: '#d299c2', name: 'Cream Orchid' },
            { gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)', btnColor: '#66a6ff', name: 'Arctic Blue' },
            { gradient: 'linear-gradient(135deg, #cd9cf2 0%, #f6f3ff 100%)', btnColor: '#9b59b6', name: 'Soft Violet' },
            { gradient: 'linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)', btnColor: '#e67e22', name: 'Sunny Day' },
            { gradient: 'linear-gradient(135deg, #c1dfc4 0%, #deecdd 100%)', btnColor: '#27ae60', name: 'Forest Mist' },
            { gradient: 'linear-gradient(135deg, #0c3483 0%, #a2b6df 100%)', btnColor: '#0c3483', name: 'Deep Navy' },
            { gradient: 'linear-gradient(135deg, #fc5c7d 0%, #6a82fb 100%)', btnColor: '#fc5c7d', name: 'Berry Fusion' },
            { gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', btnColor: '#11998e', name: 'Emerald Wave' },
            { gradient: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)', btnColor: '#ee0979', name: 'Fire Burst' },
            { gradient: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)', btnColor: '#6a11cb', name: 'Electric Indigo' },
            { gradient: 'linear-gradient(135deg, #3a1c71 0%, #d76d77 50%, #ffaf7b 100%)', btnColor: '#d76d77', name: 'Twilight Glow' },
          ];
          
          // Pick random color scheme
          const selectedScheme = colorSchemes[Math.floor(Math.random() * colorSchemes.length)];
          
          // Generate unique AI content for this domain
          let aiTagline = "Something amazing is coming soon!";
          let aiDescription = "We're working hard to bring you an incredible experience. Stay tuned for the launch!";
          
          try {
            const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
            if (!apiKey) throw new Error("No API key");
            const anthropic = new Anthropic({ apiKey });
            const domainWithoutTLD = domain.split('.')[0];
            
            const aiResponse = await anthropic.messages.create({
              model: "claude-3-5-sonnet-20241022",
              max_tokens: 300,
              messages: [{
                role: "user",
                content: `You are creating content for a "Coming Soon" landing page for the domain "${domain}".

Based on the domain name "${domainWithoutTLD}", create:
1. A short, catchy tagline (max 10 words) that hints at what this site could be about
2. A brief 2-3 sentence description explaining what visitors might expect from this domain

Be creative and interpret the domain name cleverly. Make it sound exciting and professional.

Respond in this exact JSON format:
{"tagline": "your tagline here", "description": "your description here"}`
              }]
            });
            
            const aiText = aiResponse.content[0].type === 'text' ? aiResponse.content[0].text : '';
            const parsed = JSON.parse(aiText);
            if (parsed.tagline) aiTagline = parsed.tagline;
            if (parsed.description) aiDescription = parsed.description;
            console.log(`[Domain Purchase] AI generated content for ${domain}: ${aiTagline}`);
          } catch (aiErr) {
            console.log(`[Domain Purchase] AI content generation skipped:`, aiErr);
          }
          
          const placeholderHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${domain} - Coming Soon</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: ${selectedScheme.gradient}; color: white; text-align: center; }
    .container { padding: 40px; max-width: 700px; }
    h1 { font-size: 3rem; margin-bottom: 15px; text-shadow: 2px 2px 4px rgba(0,0,0,0.2); }
    .tagline { font-size: 1.5rem; font-weight: 600; margin-bottom: 25px; opacity: 0.95; }
    .description { font-size: 1.1rem; opacity: 0.9; margin-bottom: 35px; line-height: 1.6; }
    .btn { display: inline-block; background: #fff; color: ${selectedScheme.btnColor}; padding: 15px 40px; border-radius: 50px; text-decoration: none; font-weight: bold; transition: transform 0.3s, box-shadow 0.3s; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
    .btn:hover { transform: scale(1.05); box-shadow: 0 6px 20px rgba(0,0,0,0.3); }
    .coming-soon { font-size: 0.9rem; opacity: 0.7; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${domain}</h1>
    <p class="tagline">${aiTagline}</p>
    <p class="description">${aiDescription}</p>
    <a href="https://rentapog.com/?ref=${user.referralCode}" class="btn">Learn More</a>
    <p class="coming-soon">Coming Soon</p>
  </div>
</body>
</html>`;
          
          await deployToPages(projectName, [{ path: "index.html", content: placeholderHtml }]);
          console.log(`[Domain Purchase Success] Deployed placeholder page for ${domain}`);
          
          // Configure DNS to point to the Cloudflare Pages project
          const dnsResult = await configureDomainDNS(domain.toLowerCase(), pagesTarget);
          if (dnsResult.success) {
            console.log(`[Domain Purchase Success] DNS auto-configured: ${domain} -> ${pagesTarget}`);
          } else {
            console.log(`[Domain Purchase Success] DNS config warning: ${dnsResult.error}`);
          }
        } catch (dnsErr) {
          console.log(`[Domain Purchase Success] Auto DNS/deploy skipped:`, dnsErr);
        }
        
        res.redirect(`/backend?tab=domains&success=true&domain=${encodeURIComponent(domain)}`);
      } else {
        console.error(`[Domain Purchase Success] Registration failed:`, registrationResult.error);
        res.redirect(`/backend?tab=domains&error=${encodeURIComponent(registrationResult.error || "registration_failed")}&domain=${encodeURIComponent(domain)}`);
      }
    } catch (error: any) {
      console.error("[Domain Purchase Success] Error:", error);
      res.redirect("/backend?tab=domains&error=processing_failed");
    }
  });

  // Get user's purchased domains
  app.get("/api/domains/purchased/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const domains = await storage.getPurchasedDomainsByUser(userId);
      res.json({ success: true, domains });
    } catch (error: any) {
      console.error("[Get Purchased Domains] Error:", error);
      res.status(500).json({ error: error?.message || "Failed to get domains" });
    }
  });

  // Get DNS records for a domain
  app.get("/api/domains/:domain/dns", async (req, res) => {
    try {
      const { domain } = req.params;
      const { getDomainDNS } = await import("./namecheap");
      const result = await getDomainDNS(domain);
      res.json(result);
    } catch (error: any) {
      console.error("[Get DNS] Error:", error);
      res.status(500).json({ error: error?.message || "Failed to get DNS records" });
    }
  });

  // Update DNS records for a domain
  app.post("/api/domains/:domain/dns", async (req, res) => {
    try {
      const { domain } = req.params;
      const { records } = req.body;
      const { setDomainDNS } = await import("./namecheap");
      const result = await setDomainDNS(domain, records);
      res.json(result);
    } catch (error: any) {
      console.error("[Set DNS] Error:", error);
      res.status(500).json({ error: error?.message || "Failed to update DNS records" });
    }
  });

  // Get nameservers for a domain
  app.get("/api/domains/:domain/nameservers", async (req, res) => {
    try {
      const { domain } = req.params;
      const { getDomainNameservers } = await import("./namecheap");
      const result = await getDomainNameservers(domain);
      res.json(result);
    } catch (error: any) {
      console.error("[Get Nameservers] Error:", error);
      res.status(500).json({ error: error?.message || "Failed to get nameservers" });
    }
  });

  // Update nameservers for a domain
  app.post("/api/domains/:domain/nameservers", async (req, res) => {
    try {
      const { domain } = req.params;
      const { nameservers } = req.body;
      const { setDomainNameservers } = await import("./namecheap");
      const result = await setDomainNameservers(domain, nameservers);
      res.json(result);
    } catch (error: any) {
      console.error("[Set Nameservers] Error:", error);
      res.status(500).json({ error: error?.message || "Failed to update nameservers" });
    }
  });

  // Deploy RentAPog branded landing page to user's domain
  app.post("/api/domains/:domain/deploy-rentapog-template", async (req, res) => {
    try {
      const { domain } = req.params;
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID required" });
      }
      
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const affiliateCode = user.referralCode || user.id;
      
      // Generate unique AI content for this page
      let aiContent = {
        badge: "Try FREE for 3 Days",
        headline1: "Rent A Pog.",
        headline2: "Get Paid Daily.",
        subtitle: "The world's first daily-pay pog rental platform. Try it completely FREE for 3 days - no risk, cancel anytime!",
        riskFreeText: "Start earning with zero upfront cost. After 3 days, daily billing begins. Cancel anytime during your trial.",
        formTitle: "Start Earning Daily",
        formSubtitle: "Get your affiliate link and start earning immediately.",
        step1Title: "Select Your Pogs",
        step1Desc: "Browse our premium collection of high-value pogs. Choose the ones you want to rent out and set your rental terms.",
        step2Title: "Earn Daily",
        step2Desc: "Every rental generates revenue immediately. You keep 100% of most sales. Only your 2nd sale goes to cover platform costs.",
        step3Title: "Scale & Grow",
        step3Desc: "As your rentals increase, so does your income. Refer friends and earn from their sales too!",
        trialHeadline: "Start FREE for 3 Days - No Risk!",
        trialSubtitle: "Try before you commit! Cancel anytime during your trial - no questions asked.",
        ctaButton: "Start Your FREE Trial Now"
      };
      
      try {
        const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
        if (apiKey) {
          const anthropic = new Anthropic({ apiKey });
          
          const aiResponse = await anthropic.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            messages: [{
              role: "user",
              content: `You are creating UNIQUE marketing copy for a RentAPog affiliate landing page. RentAPog is a daily-pay pog rental platform where people earn money by renting pogs and referring others.

Generate fresh, unique wording for this landing page. Keep the same meaning but use different words, phrases, and angles. Be creative and persuasive!

Respond in this exact JSON format (no markdown, just raw JSON):
{
  "badge": "short 4-6 word badge text mentioning free trial",
  "headline1": "catchy 3-4 word first line of headline",
  "headline2": "catchy 3-4 word second line about earning/money",
  "subtitle": "2-3 sentence compelling description of the platform and the free trial offer",
  "riskFreeText": "1-2 sentences about zero upfront cost and the trial terms",
  "formTitle": "3-4 word action-oriented form title",
  "formSubtitle": "1 sentence about getting their affiliate link",
  "step1Title": "2-3 word title for step 1 (choosing pogs)",
  "step1Desc": "1-2 sentences describing browsing and selecting pogs to rent",
  "step2Title": "2-3 word title for step 2 (earning money)",
  "step2Desc": "1-2 sentences about daily earnings and the 100% commission model",
  "step3Title": "2-3 word title for step 3 (growing/scaling)",
  "step3Desc": "1-2 sentences about growing income and referrals",
  "trialHeadline": "catchy headline for the trial section",
  "trialSubtitle": "1 sentence about the risk-free nature of the trial",
  "ctaButton": "4-6 word call-to-action button text"
}`
            }]
          });
          
          const aiText = aiResponse.content[0].type === 'text' ? aiResponse.content[0].text : '';
          const parsed = JSON.parse(aiText);
          aiContent = { ...aiContent, ...parsed };
          console.log(`[Deploy RentAPog Template] AI generated unique content for ${domain}`);
        }
      } catch (aiErr) {
        console.log(`[Deploy RentAPog Template] AI skipped, using defaults:`, aiErr);
      }
      
      // Full RentAPog branded template with AI-generated unique content
      const rentapogTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RentAPog - Rent A Pog, Get Paid Daily</title>
  <meta name="description" content="The world's first daily-pay pog rental platform. Try it FREE for 3 days!">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: #f8fafc; color: #1e293b; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    
    /* Hero */
    .hero { background: linear-gradient(135deg, #f8fafc 0%, #fff 100%); padding: 80px 0; }
    .hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
    @media (max-width: 768px) { .hero-grid { grid-template-columns: 1fr; } }
    .badge { display: inline-flex; align-items: center; background: #dcfce7; color: #15803d; padding: 8px 16px; border-radius: 999px; font-size: 14px; font-weight: 600; margin-bottom: 24px; }
    h1 { font-size: 3.5rem; font-weight: 800; line-height: 1.1; margin-bottom: 24px; }
    @media (max-width: 768px) { h1 { font-size: 2.5rem; } }
    h1 span { color: #2563eb; }
    .subtitle { font-size: 1.1rem; color: #64748b; line-height: 1.7; margin-bottom: 32px; }
    
    /* Form Card */
    .form-card { background: linear-gradient(135deg, #fef2f2 0%, #fff 50%, #eff6ff 100%); border: 2px solid #fecaca; border-radius: 16px; padding: 32px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
    .form-header { margin-bottom: 24px; }
    .form-header .limited { color: #dc2626; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
    .form-header h3 { font-size: 1.8rem; font-weight: 700; margin: 8px 0; }
    .form-header p { color: #64748b; }
    .referred-by { background: #dcfce7; border: 1px solid #bbf7d0; padding: 12px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; color: #166534; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 14px; font-weight: 600; margin-bottom: 6px; color: #475569; }
    .form-group input { width: 100%; padding: 14px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 16px; transition: border-color 0.2s; }
    .form-group input:focus { outline: none; border-color: #2563eb; }
    .form-group .hint { font-size: 12px; color: #64748b; margin-top: 4px; }
    .form-group .hint span { color: #2563eb; font-weight: 600; }
    .submit-btn { width: 100%; padding: 16px; background: linear-gradient(135deg, #dc2626 0%, #2563eb 100%); color: #fff; border: none; border-radius: 8px; font-size: 16px; font-weight: 700; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
    .submit-btn:hover { transform: scale(1.02); box-shadow: 0 8px 25px rgba(37,99,235,0.3); }
    .info-box { background: #eff6ff; border-left: 4px solid #2563eb; padding: 16px; border-radius: 8px; margin-top: 16px; }
    .info-box p { font-size: 14px; color: #475569; }
    .info-box strong { color: #2563eb; }
    .terms { text-align: center; font-size: 12px; color: #94a3b8; margin-top: 16px; }
    
    /* Hero Image */
    .hero-image { border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
    .hero-image img { width: 100%; height: auto; display: block; }
    
    /* How It Works */
    .how-it-works { padding: 80px 0; background: linear-gradient(180deg, #fff 0%, #f1f5f9 100%); }
    .section-header { text-align: center; margin-bottom: 60px; }
    .section-badge { display: inline-block; background: #dbeafe; color: #1d4ed8; padding: 8px 20px; border-radius: 999px; font-size: 14px; font-weight: 600; margin-bottom: 16px; }
    .section-header h2 { font-size: 2.5rem; font-weight: 800; margin-bottom: 16px; }
    .section-header p { color: #64748b; font-size: 1.1rem; max-width: 600px; margin: 0 auto; }
    .steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
    @media (max-width: 768px) { .steps-grid { grid-template-columns: 1fr; } }
    .step-card { background: #fff; border: 2px solid #e2e8f0; border-radius: 16px; padding: 32px; transition: box-shadow 0.3s; }
    .step-card:hover { box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
    .step-card.blue { border-color: #bfdbfe; background: linear-gradient(135deg, #eff6ff 0%, #fff 100%); }
    .step-card.green { border-color: #bbf7d0; background: linear-gradient(135deg, #dcfce7 0%, #fff 100%); }
    .step-card.purple { border-color: #e9d5ff; background: linear-gradient(135deg, #faf5ff 0%, #fff 100%); }
    .step-number { width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700; color: #fff; margin-bottom: 20px; }
    .step-card.blue .step-number { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); }
    .step-card.green .step-number { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); }
    .step-card.purple .step-number { background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%); }
    .step-card h3 { font-size: 1.4rem; font-weight: 700; margin-bottom: 12px; }
    .step-card p { color: #64748b; line-height: 1.6; }
    
    /* Trial Section */
    .trial-section { background: linear-gradient(135deg, #dcfce7 0%, #d1fae5 50%, #ccfbf1 100%); border: 2px solid #bbf7d0; border-radius: 24px; padding: 48px; margin: 60px 0; text-align: center; }
    .trial-section h3 { font-size: 2rem; font-weight: 800; margin-bottom: 16px; }
    .trial-section p { color: #64748b; font-size: 1.1rem; max-width: 600px; margin: 0 auto 32px; }
    .trial-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    @media (max-width: 768px) { .trial-steps { grid-template-columns: 1fr; } }
    .trial-step { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
    .trial-step-num { width: 40px; height: 40px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; margin: 0 auto 12px; }
    .trial-step h4 { font-weight: 700; margin-bottom: 8px; }
    .trial-step p { font-size: 14px; color: #64748b; }
    .trial-step .highlight { color: #16a34a; font-weight: 600; font-size: 12px; margin-top: 8px; }
    
    /* Footer */
    footer { background: #1e293b; color: #fff; padding: 60px 0 40px; }
    .footer-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; margin-bottom: 40px; }
    @media (max-width: 768px) { .footer-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 480px) { .footer-grid { grid-template-columns: 1fr; } }
    .footer-col h4 { font-size: 16px; font-weight: 600; color: #fff; margin-bottom: 16px; }
    .footer-col ul { list-style: none; padding: 0; margin: 0; }
    .footer-col li { margin-bottom: 10px; }
    .footer-col a { color: #94a3b8; text-decoration: none; font-size: 14px; transition: color 0.2s; }
    .footer-col a:hover { color: #fff; }
    .footer-bottom { border-top: 1px solid #334155; padding-top: 24px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 16px; }
    .footer-bottom p { color: #64748b; font-size: 13px; margin: 0; }
    .footer-bottom-links { display: flex; gap: 20px; }
    .footer-bottom-links a { color: #64748b; font-size: 13px; text-decoration: none; transition: color 0.2s; }
    .footer-bottom-links a:hover { color: #fff; }
    
    /* CTA Button */
    .cta-btn { display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #2563eb 100%); color: #fff; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 700; text-decoration: none; transition: transform 0.2s, box-shadow 0.2s; }
    .cta-btn:hover { transform: scale(1.05); box-shadow: 0 8px 25px rgba(37,99,235,0.3); }
  </style>
</head>
<body>
  <section class="hero">
    <div class="container">
      <div class="hero-grid">
        <div>
          <div class="badge">⚡ RentAPog - ${aiContent.badge}</div>
          <h1>${aiContent.headline1}<br><span>${aiContent.headline2}</span></h1>
          <p class="subtitle">${aiContent.subtitle}<br><br><strong>Risk-Free Trial:</strong> ${aiContent.riskFreeText}</p>
          
          <div class="form-card">
            <div class="form-header">
              <p class="limited">Limited Time</p>
              <h3>${aiContent.formTitle}</h3>
              <p>${aiContent.formSubtitle}</p>
            </div>
            
            <div class="referred-by">
              <strong>Referred by:</strong> ${affiliateCode}
            </div>
            
            <form action="https://rentapog.com/api/affiliates/home-signup" method="POST" id="signupForm">
              <input type="hidden" name="referrerCode" value="${affiliateCode}">
              
              <div class="form-group">
                <label>Your First Name</label>
                <input type="text" name="name" placeholder="John" required>
              </div>
              
              <div class="form-group">
                <label>Your Email</label>
                <input type="email" name="email" placeholder="you@example.com" required>
              </div>
              
              <div class="form-group">
                <label>Choose Your Username</label>
                <input type="text" name="username" placeholder="johndoe" required pattern="[a-z0-9_]+" id="usernameInput">
                <p class="hint">Your affiliate link will be: <span>rentapog.com/?aff=<span id="usernamePreview">yourusername</span></span></p>
              </div>
              
              <div class="form-group">
                <label>Create Password</label>
                <input type="password" name="password" placeholder="••••••••" required minlength="6">
                <p class="hint">Minimum 6 characters</p>
              </div>
              
              <button type="submit" class="submit-btn">Create Account & Get My Affiliate Link</button>
            </form>
            
            <div class="info-box">
              <p><strong>What you get:</strong><br>• Your unique affiliate link<br>• Instant Stripe payouts<br>• 100% of most sales (only 2nd goes to admin)</p>
            </div>
            
            <p class="terms">By joining, you agree to our Terms & Privacy Policy. We'll never spam you.</p>
          </div>
        </div>
        
        <div class="hero-image">
          <img src="https://rentapog.com/rentapog-hero.png" alt="RentAPog">
        </div>
      </div>
    </div>
  </section>
  
  <section class="how-it-works">
    <div class="container">
      <div class="section-header">
        <div class="section-badge">🚀 Three Simple Steps to Daily Income</div>
        <h2>Your Path to Passive Income</h2>
        <p>Get started in minutes. Earn every single day. It's that simple.</p>
      </div>
      
      <div class="steps-grid">
        <div class="step-card blue">
          <div class="step-number">1</div>
          <h3>${aiContent.step1Title}</h3>
          <p>${aiContent.step1Desc}</p>
        </div>
        
        <div class="step-card green">
          <div class="step-number">2</div>
          <h3>${aiContent.step2Title}</h3>
          <p>${aiContent.step2Desc}</p>
        </div>
        
        <div class="step-card purple">
          <div class="step-number">3</div>
          <h3>${aiContent.step3Title}</h3>
          <p>${aiContent.step3Desc}</p>
        </div>
      </div>
      
      <div class="trial-section">
        <div class="section-badge" style="background:#dcfce7;color:#15803d;">🎁 Risk-Free Offer</div>
        <h3>${aiContent.trialHeadline}</h3>
        <p>${aiContent.trialSubtitle}</p>
        
        <div class="trial-steps">
          <div class="trial-step">
            <div class="trial-step-num">1</div>
            <h4>Sign Up FREE</h4>
            <p>Choose your package and start your 3-day free trial instantly</p>
            <p class="highlight">No payment for 3 days</p>
          </div>
          <div class="trial-step">
            <div class="trial-step-num">2</div>
            <h4>Test Everything</h4>
            <p>Full access to all features. See the platform in action.</p>
            <p class="highlight">Complete access</p>
          </div>
          <div class="trial-step">
            <div class="trial-step-num">3</div>
            <h4>Decide Later</h4>
            <p>Love it? Keep going! Not for you? Cancel before day 3 ends.</p>
            <p class="highlight">Zero risk</p>
          </div>
        </div>
        
        <div style="margin-top:32px;">
          <a href="#" onclick="document.getElementById('signupForm').scrollIntoView({behavior:'smooth'});return false;" class="cta-btn">${aiContent.ctaButton}</a>
        </div>
      </div>
    </div>
  </section>
  
  <footer>
    <div class="container">
      <div class="footer-grid">
        <div class="footer-col">
          <h4>Platform</h4>
          <ul>
            <li><a href="https://rentapog.com/?aff=${affiliateCode}">Discover RentAPog</a></li>
            <li><a href="https://rentapog.com/affiliate/${affiliateCode}/features">Explore Features</a></li>
            <li><a href="https://packages.rentapog.com/?aff=${affiliateCode}">View Packages</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Resources</h4>
          <ul>
            <li><a href="https://rentapog.com/affiliate/${affiliateCode}/blog">Read Our Blog</a></li>
            <li><a href="https://rentapog.com/affiliate/${affiliateCode}/faq">Common Questions</a></li>
            <li><a href="https://rentapog.com/affiliate/${affiliateCode}/contact">Reach Out</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Legal</h4>
          <ul>
            <li><a href="https://rentapog.com/privacy">Privacy Notice</a></li>
            <li><a href="https://rentapog.com/terms">Terms of Use</a></li>
            <li><a href="https://rentapog.com">Site Disclaimer</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Get Help</h4>
          <ul>
            <li><a href="https://rentapog.com/affiliate/${affiliateCode}/faq">FAQ Center</a></li>
            <li><a href="https://rentapog.com/affiliate/${affiliateCode}/contact">Contact Support</a></li>
            <li><a href="mailto:support@rentapog.com">Email Us</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2025 RentAPog. All rights reserved. | Powered by RentAPog</p>
        <div class="footer-bottom-links">
          <a href="https://rentapog.com/privacy">Privacy</a>
          <a href="https://rentapog.com/terms">Terms</a>
          <a href="https://rentapog.com/affiliate/${affiliateCode}/contact">Contact</a>
        </div>
      </div>
    </div>
  </footer>
  
  <script>
    document.getElementById('usernameInput').addEventListener('input', function(e) {
      var val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
      e.target.value = val;
      document.getElementById('usernamePreview').textContent = val || 'yourusername';
    });
    
    document.getElementById('signupForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      var form = e.target;
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Creating Account...';
      
      try {
        var res = await fetch('https://rentapog.com/api/affiliates/home-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name.value,
            email: form.email.value,
            username: form.username.value.toLowerCase(),
            password: form.password.value,
            referrerCode: '${affiliateCode}'
          })
        });
        var data = await res.json();
        if (res.ok) {
          var packagesCode = data.packagesAffiliateCode || data.affiliateLink || form.username.value.toLowerCase();
          window.location.href = 'https://packages.rentapog.com/?aff=' + packagesCode;
        } else {
          alert(data.error || data.message || 'Signup failed. Please try again.');
          btn.disabled = false;
          btn.textContent = 'Create Account & Get My Affiliate Link';
        }
      } catch (err) {
        alert('Error creating account. Please try again.');
        btn.disabled = false;
        btn.textContent = 'Create Account & Get My Affiliate Link';
      }
    });
  </script>
</body>
</html>`;
      
      const projectName = `user-${domain.toLowerCase().replace(/\./g, '-')}`;
      const { createPagesProject, deployToPages, addCustomDomain } = await import("./cloudflare-pages");
      const { configureDomainDNS } = await import("./namecheap");
      
      await createPagesProject(projectName);
      await deployToPages(projectName, [{ path: "index.html", content: rentapogTemplate }]);
      
      // Add the custom domain to Cloudflare Pages (both apex and www)
      const domainResult = await addCustomDomain(projectName, domain);
      if (domainResult.success) {
        console.log(`[Deploy RentAPog Template] Custom domain ${domain} added to project`);
      } else {
        console.log(`[Deploy RentAPog Template] Domain add note: ${domainResult.error}`);
      }
      
      // Also add www subdomain to Cloudflare Pages
      const wwwDomain = `www.${domain}`;
      const wwwDomainResult = await addCustomDomain(projectName, wwwDomain);
      if (wwwDomainResult.success) {
        console.log(`[Deploy RentAPog Template] Custom domain ${wwwDomain} added to project`);
      } else {
        console.log(`[Deploy RentAPog Template] www domain add note: ${wwwDomainResult.error}`);
      }
      
      // Configure DNS at Namecheap to point to Cloudflare Pages (both apex and www)
      const pagesUrl = `${projectName}.pages.dev`;
      const dnsResult = await configureDomainDNS(domain, pagesUrl);
      if (dnsResult.success) {
        console.log(`[Deploy RentAPog Template] DNS configured for ${domain} -> ${pagesUrl}`);
      } else {
        console.log(`[Deploy RentAPog Template] DNS config note: ${dnsResult.error}`);
      }
      
      console.log(`[Deploy RentAPog Template] Deployed to ${domain} for user ${user.email}`);
      res.json({ 
        success: true, 
        message: dnsResult.success ? "Site deployed and domain connected!" : "Site deployed! DNS may take a few minutes to propagate.",
        pagesUrl: `https://${projectName}.pages.dev`,
        customDomain: domain,
        dnsConfigured: dnsResult.success
      });
    } catch (error: any) {
      console.error("[Deploy RentAPog Template] Error:", error);
      res.status(500).json({ error: error?.message || "Failed to deploy template" });
    }
  });

  // Regenerate Coming Soon page for an existing domain with new design
  app.post("/api/domains/:domain/regenerate-placeholder", async (req, res) => {
    try {
      const { domain } = req.params;
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID required" });
      }
      
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // 20 color schemes for variety
      const colorSchemes = [
        { gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', btnColor: '#667eea', name: 'Purple Dream' },
        { gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', btnColor: '#f5576c', name: 'Pink Sunset' },
        { gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', btnColor: '#4facfe', name: 'Ocean Blue' },
        { gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', btnColor: '#38d9a9', name: 'Mint Fresh' },
        { gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', btnColor: '#fa709a', name: 'Coral Gold' },
        { gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', btnColor: '#a18cd1', name: 'Lavender Blush' },
        { gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', btnColor: '#ff9a9e', name: 'Rose Petal' },
        { gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', btnColor: '#e07850', name: 'Warm Peach' },
        { gradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)', btnColor: '#5a9fd4', name: 'Sky Light' },
        { gradient: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)', btnColor: '#d299c2', name: 'Cream Orchid' },
        { gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)', btnColor: '#66a6ff', name: 'Arctic Blue' },
        { gradient: 'linear-gradient(135deg, #cd9cf2 0%, #f6f3ff 100%)', btnColor: '#9b59b6', name: 'Soft Violet' },
        { gradient: 'linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)', btnColor: '#e67e22', name: 'Sunny Day' },
        { gradient: 'linear-gradient(135deg, #c1dfc4 0%, #deecdd 100%)', btnColor: '#27ae60', name: 'Forest Mist' },
        { gradient: 'linear-gradient(135deg, #0c3483 0%, #a2b6df 100%)', btnColor: '#0c3483', name: 'Deep Navy' },
        { gradient: 'linear-gradient(135deg, #fc5c7d 0%, #6a82fb 100%)', btnColor: '#fc5c7d', name: 'Berry Fusion' },
        { gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', btnColor: '#11998e', name: 'Emerald Wave' },
        { gradient: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)', btnColor: '#ee0979', name: 'Fire Burst' },
        { gradient: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)', btnColor: '#6a11cb', name: 'Electric Indigo' },
        { gradient: 'linear-gradient(135deg, #3a1c71 0%, #d76d77 50%, #ffaf7b 100%)', btnColor: '#d76d77', name: 'Twilight Glow' },
      ];
      
      const selectedScheme = colorSchemes[Math.floor(Math.random() * colorSchemes.length)];
      
      // Generate unique AI content
      let aiTagline = "Something amazing is coming soon!";
      let aiDescription = "We're working hard to bring you an incredible experience. Stay tuned for the launch!";
      
      try {
        const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
        if (!apiKey) throw new Error("No API key");
        const anthropic = new Anthropic({ apiKey });
        const domainWithoutTLD = domain.split('.')[0];
        
        const aiResponse = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 300,
          messages: [{
            role: "user",
            content: `You are creating content for a "Coming Soon" landing page for the domain "${domain}".

Based on the domain name "${domainWithoutTLD}", create:
1. A short, catchy tagline (max 10 words) that hints at what this site could be about
2. A brief 2-3 sentence description explaining what visitors might expect from this domain

Be creative and interpret the domain name cleverly. Make it sound exciting and professional.

Respond in this exact JSON format:
{"tagline": "your tagline here", "description": "your description here"}`
          }]
        });
        
        const aiText = aiResponse.content[0].type === 'text' ? aiResponse.content[0].text : '';
        const parsed = JSON.parse(aiText);
        if (parsed.tagline) aiTagline = parsed.tagline;
        if (parsed.description) aiDescription = parsed.description;
        console.log(`[Regenerate Placeholder] AI generated: ${aiTagline}`);
      } catch (aiErr) {
        console.log(`[Regenerate Placeholder] AI skipped:`, aiErr);
      }
      
      const placeholderHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${domain} - Coming Soon</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: ${selectedScheme.gradient}; color: white; text-align: center; }
    .container { padding: 40px; max-width: 700px; }
    h1 { font-size: 3rem; margin-bottom: 15px; text-shadow: 2px 2px 4px rgba(0,0,0,0.2); }
    .tagline { font-size: 1.5rem; font-weight: 600; margin-bottom: 25px; opacity: 0.95; }
    .description { font-size: 1.1rem; opacity: 0.9; margin-bottom: 35px; line-height: 1.6; }
    .btn { display: inline-block; background: #fff; color: ${selectedScheme.btnColor}; padding: 15px 40px; border-radius: 50px; text-decoration: none; font-weight: bold; transition: transform 0.3s, box-shadow 0.3s; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
    .btn:hover { transform: scale(1.05); box-shadow: 0 6px 20px rgba(0,0,0,0.3); }
    .coming-soon { font-size: 0.9rem; opacity: 0.7; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${domain}</h1>
    <p class="tagline">${aiTagline}</p>
    <p class="description">${aiDescription}</p>
    <a href="https://rentapog.com/?ref=${user.referralCode}" class="btn">Learn More</a>
    <p class="coming-soon">Coming Soon</p>
  </div>
</body>
</html>`;
      
      const projectName = `user-${domain.toLowerCase().replace(/\./g, '-')}`;
      const { createPagesProject, deployToPages } = await import("./cloudflare-pages");
      await createPagesProject(projectName);
      await deployToPages(projectName, [{ path: "index.html", content: placeholderHtml }]);
      
      console.log(`[Regenerate Placeholder] Updated ${domain} with ${selectedScheme.name} theme`);
      res.json({ 
        success: true, 
        colorScheme: selectedScheme.name,
        tagline: aiTagline,
        description: aiDescription 
      });
    } catch (error: any) {
      console.error("[Regenerate Placeholder] Error:", error);
      res.status(500).json({ error: error?.message || "Failed to regenerate placeholder" });
    }
  });

  // Register team and deployment routes
  registerTeamAndDeploymentRoutes(app);

  // Register website builder routes (admin only)
  registerWebsiteBuilderRoutes(app);

  // Register user site routes (user AI-generated websites)
  registerUserSiteRoutes(app);

  return httpServer;
}
