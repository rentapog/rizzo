import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Available niches for domain categorization and affiliate preferences
export const DOMAIN_NICHES = [
  "crypto",
  "finance", 
  "health",
  "tech",
  "travel",
  "food",
  "gaming",
  "sports",
  "fashion",
  "education",
  "business",
  "entertainment",
  "real-estate",
  "automotive",
  "other"
] as const;

export type DomainNiche = typeof DOMAIN_NICHES[number];

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(), // Hashed password
  name: text("name"),
  address: text("address"), // Street address
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  country: text("country"),
  referralCode: text("referral_code").notNull().unique(),
  referredBy: varchar("referred_by"),
  salesCount: integer("sales_count").notNull().default(0),
  affiliateLink: text("affiliate_link").notNull().default("admin"), // Defaults to admin if no affiliate provided
  packageAffiliateLink: text("package_affiliate_link"), // Affiliate link for package upgrades
  accountBalance: integer("account_balance").notNull().default(0), // In cents
  referralBalance: integer("referral_balance").notNull().default(0), // Referral earnings in cents (offsets daily fees)
  subscriptionStatus: text("subscription_status").notNull().default("active"), // active, cancelled
  isActive: boolean("is_active").notNull().default(true), // Whether account can login
  lastPaymentDate: timestamp("last_payment_date"),
  packagePurchased: integer("package_purchased"), // Package price in cents ($29, $49, $99, etc)
  stripeAccountId: text("stripe_account_id"), // Stripe Connect account ID for payouts
  passwordResetToken: text("password_reset_token"), // Token for password reset
  passwordResetExpires: timestamp("password_reset_expires"), // When reset token expires
  nichePreferences: text("niche_preferences"), // Comma-separated list of niches user wants notifications for
  emailNotificationsEnabled: boolean("email_notifications_enabled").notNull().default(true), // Whether user wants domain listing emails
  subdomain: text("subdomain").unique(), // User's registered subdomain (e.g., "joey" for joey.rentapog.com)
  // Trial and daily billing fields
  trialStartedAt: timestamp("trial_started_at"), // When 7-day trial began (after paying join fee)
  trialEndsAt: timestamp("trial_ends_at"), // When trial is scheduled to end (7 days from start)
  trialStatus: text("trial_status"), // 'active', 'ended', null (not started)
  trialEndReason: text("trial_end_reason"), // 'time_expired', 'referrals_met', null
  joinFeePaidAt: timestamp("join_fee_paid_at"), // When user paid the join fee
  requiresDailyBilling: boolean("requires_daily_billing").notNull().default(false), // Whether daily charges apply
  referralCountAtTrialStart: integer("referral_count_at_trial_start").notNull().default(0), // Referrals at trial start
  lastDailyChargeAt: timestamp("last_daily_charge_at"), // Last successful daily charge
  dailyChargeAmount: integer("daily_charge_amount"), // Daily charge amount in cents (based on package tier)
  isSubAdmin: boolean("is_sub_admin").notNull().default(false), // Sub-admins get their own 2nd pass-ups
  subAdminCreatedBy: varchar("sub_admin_created_by"), // ID of main admin who created this sub-admin
  subAdminPin: text("sub_admin_pin"), // Hashed PIN for sub-admin authentication (like admin PIN)
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const emailLeads = pgTable("email_leads", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  source: text("source").notNull().default("homepage"),
  syncedToAweber: boolean("synced_to_aweber").notNull().default(false),
  affiliateLink: text("affiliate_link"), // Which affiliate referred them
  assignedAffiliate: text("assigned_affiliate"), // Their affiliate link after signup
  verificationToken: text("verification_token"), // Token for email verification
  verified: boolean("verified").notNull().default(false), // Whether email has been verified
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const domainRentals = pgTable("domain_rentals", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  domainName: text("domain_name").notNull(),
  dailyRate: integer("daily_rate").notNull(),
  stripePaymentId: text("stripe_payment_id"),
  status: text("status").notNull().default("active"),
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date"),
  forwardUrl: text("forward_url"), // URL to forward domain traffic to (affiliate link)
  ownerDefaultForwardUrl: text("owner_default_forward_url"), // Owner's default forwarding URL (reverts to this after rental)
  isListedForRent: boolean("is_listed_for_rent").notNull().default(false), // Whether owner wants to rent out
  rentalSalesCount: integer("rental_sales_count").notNull().default(0), // Track sales for pass-up logic
  promoCode: text("promo_code").unique(), // Unique promo code for this domain (e.g., "crypto-ABC123")
  promotedBy: varchar("promoted_by"), // User ID who promoted this rental through promo link
  registrationPaidDate: timestamp("registration_paid_date"), // When first registration payment was made
  renewalDueDate: timestamp("renewal_due_date"), // When domain renewal is due (1 year from registration)
  registrationCost: integer("registration_cost"), // Cost paid for initial registration in cents
  lastRenewalPaymentId: text("last_renewal_payment_id"), // Stripe payment ID for last renewal
  niche: text("niche"), // Domain category (crypto, finance, health, etc.)
});

// Track active rental contracts (someone renting from an owner)
export const rentalContracts = pgTable("rental_contracts", {
  id: serial("id").primaryKey(),
  domainRentalId: integer("domain_rental_id").notNull(), // Reference to domain_rentals.id
  ownerId: varchar("owner_id").notNull(), // The domain owner
  renterId: varchar("renter_id").notNull(), // The person renting the domain
  status: text("status").notNull().default("active"), // active, expired, cancelled
  dailyRate: integer("daily_rate").notNull().default(2000), // $20/day in cents
  startAt: timestamp("start_at").notNull().defaultNow(),
  currentEndAt: timestamp("current_end_at"), // When current rental period ends
  stripeSubscriptionId: text("stripe_subscription_id"), // Stripe subscription for daily billing
  forwardUrlDuringRental: text("forward_url_during_rental"), // Renter's affiliate link
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Track each daily rental charge with pass-up logic
export const rentalCharges = pgTable("rental_charges", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").notNull(), // Reference to rental_contracts.id
  domainRentalId: integer("domain_rental_id").notNull(), // Reference to domain_rentals.id
  ownerId: varchar("owner_id").notNull(), // Domain owner
  renterId: varchar("renter_id").notNull(), // Renter
  amount: integer("amount").notNull(), // Amount in cents ($20 = 2000)
  creditedUserId: varchar("credited_user_id"), // Who got the money (owner or admin)
  passedUpTo: varchar("passed_up_to"), // 'admin' if passed up
  passUpReason: text("pass_up_reason"), // 'sale_2', 'under_leveled', null
  saleNumber: integer("sale_number").notNull(), // Which rental sale this is for the owner
  stripeInvoiceId: text("stripe_invoice_id"),
  stripePaymentId: text("stripe_payment_id"),
  status: text("status").notNull().default("paid"), // paid, failed, refunded
  chargedAt: timestamp("charged_at").notNull().defaultNow(),
});

// Track domain listing notifications sent to affiliates
export const domainNotifications = pgTable("domain_notifications", {
  id: serial("id").primaryKey(),
  domainId: integer("domain_id").notNull(), // Reference to domain_rentals.id
  userId: varchar("user_id").notNull(), // Affiliate who received notification
  sentAt: timestamp("sent_at").notNull().defaultNow(),
  status: text("status").notNull().default("sent"), // sent, opened, clicked
});

export const affiliateSales = pgTable("affiliate_sales", {
  id: serial("id").primaryKey(),
  sellerId: varchar("seller_id").notNull(),
  buyerId: varchar("buyer_id").notNull(),
  amount: integer("amount").notNull(),
  passedUpTo: varchar("passed_up_to"),
  saleNumber: integer("sale_number").notNull(),
  stripePaymentId: text("stripe_payment_id"),
  sellerLevel: integer("seller_level"), // Seller's package level at time of sale (in cents)
  buyerLevel: integer("buyer_level"), // Buyer's package level (in cents)
  passedUpReason: text("passed_up_reason"), // 'sale_2', 'under_leveled', 'sale_2_tier' null if not passed up
  tierSaleNumber: integer("tier_sale_number"), // Sale number for this specific tier
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Track sales count per package tier for each user
export const userTierSales = pgTable("user_tier_sales", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  packageAmount: integer("package_amount").notNull(), // 2000 = $20, 9900 = $99, 19900 = $199
  salesCount: integer("sales_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const emailSchedules = pgTable("email_schedules", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  emailType: text("email_type").notNull(), // day0, day2, day4, day6, day8, day10, day14
  scheduledFor: timestamp("scheduled_for").notNull(),
  sentAt: timestamp("sent_at"),
  status: text("status").notNull().default("pending"), // pending, sent, failed
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const affiliatePages = pgTable("affiliate_pages", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  slug: text("slug").notNull().unique(), // e.g., "seobrainai" -> rentapog.com/affiliate/seobrainai
  displayName: text("display_name").notNull(), // User-friendly name for branding
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const adminDomains = pgTable("admin_domains", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  domainName: text("domain_name").notNull(), // e.g., "rentariz"
  forwardingLink: text("forwarding_link").notNull(), // https://rentapog.com/forward/rentariz
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  ownerId: varchar("owner_id").notNull(), // The admin who owns the backoffice
  memberEmail: text("member_email").notNull(),
  memberName: text("member_name"),
  role: text("role").notNull().default("editor"), // editor, viewer
  canDeploy: boolean("can_deploy").notNull().default(false), // Can this member deploy?
  status: text("status").notNull().default("pending"), // pending, active, revoked
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const deploymentSettings = pgTable("deployment_settings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique(),
  deploymentEnabled: boolean("deployment_enabled").notNull().default(false), // Toggle to enable/disable deployment
  lastDeployedAt: timestamp("last_deployed_at"),
  lastDeployedBy: varchar("last_deployed_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const emailCampaigns = pgTable("email_campaigns", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  recipientEmail: text("recipient_email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  affiliateLink: text("affiliate_link").notNull(),
  status: text("status").notNull().default("pending"), // pending, sent, failed
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const adminSessions = pgTable("admin_sessions", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  email: text("email").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const adminLoginAttempts = pgTable("admin_login_attempts", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  ipAddress: text("ip_address"),
  attemptCount: integer("attempt_count").notNull().default(0),
  lastAttemptAt: timestamp("last_attempt_at").notNull().defaultNow(),
  lockedUntil: timestamp("locked_until"),
});

// Branding subscriptions - $29/month white-label franchise sites
export const brandingSubscriptions = pgTable("branding_subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(), // The affiliate who owns this branding
  brandName: text("brand_name").notNull(), // e.g., "Rent a Crypto" -> slug will be "rentacrypto"
  brandSlug: text("brand_slug").notNull().unique(), // URL-safe slug for the branded site
  customDomain: text("custom_domain").unique(), // Full custom domain (e.g., rentacars.com)
  domainRegistered: boolean("domain_registered").notNull().default(false), // Whether domain was successfully registered
  domainRegistrationDate: timestamp("domain_registration_date"), // When domain was registered
  stripeSubscriptionId: text("stripe_subscription_id"), // Stripe subscription for $29/month
  status: text("status").notNull().default("active"), // active, cancelled, past_due
  customLogo: text("custom_logo"), // URL to custom logo if any
  customColors: text("custom_colors"), // JSON string of custom color scheme
  salesCount: integer("sales_count").notNull().default(0), // Track sales for pass-up logic
  createdAt: timestamp("created_at").notNull().defaultNow(),
  cancelledAt: timestamp("cancelled_at"),
});

export const loginTokens = pgTable("login_tokens", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  stripeSessionId: text("stripe_session_id").notNull(),
  email: text("email").notNull(),
  packageAmount: integer("package_amount").notNull(),
  used: boolean("used").notNull().default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Purchased domains - domains bought through the $20 domain purchase feature
export const purchasedDomains = pgTable("purchased_domains", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  domainName: text("domain_name").notNull().unique(),
  stripePaymentId: text("stripe_payment_id"),
  expiresAt: timestamp("expires_at"), // 1 year from registration
  nameservers: text("nameservers"), // JSON array of nameservers
  status: text("status").notNull().default("active"), // active, expired, transferred
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Admin website projects - for building and deploying sites from backoffice
export const websiteProjects = pgTable("website_projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // Project name (used for Cloudflare Pages project name)
  slug: text("slug").notNull().unique(), // URL-safe slug
  htmlContent: text("html_content"), // Full HTML content
  cssContent: text("css_content"), // Custom CSS
  jsContent: text("js_content"), // Custom JavaScript
  status: text("status").notNull().default("draft"), // draft, published
  cloudflareProjectName: text("cloudflare_project_name"), // Cloudflare Pages project name
  liveUrl: text("live_url"), // Live deployment URL
  customDomains: text("custom_domains").array(), // Array of custom domains linked to this project
  lastDeployedAt: timestamp("last_deployed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// User site projects - AI-generated websites for purchased domains
export const userSiteProjects = pgTable("user_site_projects", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  purchasedDomainId: integer("purchased_domain_id"), // Links to purchased domain
  domainName: text("domain_name").notNull(), // The domain name for branding
  affiliateLink: text("affiliate_link"), // User's affiliate link for CTAs
  htmlContent: text("html_content"), // Generated HTML
  cssContent: text("css_content"), // Generated CSS
  coeyPrompt: text("coey_prompt"), // The prompt used for AI generation
  coeyResponse: text("coey_response"), // Raw AI response
  status: text("status").notNull().default("draft"), // draft, generating, published
  cloudflareProjectName: text("cloudflare_project_name"),
  liveUrl: text("live_url"),
  lastDeployedAt: timestamp("last_deployed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertEmailLeadSchema = createInsertSchema(emailLeads).omit({
  id: true,
  createdAt: true,
  syncedToAweber: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  salesCount: true,
  referralCode: true, // Auto-generated in code
}).extend({
  affiliateLink: z.string().optional(),
  name: z.string().optional(),
  referredBy: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
  packagePurchased: z.number().optional(),
});

export const insertDomainRentalSchema = createInsertSchema(domainRentals).omit({
  id: true,
  startDate: true,
});

export const insertAffiliateSaleSchema = createInsertSchema(affiliateSales).omit({
  id: true,
  createdAt: true,
});

export const insertEmailScheduleSchema = createInsertSchema(emailSchedules).omit({
  id: true,
  sentAt: true,
  createdAt: true,
});

export const insertAffiliatePagesSchema = createInsertSchema(affiliatePages).omit({
  id: true,
  createdAt: true,
});

export const insertAdminDomainSchema = createInsertSchema(adminDomains).omit({
  id: true,
  createdAt: true,
});

export const insertRentalContractSchema = createInsertSchema(rentalContracts).omit({
  id: true,
  createdAt: true,
  startAt: true,
});

export const insertRentalChargeSchema = createInsertSchema(rentalCharges).omit({
  id: true,
  chargedAt: true,
});

export type User = typeof users.$inferSelect;
export type EmailSchedule = typeof emailSchedules.$inferSelect;
export type InsertEmailSchedule = z.infer<typeof insertEmailScheduleSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type EmailLead = typeof emailLeads.$inferSelect;
export type InsertEmailLead = z.infer<typeof insertEmailLeadSchema>;
export type DomainRental = typeof domainRentals.$inferSelect;
export type InsertDomainRental = z.infer<typeof insertDomainRentalSchema>;
export type AffiliateSale = typeof affiliateSales.$inferSelect;
export type InsertAffiliateSale = z.infer<typeof insertAffiliateSaleSchema>;
export type AffiliatePage = typeof affiliatePages.$inferSelect;
export type InsertAffiliatePage = z.infer<typeof insertAffiliatePagesSchema>;
export type AdminDomain = typeof adminDomains.$inferSelect;
export type InsertAdminDomain = z.infer<typeof insertAdminDomainSchema>;
export type RentalContract = typeof rentalContracts.$inferSelect;
export type InsertRentalContract = z.infer<typeof insertRentalContractSchema>;
export type RentalCharge = typeof rentalCharges.$inferSelect;
export type InsertRentalCharge = z.infer<typeof insertRentalChargeSchema>;

export const insertBrandingSubscriptionSchema = createInsertSchema(brandingSubscriptions).omit({
  id: true,
  createdAt: true,
  salesCount: true,
});
export type BrandingSubscription = typeof brandingSubscriptions.$inferSelect;
export type InsertBrandingSubscription = z.infer<typeof insertBrandingSubscriptionSchema>;

export const insertWebsiteProjectSchema = createInsertSchema(websiteProjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type WebsiteProject = typeof websiteProjects.$inferSelect;
export type InsertWebsiteProject = z.infer<typeof insertWebsiteProjectSchema>;

export const insertUserSiteProjectSchema = createInsertSchema(userSiteProjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type UserSiteProject = typeof userSiteProjects.$inferSelect;
export type InsertUserSiteProject = z.infer<typeof insertUserSiteProjectSchema>;
