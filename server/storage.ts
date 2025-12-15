import { db } from "./db";
import { users, emailLeads, domainRentals, affiliateSales, emailSchedules, adminDomains, teamMembers, deploymentSettings, emailCampaigns, domainNotifications, adminSessions, rentalContracts, rentalCharges, loginTokens, userTierSales, adminLoginAttempts, brandingSubscriptions, purchasedDomains, websiteProjects, userSiteProjects } from "@shared/schema";
import { eq, and, isNotNull, ne, lt, isNull, sql } from "drizzle-orm";
import type { User, EmailLead, DomainRental, AffiliateSale, EmailSchedule, AdminDomain, RentalContract, RentalCharge, BrandingSubscription, WebsiteProject, UserSiteProject } from "@shared/schema";

export interface IStorage {
  createUser(data: any): Promise<any>;
  getUserByEmail(email: string): Promise<any>;
  getUserById(id: string): Promise<any>;
  getUserByReferralCode(code: string): Promise<any>;
  getUserBySubdomain(subdomain: string): Promise<any>;
  updateUserSubdomain(userId: string, subdomain: string): Promise<void>;
  updateAccountBalance(userId: string, amount: number): Promise<void>;
  updateReferralBalance(userId: string, amount: number): Promise<void>;
  updateUserStripeAccount(userId: string, stripeAccountId: string): Promise<void>;
  deductReferralBalance(userId: string, amount: number): Promise<void>;
  incrementUserSalesCount(userId: string): Promise<void>;
  updateSubscriptionStatus(userId: string, status: string): Promise<void>;
  createAffiliateSale(data: any): Promise<any>;
  getAffiliateSales(userId: string): Promise<any[]>;
  getSalesByReferrer(referrerId: string): Promise<any[]>;
  getUserReferrals(userId: string): Promise<any[]>;
  getUserSales(userId: string): Promise<any[]>;
  createDomainRental(data: any): Promise<any>;
  getDomainRentals(userId: string): Promise<any[]>;
  getUserRentals(userId: string): Promise<any[]>;
  getDomainByName(domainName: string): Promise<any>;
  getActiveRentals(): Promise<any[]>;
  createEmailLead(data: any): Promise<any>;
  getEmailLeads(): Promise<any[]>;
  getEmailLeadByEmail(email: string): Promise<any>;
  getUnsyncedLeads(): Promise<any[]>;
  markLeadAsSynced(id: number): Promise<void>;
  createEmailSchedule(data: any): Promise<any>;
  getEmailSchedules(status: string): Promise<any[]>;
  getPendingEmails(): Promise<any[]>;
  updateEmailScheduleStatus(id: number, status: string): Promise<void>;
  markEmailAsSent(id: number): Promise<void>;
  markEmailAsFailed(id: number): Promise<void>;
  cancelUserAccount(userId: string): Promise<void>;
  updateDomainForwarding(domainId: number, forwardUrl: string): Promise<void>;
  updateDomainRenewal(rentalId: number, registrationPaidDate: any, renewalDueDate: any, registrationCost: number): Promise<void>;
  createAdminDomain(data: any): Promise<any>;
  getUserAdminDomains(userId: string): Promise<any[]>;
  inviteTeamMember(ownerId: string, memberEmail: string): Promise<any>;
  getTeamMembers(ownerId: string): Promise<any[]>;
  removeTeamMember(memberId: number): Promise<void>;
  getDeploymentSettings(userId: string): Promise<any>;
  setDeploymentSettings(userId: string, enabled: boolean): Promise<any>;
  getAffiliatePageBySlug(slug: string): Promise<any>;
  createAffiliatePage(data: any): Promise<any>;
  getUserAffiliatePages(userId: string): Promise<any[]>;
  createEmailCampaign(data: any): Promise<any>;
  getEmailCampaigns(userId: string): Promise<any[]>;
  getEmailLeadByToken(token: string): Promise<any>;
  getEmailLeadByAffiliateCode(code: string): Promise<any>;
  verifyEmailLead(leadId: number): Promise<any>;
  setPasswordResetToken(email: string, token: string, expires: Date): Promise<boolean>;
  getUserByResetToken(token: string): Promise<any>;
  resetPassword(userId: string, newPasswordHash: string): Promise<void>;
  getPassedUpSales(): Promise<any[]>;
  getAllAffiliateSales(): Promise<any[]>;
  // First 3 leads system methods
  getUnassignedEmailLeads(limit: number): Promise<any[]>;
  assignLeadsToBuyer(leadIds: number[], buyerId: string): Promise<void>;
  getLeadsAssignedToBuyer(buyerId: string): Promise<any[]>;
  getSalesWithSellerInfo(sellerId: string): Promise<any[]>;
  getUserLevelPassedUpSales(userId: string): Promise<any[]>;
  getAdminLevelPassedUpSales(): Promise<any[]>;
  updateUserNichePreferences(userId: string, niches: string[], emailNotificationsEnabled: boolean): Promise<void>;
  getUsersWithNichePreference(niche: string): Promise<any[]>;
  createDomainNotification(domainId: number, userId: string): Promise<any>;
  getDomainNotifications(domainId: number): Promise<any[]>;
  updateDomainNiche(domainId: number, niche: string): Promise<void>;
  getAllActiveUsers(): Promise<any[]>;
  createAdminSession(token: string, email: string, expiresAt: Date): Promise<any>;
  getAdminSession(token: string): Promise<any>;
  deleteAdminSession(token: string): Promise<void>;
  cleanExpiredAdminSessions(): Promise<void>;
  createLoginToken(token: string, stripeSessionId: string, email: string, packageAmount: number, expiresAt: Date): Promise<any>;
  getLoginToken(token: string): Promise<any>;
  getLoginTokenByStripeSession(stripeSessionId: string): Promise<any>;
  markLoginTokenUsed(token: string): Promise<void>;
  updateUserPackagePurchased(userId: string, packageAmount: number): Promise<void>;
  // Rental marketplace methods
  getDomainRentalById(id: number): Promise<any>;
  listDomainForRent(domainId: number, isListed: boolean): Promise<void>;
  setOwnerDefaultForwardUrl(domainId: number, url: string): Promise<void>;
  getDomainsAvailableForRent(): Promise<any[]>;
  createRentalContract(data: any): Promise<any>;
  getRentalContractById(id: number): Promise<any>;
  getActiveRentalContractByDomain(domainId: number): Promise<any>;
  getRentalContractsByOwner(ownerId: string): Promise<any[]>;
  getRentalContractsByRenter(renterId: string): Promise<any[]>;
  updateRentalContractStatus(contractId: number, status: string): Promise<void>;
  updateRentalContractSubscription(contractId: number, subscriptionId: string): Promise<void>;
  createRentalCharge(data: any): Promise<any>;
  getRentalChargesByContract(contractId: number): Promise<any[]>;
  getRentalChargesByOwner(ownerId: string): Promise<any[]>;
  incrementDomainRentalSalesCount(domainId: number): Promise<number>;
  cancelPendingEmailsByEmail(email: string): Promise<void>;
  getReferralCountByCode(referralCode: string): Promise<number>;
  incrementSalesCount(userId: string): Promise<void>;
  // Tier sales tracking methods
  getUserTierSales(userId: string, packageAmount: number): Promise<any>;
  incrementTierSalesCount(userId: string, packageAmount: number): Promise<number>;
  createUserTierSales(userId: string, packageAmount: number): Promise<any>;
  // Trial and daily billing methods
  startUserTrial(userId: string, packageAmount: number): Promise<void>;
  endUserTrial(userId: string, reason: string): Promise<void>;
  getUsersWithExpiredTrials(): Promise<any[]>;
  getUsersRequiringDailyBilling(): Promise<any[]>;
  recordDailyCharge(userId: string): Promise<void>;
  checkTrialReferralThreshold(userId: string): Promise<boolean>;
  updateUser(userId: string, data: Partial<{ name: string; email: string; referralCode: string; affiliateLink: string; password: string }>): Promise<void>;
  getUsersByAffiliateLink(affiliateLink: string): Promise<any[]>;
  // Admin login attempt tracking (lockout)
  getAdminLoginAttempts(email: string): Promise<any>;
  recordFailedAdminLogin(email: string, ipAddress?: string): Promise<{ attemptCount: number; lockedUntil: Date | null }>;
  clearAdminLoginAttempts(email: string): Promise<void>;
  isAdminLocked(email: string): Promise<{ locked: boolean; lockedUntil: Date | null; remainingAttempts: number }>;
  // Branding subscription methods
  createBrandingSubscription(data: any): Promise<any>;
  getBrandingSubscriptionBySlug(slug: string): Promise<any>;
  getBrandingSubscriptionByDomain(domain: string): Promise<any>;
  getBrandingSubscriptionsByUser(userId: string): Promise<any[]>;
  updateBrandingSubscription(id: number, data: any): Promise<void>;
  updateBrandingSubscriptionStatus(id: number, status: string): Promise<void>;
  incrementBrandingSalesCount(id: number): Promise<number>;
  // Purchased domains methods
  createPurchasedDomain(data: any): Promise<any>;
  getPurchasedDomainsByUser(userId: string): Promise<any[]>;
  getPurchasedDomainByName(domainName: string): Promise<any>;
  updatePurchasedDomain(id: number, data: any): Promise<void>;
  // Website projects methods (admin website builder)
  createWebsiteProject(data: any): Promise<WebsiteProject>;
  getWebsiteProjects(): Promise<WebsiteProject[]>;
  getWebsiteProjectById(id: number): Promise<WebsiteProject | null>;
  getWebsiteProjectBySlug(slug: string): Promise<WebsiteProject | null>;
  updateWebsiteProject(id: number, data: Partial<WebsiteProject>): Promise<void>;
  deleteWebsiteProject(id: number): Promise<void>;
  // User site projects methods (user-generated websites)
  createUserSiteProject(data: any): Promise<UserSiteProject>;
  getUserSiteProjectsByUser(userId: string): Promise<UserSiteProject[]>;
  getUserSiteProjectById(id: number): Promise<UserSiteProject | null>;
  getUserSiteProjectByDomain(domainName: string): Promise<UserSiteProject | null>;
  updateUserSiteProject(id: number, data: Partial<UserSiteProject>): Promise<void>;
  deleteUserSiteProject(id: number): Promise<void>;
}

export const storage: IStorage = {
  async createUser(data) {
    const result = await db.insert(users).values(data).returning();
    return result[0];
  },

  async getUserByEmail(email) {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0] || null;
  },

  async getUserById(id) {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0] || null;
  },

  async getUserByReferralCode(code: string) {
    const result = await db.select().from(users).where(eq(users.referralCode, code));
    return result[0] || null;
  },

  async getUserBySubdomain(subdomain: string) {
    const result = await db.select().from(users).where(eq(users.subdomain, subdomain));
    return result[0] || null;
  },

  async updateUserSubdomain(userId: string, subdomain: string) {
    await db.update(users).set({ subdomain }).where(eq(users.id, userId));
  },

  async updateAccountBalance(userId, amount) {
    await db.update(users).set({ accountBalance: amount }).where(eq(users.id, userId));
  },

  async updateReferralBalance(userId, amount) {
    await db.update(users).set({ referralBalance: amount }).where(eq(users.id, userId));
  },

  async deductReferralBalance(userId, amount) {
    const user = await this.getUserById(userId);
    if (user) {
      await db.update(users).set({ referralBalance: Math.max(0, user.referralBalance - amount) }).where(eq(users.id, userId));
    }
  },

  async incrementUserSalesCount(userId: string) {
    const user = await this.getUserById(userId);
    if (user) {
      await db.update(users).set({ salesCount: user.salesCount + 1 }).where(eq(users.id, userId));
    }
  },

  async updateSubscriptionStatus(userId: string, status: string) {
    await db.update(users).set({ subscriptionStatus: status }).where(eq(users.id, userId));
  },

  async updateUserStripeAccount(userId: string, stripeAccountId: string) {
    await db.update(users).set({ stripeAccountId }).where(eq(users.id, userId));
  },

  async createAffiliateSale(data) {
    const result = await db.insert(affiliateSales).values(data).returning();
    return result[0];
  },

  async getAffiliateSales(userId) {
    return await db.select().from(affiliateSales).where(eq(affiliateSales.sellerId, userId));
  },

  async getSalesByReferrer(referrerId: string) {
    return await db.select().from(affiliateSales).where(eq(affiliateSales.passedUpTo, referrerId));
  },

  async getUserReferrals(userId: string) {
    // First get the user's referral code
    const user = await this.getUserById(userId);
    if (!user || !user.referralCode) return [];
    // Find users who have this referral code as their affiliateLink (who referred them)
    return await db.select().from(users).where(eq(users.affiliateLink, user.referralCode));
  },

  async getUserSales(userId: string) {
    return await db.select().from(affiliateSales).where(eq(affiliateSales.sellerId, userId));
  },

  async createDomainRental(data) {
    const result = await db.insert(domainRentals).values(data).returning();
    return result[0];
  },

  async getDomainRentals(userId) {
    if (!userId) {
      return await db.select().from(domainRentals);
    }
    return await db.select().from(domainRentals).where(eq(domainRentals.userId, userId));
  },

  async getUserRentals(userId: string) {
    return await db.select().from(domainRentals).where(eq(domainRentals.userId, userId));
  },

  async getDomainByName(domainName: string) {
    const result = await db.select().from(domainRentals).where(eq(domainRentals.domainName, domainName));
    return result[0] || null;
  },

  async getActiveRentals() {
    return await db.select().from(domainRentals).where(eq(domainRentals.status, "active"));
  },

  async createEmailLead(data) {
    const result = await db.insert(emailLeads).values(data).returning();
    return result[0];
  },

  async getEmailLeads() {
    return await db.select().from(emailLeads);
  },

  async getEmailLeadByEmail(email: string) {
    const result = await db.select().from(emailLeads).where(eq(emailLeads.email, email));
    return result[0] || null;
  },

  async getUnsyncedLeads() {
    return await db.select().from(emailLeads);
  },

  async markLeadAsSynced(id: number) {
    // No-op for now
  },

  async createEmailSchedule(data) {
    const result = await db.insert(emailSchedules).values(data).returning();
    return result[0];
  },

  async getEmailSchedules(status) {
    return await db.select().from(emailSchedules).where(eq(emailSchedules.status, status));
  },

  async getPendingEmails() {
    return await db.select().from(emailSchedules).where(eq(emailSchedules.status, "pending"));
  },

  async updateEmailScheduleStatus(id, status) {
    await db.update(emailSchedules).set({ status }).where(eq(emailSchedules.id, id));
  },

  async markEmailAsSent(id: number) {
    await db.update(emailSchedules).set({ status: "sent" }).where(eq(emailSchedules.id, id));
  },

  async markEmailAsFailed(id: number) {
    await db.update(emailSchedules).set({ status: "failed" }).where(eq(emailSchedules.id, id));
  },

  async cancelUserAccount(userId) {
    await db.update(users).set({ subscriptionStatus: "cancelled", accountBalance: 0 }).where(eq(users.id, userId));
  },

  async updateDomainForwarding(domainId, forwardUrl) {
    await db.update(domainRentals).set({ forwardUrl }).where(eq(domainRentals.id, domainId));
  },

  async updateDomainRenewal(rentalId: number, registrationPaidDate: any, renewalDueDate: any, registrationCost: number) {
    await db.update(domainRentals).set({ registrationPaidDate, renewalDueDate, registrationCost }).where(eq(domainRentals.id, rentalId));
  },

  async createAdminDomain(data) {
    const result = await db.insert(adminDomains).values(data).returning();
    return result[0];
  },

  async getUserAdminDomains(userId) {
    return await db.select().from(adminDomains).where(eq(adminDomains.userId, userId));
  },

  async inviteTeamMember(ownerId, memberEmail) {
    const result = await db.insert(teamMembers).values({ ownerId, memberEmail, status: "pending" }).returning();
    return result[0];
  },

  async getTeamMembers(ownerId) {
    return await db.select().from(teamMembers).where(eq(teamMembers.ownerId, ownerId));
  },

  async removeTeamMember(memberId) {
    await db.delete(teamMembers).where(eq(teamMembers.id, memberId));
  },

  async getDeploymentSettings(userId) {
    const result = await db.select().from(deploymentSettings).where(eq(deploymentSettings.userId, userId));
    return result[0] || { userId, deploymentEnabled: false };
  },

  async setDeploymentSettings(userId, enabled) {
    const existing = await this.getDeploymentSettings(userId);
    if (existing?.id) {
      const result = await db.update(deploymentSettings).set({ deploymentEnabled: enabled }).where(eq(deploymentSettings.userId, userId)).returning();
      return result[0];
    } else {
      const result = await db.insert(deploymentSettings).values({ userId, deploymentEnabled: enabled }).returning();
      return result[0];
    }
  },

  async getAffiliatePageBySlug(slug: string) {
    return null;
  },

  async createAffiliatePage(data: any) {
    return null;
  },

  async getUserAffiliatePages(userId: string) {
    return [];
  },

  async createEmailCampaign(data: any) {
    const result = await db.insert(emailCampaigns).values(data).returning();
    return result[0];
  },

  async getEmailCampaigns(userId: string) {
    return await db.select().from(emailCampaigns).where(eq(emailCampaigns.userId, userId));
  },

  async getEmailLeadByToken(token: string) {
    const result = await db.select().from(emailLeads).where(eq(emailLeads.verificationToken, token));
    return result[0] || null;
  },

  async getEmailLeadByAffiliateCode(code: string) {
    const result = await db.select().from(emailLeads).where(eq(emailLeads.assignedAffiliate, code));
    return result[0] || null;
  },

  async verifyEmailLead(leadId: number) {
    const result = await db.update(emailLeads).set({ verified: true }).where(eq(emailLeads.id, leadId)).returning();
    return result[0];
  },

  // First 3 leads system - Get unassigned email leads
  async getUnassignedEmailLeads(limit: number) {
    const result = await db.select()
      .from(emailLeads)
      .where(isNull(emailLeads.assignedToBuyer))
      .orderBy(emailLeads.createdAt)
      .limit(limit);
    return result;
  },

  // Assign leads to a buyer who just purchased
  async assignLeadsToBuyer(leadIds: number[], buyerId: string) {
    if (leadIds.length === 0) return;
    
    await db.update(emailLeads)
      .set({ 
        assignedToBuyer: buyerId,
        assignedAt: new Date()
      })
      .where(
        leadIds.length === 1 
          ? eq(emailLeads.id, leadIds[0])
          : sql`${emailLeads.id} IN (${sql.join(leadIds.map(id => sql`${id}`), sql`, `)})`
      );
  },

  // Get leads assigned to a specific buyer
  async getLeadsAssignedToBuyer(buyerId: string) {
    const result = await db.select()
      .from(emailLeads)
      .where(eq(emailLeads.assignedToBuyer, buyerId))
      .orderBy(emailLeads.assignedAt);
    return result;
  },

  async setPasswordResetToken(email: string, token: string, expires: Date) {
    const result = await db.update(users)
      .set({ passwordResetToken: token, passwordResetExpires: expires })
      .where(eq(users.email, email))
      .returning();
    return result.length > 0;
  },

  async getUserByResetToken(token: string) {
    const result = await db.select().from(users).where(eq(users.passwordResetToken, token));
    return result[0] || null;
  },

  async resetPassword(userId: string, newPasswordHash: string) {
    await db.update(users)
      .set({ password: newPasswordHash, passwordResetToken: null, passwordResetExpires: null })
      .where(eq(users.id, userId));
  },

  async getPassedUpSales() {
    const sales = await db.select().from(affiliateSales).where(eq(affiliateSales.passedUpTo, "admin"));
    const salesWithSellerInfo = await Promise.all(sales.map(async (sale) => {
      const seller = await db.select().from(users).where(eq(users.id, sale.sellerId));
      return {
        ...sale,
        sellerName: seller[0]?.name || "Unknown",
        sellerEmail: seller[0]?.email || "Unknown",
        sellerReferralCode: seller[0]?.referralCode || "Unknown"
      };
    }));
    return salesWithSellerInfo;
  },

  async getAllAffiliateSales() {
    const sales = await db.select().from(affiliateSales).orderBy(affiliateSales.createdAt);
    const salesWithSellerInfo = await Promise.all(sales.map(async (sale) => {
      const seller = await db.select().from(users).where(eq(users.id, sale.sellerId));
      return {
        ...sale,
        sellerName: seller[0]?.name || "Unknown",
        sellerEmail: seller[0]?.email || "Unknown",
        sellerReferralCode: seller[0]?.referralCode || "Unknown"
      };
    }));
    return salesWithSellerInfo;
  },

  async getSalesWithSellerInfo(sellerId: string) {
    return await db.select().from(affiliateSales).where(eq(affiliateSales.sellerId, sellerId));
  },

  async getUserLevelPassedUpSales(userId: string) {
    const sales = await db.select().from(affiliateSales)
      .where(and(
        eq(affiliateSales.sellerId, userId),
        eq(affiliateSales.passedUpReason, "under_leveled")
      ));
    return sales;
  },

  async getAdminLevelPassedUpSales() {
    const sales = await db.select().from(affiliateSales)
      .where(eq(affiliateSales.passedUpReason, "under_leveled"));
    const salesWithSellerInfo = await Promise.all(sales.map(async (sale) => {
      const seller = await db.select().from(users).where(eq(users.id, sale.sellerId));
      return {
        ...sale,
        sellerName: seller[0]?.name || "Unknown",
        sellerEmail: seller[0]?.email || "Unknown",
        sellerReferralCode: seller[0]?.referralCode || "Unknown",
        sellerLevel: sale.sellerLevel
      };
    }));
    return salesWithSellerInfo;
  },

  async updateUserNichePreferences(userId: string, niches: string[], emailNotificationsEnabled: boolean) {
    await db.update(users).set({
      nichePreferences: niches.join(","),
      emailNotificationsEnabled
    }).where(eq(users.id, userId));
  },

  async getUsersWithNichePreference(niche: string) {
    const allUsers = await db.select().from(users)
      .where(and(
        eq(users.emailNotificationsEnabled, true),
        eq(users.isActive, true)
      ));
    return allUsers.filter(user => {
      if (!user.nichePreferences) return false;
      const userNiches = user.nichePreferences.split(",");
      return userNiches.includes(niche) || userNiches.includes("other");
    });
  },

  async createDomainNotification(domainId: number, userId: string) {
    const result = await db.insert(domainNotifications).values({
      domainId,
      userId
    }).returning();
    return result[0];
  },

  async getDomainNotifications(domainId: number) {
    return await db.select().from(domainNotifications).where(eq(domainNotifications.domainId, domainId));
  },

  async updateDomainNiche(domainId: number, niche: string) {
    await db.update(domainRentals).set({ niche }).where(eq(domainRentals.id, domainId));
  },

  async getAllActiveUsers() {
    return await db.select().from(users).where(eq(users.isActive, true));
  },

  async createAdminSession(token: string, email: string, expiresAt: Date) {
    const result = await db.insert(adminSessions).values({
      token,
      email,
      expiresAt
    }).returning();
    return result[0];
  },

  async getAdminSession(token: string) {
    const result = await db.select().from(adminSessions).where(eq(adminSessions.token, token));
    return result[0] || null;
  },

  async deleteAdminSession(token: string) {
    await db.delete(adminSessions).where(eq(adminSessions.token, token));
  },

  async cleanExpiredAdminSessions() {
    await db.delete(adminSessions).where(lt(adminSessions.expiresAt, new Date()));
  },

  async createLoginToken(token: string, stripeSessionId: string, email: string, packageAmount: number, expiresAt: Date) {
    const result = await db.insert(loginTokens).values({
      token,
      stripeSessionId,
      email,
      packageAmount,
      expiresAt
    }).returning();
    return result[0];
  },

  async getLoginToken(token: string) {
    const result = await db.select().from(loginTokens).where(eq(loginTokens.token, token));
    return result[0] || null;
  },

  async getLoginTokenByStripeSession(stripeSessionId: string) {
    const result = await db.select().from(loginTokens).where(eq(loginTokens.stripeSessionId, stripeSessionId));
    return result[0] || null;
  },

  async markLoginTokenUsed(token: string) {
    await db.update(loginTokens).set({ used: true }).where(eq(loginTokens.token, token));
  },

  async updateUserPackagePurchased(userId: string, packageAmount: number) {
    await db.update(users).set({ packagePurchased: packageAmount }).where(eq(users.id, userId));
  },

  // Rental marketplace methods
  async getDomainRentalById(id: number) {
    const result = await db.select().from(domainRentals).where(eq(domainRentals.id, id));
    return result[0] || null;
  },

  async listDomainForRent(domainId: number, isListed: boolean) {
    await db.update(domainRentals)
      .set({ isListedForRent: isListed })
      .where(eq(domainRentals.id, domainId));
  },

  async setOwnerDefaultForwardUrl(domainId: number, url: string) {
    await db.update(domainRentals)
      .set({ ownerDefaultForwardUrl: url })
      .where(eq(domainRentals.id, domainId));
  },

  async getDomainsAvailableForRent() {
    // Get all domains listed for rent
    const listedDomains = await db.select().from(domainRentals)
      .where(and(
        eq(domainRentals.isListedForRent, true),
        eq(domainRentals.status, "active")
      ));
    
    // Filter out domains that have an active rental contract
    const availableDomains = [];
    for (const domain of listedDomains) {
      const activeContract = await db.select().from(rentalContracts)
        .where(and(
          eq(rentalContracts.domainRentalId, domain.id),
          eq(rentalContracts.status, "active")
        ));
      if (activeContract.length === 0) {
        availableDomains.push(domain);
      }
    }
    return availableDomains;
  },

  async createRentalContract(data: any) {
    const result = await db.insert(rentalContracts).values(data).returning();
    return result[0];
  },

  async getRentalContractById(id: number) {
    const result = await db.select().from(rentalContracts).where(eq(rentalContracts.id, id));
    return result[0] || null;
  },

  async getActiveRentalContractByDomain(domainId: number) {
    const result = await db.select().from(rentalContracts)
      .where(and(
        eq(rentalContracts.domainRentalId, domainId),
        eq(rentalContracts.status, "active")
      ));
    return result[0] || null;
  },

  async getRentalContractsByOwner(ownerId: string) {
    return await db.select().from(rentalContracts)
      .where(eq(rentalContracts.ownerId, ownerId));
  },

  async getRentalContractsByRenter(renterId: string) {
    return await db.select().from(rentalContracts)
      .where(eq(rentalContracts.renterId, renterId));
  },

  async updateRentalContractStatus(contractId: number, status: string) {
    await db.update(rentalContracts)
      .set({ status })
      .where(eq(rentalContracts.id, contractId));
  },

  async updateRentalContractSubscription(contractId: number, subscriptionId: string) {
    await db.update(rentalContracts)
      .set({ stripeSubscriptionId: subscriptionId })
      .where(eq(rentalContracts.id, contractId));
  },

  async createRentalCharge(data: any) {
    const result = await db.insert(rentalCharges).values(data).returning();
    return result[0];
  },

  async getRentalChargesByContract(contractId: number) {
    return await db.select().from(rentalCharges)
      .where(eq(rentalCharges.contractId, contractId));
  },

  async getRentalChargesByOwner(ownerId: string) {
    return await db.select().from(rentalCharges)
      .where(eq(rentalCharges.ownerId, ownerId));
  },

  async incrementDomainRentalSalesCount(domainId: number) {
    // Get current count
    const domain = await db.select().from(domainRentals).where(eq(domainRentals.id, domainId));
    if (!domain[0]) return 0;
    
    const newCount = (domain[0].rentalSalesCount || 0) + 1;
    await db.update(domainRentals)
      .set({ rentalSalesCount: newCount })
      .where(eq(domainRentals.id, domainId));
    return newCount;
  },

  async cancelPendingEmailsByEmail(email: string) {
    // First find the user by email
    const user = await db.select().from(users).where(eq(users.email, email));
    if (user[0]) {
      await db.update(emailSchedules)
        .set({ status: "cancelled" })
        .where(and(
          eq(emailSchedules.userId, user[0].id),
          eq(emailSchedules.status, "pending")
        ));
    }
  },

  async getReferralCountByCode(referralCode: string) {
    // Count how many users have this referralCode as their affiliateLink (who referred them)
    const result = await db.select().from(users).where(eq(users.affiliateLink, referralCode));
    return result.length;
  },

  async incrementSalesCount(userId: string) {
    const user = await this.getUserById(userId);
    if (user) {
      const newCount = (user.salesCount || 0) + 1;
      await db.update(users).set({ salesCount: newCount }).where(eq(users.id, userId));
    }
  },

  async getUserTierSales(userId: string, packageAmount: number) {
    const result = await db.select().from(userTierSales)
      .where(and(
        eq(userTierSales.userId, userId),
        eq(userTierSales.packageAmount, packageAmount)
      ));
    return result[0] || null;
  },

  async incrementTierSalesCount(userId: string, packageAmount: number) {
    const existing = await this.getUserTierSales(userId, packageAmount);
    if (existing) {
      const newCount = (existing.salesCount || 0) + 1;
      await db.update(userTierSales)
        .set({ salesCount: newCount, updatedAt: new Date() })
        .where(and(
          eq(userTierSales.userId, userId),
          eq(userTierSales.packageAmount, packageAmount)
        ));
      return newCount;
    } else {
      await this.createUserTierSales(userId, packageAmount);
      return 1;
    }
  },

  async createUserTierSales(userId: string, packageAmount: number) {
    const result = await db.insert(userTierSales).values({
      userId,
      packageAmount,
      salesCount: 1,
    }).returning();
    return result[0];
  },

  // Trial and daily billing methods
  async startUserTrial(userId: string, packageAmount: number) {
    const now = new Date();
    const trialEndsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    
    // Get user's current referral count to track referrals gained during trial
    const user = await this.getUserById(userId);
    const currentReferralCount = user ? await this.getReferralCountByCode(user.referralCode) : 0;
    
    // Determine daily charge based on package tier
    const dailyChargeAmount = Math.round(packageAmount / 30); // Approximate daily rate
    
    await db.update(users).set({
      trialStartedAt: now,
      trialEndsAt: trialEndsAt,
      trialStatus: "active",
      joinFeePaidAt: now,
      referralCountAtTrialStart: currentReferralCount,
      dailyChargeAmount: dailyChargeAmount,
      requiresDailyBilling: false, // Not yet - trial is active
    }).where(eq(users.id, userId));
  },

  async endUserTrial(userId: string, reason: string) {
    await db.update(users).set({
      trialStatus: "ended",
      trialEndReason: reason,
      requiresDailyBilling: true, // Now daily billing starts
    }).where(eq(users.id, userId));
  },

  async getUsersWithExpiredTrials() {
    const now = new Date();
    return await db.select().from(users).where(
      and(
        eq(users.trialStatus, "active"),
        lt(users.trialEndsAt, now),
        eq(users.isActive, true)
      )
    );
  },

  async getUsersRequiringDailyBilling() {
    return await db.select().from(users).where(
      and(
        eq(users.requiresDailyBilling, true),
        eq(users.isActive, true),
        eq(users.subscriptionStatus, "active")
      )
    );
  },

  async recordDailyCharge(userId: string) {
    await db.update(users).set({
      lastDailyChargeAt: new Date(),
    }).where(eq(users.id, userId));
  },

  async checkTrialReferralThreshold(userId: string) {
    const user = await this.getUserById(userId);
    if (!user || user.trialStatus !== "active") return false;
    
    // Count current referrals
    const currentReferralCount = await this.getReferralCountByCode(user.referralCode);
    const referralsGainedDuringTrial = currentReferralCount - (user.referralCountAtTrialStart || 0);
    
    // If gained 3+ referrals during trial, end trial early
    return referralsGainedDuringTrial >= 3;
  },

  async updateUser(userId: string, data: Partial<{ name: string; email: string; referralCode: string; affiliateLink: string; password: string }>) {
    await db.update(users).set(data).where(eq(users.id, userId));
  },

  async getUsersByAffiliateLink(affiliateLink: string) {
    return await db.select().from(users).where(eq(users.affiliateLink, affiliateLink));
  },

  async getAdminLoginAttempts(email: string) {
    const result = await db.select().from(adminLoginAttempts).where(eq(adminLoginAttempts.email, email));
    return result[0] || null;
  },

  async recordFailedAdminLogin(email: string, ipAddress?: string) {
    const existing = await this.getAdminLoginAttempts(email);
    const now = new Date();
    const maxAttempts = 10;
    const lockoutDuration = 15 * 60 * 1000; // 15 minutes

    if (existing) {
      const newCount = existing.attemptCount + 1;
      const lockedUntil = newCount >= maxAttempts ? new Date(now.getTime() + lockoutDuration) : null;
      
      await db.update(adminLoginAttempts).set({
        attemptCount: newCount,
        lastAttemptAt: now,
        lockedUntil: lockedUntil,
        ipAddress: ipAddress || existing.ipAddress,
      }).where(eq(adminLoginAttempts.email, email));
      
      return { attemptCount: newCount, lockedUntil };
    } else {
      await db.insert(adminLoginAttempts).values({
        email,
        ipAddress: ipAddress || null,
        attemptCount: 1,
        lastAttemptAt: now,
        lockedUntil: null,
      });
      return { attemptCount: 1, lockedUntil: null };
    }
  },

  async clearAdminLoginAttempts(email: string) {
    await db.delete(adminLoginAttempts).where(eq(adminLoginAttempts.email, email));
  },

  async isAdminLocked(email: string) {
    const attempts = await this.getAdminLoginAttempts(email);
    const maxAttempts = 10;
    
    if (!attempts) {
      return { locked: false, lockedUntil: null, remainingAttempts: maxAttempts };
    }
    
    const now = new Date();
    
    // If locked and lockout hasn't expired
    if (attempts.lockedUntil && new Date(attempts.lockedUntil) > now) {
      return { locked: true, lockedUntil: attempts.lockedUntil, remainingAttempts: 0 };
    }
    
    // If lockout expired, clear it
    if (attempts.lockedUntil && new Date(attempts.lockedUntil) <= now) {
      await this.clearAdminLoginAttempts(email);
      return { locked: false, lockedUntil: null, remainingAttempts: maxAttempts };
    }
    
    return { 
      locked: false, 
      lockedUntil: null, 
      remainingAttempts: Math.max(0, maxAttempts - attempts.attemptCount) 
    };
  },

  // Branding subscription methods
  async createBrandingSubscription(data: any) {
    const result = await db.insert(brandingSubscriptions).values(data).returning();
    return result[0];
  },

  async getBrandingSubscriptionBySlug(slug: string) {
    const result = await db.select().from(brandingSubscriptions).where(eq(brandingSubscriptions.brandSlug, slug));
    return result[0] || null;
  },

  async getBrandingSubscriptionByDomain(domain: string) {
    const result = await db.select().from(brandingSubscriptions).where(eq(brandingSubscriptions.customDomain, domain.toLowerCase()));
    return result[0] || null;
  },

  async getBrandingSubscriptionsByUser(userId: string) {
    return await db.select().from(brandingSubscriptions).where(eq(brandingSubscriptions.userId, userId));
  },

  async updateBrandingSubscription(id: number, data: any) {
    await db.update(brandingSubscriptions).set(data).where(eq(brandingSubscriptions.id, id));
  },

  async updateBrandingSubscriptionStatus(id: number, status: string) {
    await db.update(brandingSubscriptions).set({ 
      status,
      cancelledAt: status === "cancelled" ? new Date() : null
    }).where(eq(brandingSubscriptions.id, id));
  },

  async incrementBrandingSalesCount(id: number) {
    const existing = await db.select().from(brandingSubscriptions).where(eq(brandingSubscriptions.id, id));
    if (existing[0]) {
      const newCount = (existing[0].salesCount || 0) + 1;
      await db.update(brandingSubscriptions).set({ salesCount: newCount }).where(eq(brandingSubscriptions.id, id));
      return newCount;
    }
    return 0;
  },

  // Purchased domains methods
  async createPurchasedDomain(data: any) {
    const result = await db.insert(purchasedDomains).values(data).returning();
    return result[0];
  },

  async getPurchasedDomainsByUser(userId: string) {
    return await db.select().from(purchasedDomains).where(eq(purchasedDomains.userId, userId));
  },

  async getPurchasedDomainByName(domainName: string) {
    const result = await db.select().from(purchasedDomains).where(eq(purchasedDomains.domainName, domainName.toLowerCase()));
    return result[0] || null;
  },

  async updatePurchasedDomain(id: number, data: any) {
    await db.update(purchasedDomains).set(data).where(eq(purchasedDomains.id, id));
  },

  // Website projects methods (admin website builder)
  async createWebsiteProject(data: any) {
    const result = await db.insert(websiteProjects).values(data).returning();
    return result[0];
  },

  async getWebsiteProjects() {
    return await db.select().from(websiteProjects);
  },

  async getWebsiteProjectById(id: number) {
    const result = await db.select().from(websiteProjects).where(eq(websiteProjects.id, id));
    return result[0] || null;
  },

  async getWebsiteProjectBySlug(slug: string) {
    const result = await db.select().from(websiteProjects).where(eq(websiteProjects.slug, slug));
    return result[0] || null;
  },

  async updateWebsiteProject(id: number, data: Partial<WebsiteProject>) {
    await db.update(websiteProjects).set({ ...data, updatedAt: new Date() }).where(eq(websiteProjects.id, id));
  },

  async deleteWebsiteProject(id: number) {
    await db.delete(websiteProjects).where(eq(websiteProjects.id, id));
  },

  // User site projects methods (user-generated websites)
  async createUserSiteProject(data: any) {
    const result = await db.insert(userSiteProjects).values(data).returning();
    return result[0];
  },

  async getUserSiteProjectsByUser(userId: string) {
    return await db.select().from(userSiteProjects).where(eq(userSiteProjects.userId, userId));
  },

  async getUserSiteProjectById(id: number) {
    const result = await db.select().from(userSiteProjects).where(eq(userSiteProjects.id, id));
    return result[0] || null;
  },

  async getUserSiteProjectByDomain(domainName: string) {
    const result = await db.select().from(userSiteProjects).where(eq(userSiteProjects.domainName, domainName.toLowerCase()));
    return result[0] || null;
  },

  async updateUserSiteProject(id: number, data: Partial<UserSiteProject>) {
    await db.update(userSiteProjects).set({ ...data, updatedAt: new Date() }).where(eq(userSiteProjects.id, id));
  },

  async deleteUserSiteProject(id: number) {
    await db.delete(userSiteProjects).where(eq(userSiteProjects.id, id));
  },
};
