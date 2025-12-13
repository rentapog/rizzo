import { storage } from "./storage";

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
      await storage.updateAccountBalance(userId, user.accountBalance - remainingCharge);
    }
  }

  return {
    success: true,
    referralBalanceUsed,
    accountBalanceUsed: remainingCharge,
    totalCharged: chargeAmount
  };
}

// Check for expired trials and end them
async function processExpiredTrials() {
  try {
    const expiredTrials = await storage.getUsersWithExpiredTrials();
    
    for (const user of expiredTrials) {
      try {
        await storage.endUserTrial(user.id, "time_expired");
        console.log(`[Billing Worker] Trial expired for ${user.email} - Daily billing now active`);
      } catch (err) {
        console.error(`[Billing Worker] Failed to end trial for ${user.email}:`, err);
      }
    }
    
    if (expiredTrials.length > 0) {
      console.log(`[Billing Worker] Processed ${expiredTrials.length} expired trials`);
    }
  } catch (err) {
    console.error("[Billing Worker] Error processing expired trials:", err);
  }
}

// Process daily charges for users who require billing
async function processDailyCharges() {
  try {
    const usersNeedingBilling = await storage.getUsersRequiringDailyBilling();
    
    for (const user of usersNeedingBilling) {
      try {
        // Check if user was already charged today
        if (user.lastDailyChargeAt) {
          const lastCharge = new Date(user.lastDailyChargeAt);
          const today = new Date();
          
          // If last charge was less than 23 hours ago, skip (allow some buffer)
          const hoursSinceLastCharge = (today.getTime() - lastCharge.getTime()) / (1000 * 60 * 60);
          if (hoursSinceLastCharge < 23) {
            continue;
          }
        }
        
        const dailyAmount = user.dailyChargeAmount || 100; // Default to $1/day if not set
        
        const result = await processChargeWithReferralBalance(user.id, dailyAmount);
        
        if (result.success) {
          await storage.recordDailyCharge(user.id);
          console.log(`[Billing Worker] Charged ${user.email}: $${(dailyAmount / 100).toFixed(2)} (Referral: $${((result.referralBalanceUsed || 0) / 100).toFixed(2)}, Account: $${((result.accountBalanceUsed || 0) / 100).toFixed(2)})`);
        } else {
          console.log(`[Billing Worker] Charge failed for ${user.email}: ${result.error}`);
        }
      } catch (err) {
        console.error(`[Billing Worker] Failed to charge ${user.email}:`, err);
      }
    }
    
    if (usersNeedingBilling.length > 0) {
      console.log(`[Billing Worker] Processed ${usersNeedingBilling.length} daily charges`);
    }
  } catch (err) {
    console.error("[Billing Worker] Error processing daily charges:", err);
  }
}

export async function startBillingWorker() {
  console.log("[Billing Worker] Starting daily billing scheduler...");
  
  // Run immediately on startup
  await processExpiredTrials();
  await processDailyCharges();
  
  // Run every hour (3600000 ms)
  setInterval(async () => {
    console.log("[Billing Worker] Running hourly billing check...");
    await processExpiredTrials();
    await processDailyCharges();
  }, 60 * 60 * 1000); // Every hour
}
