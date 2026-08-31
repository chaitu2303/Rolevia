import { prisma } from '@/lib/prisma';

export const PLAN_LIMITS: Record<string, { monthlyCredits: number; isUnlimited: boolean; name: string }> = {
  FREE: { monthlyCredits: 5, isUnlimited: false, name: 'Free Starter' },
  LAUNCH: { monthlyCredits: 50, isUnlimited: false, name: 'Rolevia Launch (₹59)' },
  CAREER: { monthlyCredits: 200, isUnlimited: false, name: 'Rolevia Career (₹99)' },
  PRO: { monthlyCredits: 99999, isUnlimited: true, name: 'Rolevia Pro (₹149 / Owner Grant)' }
};

export type MonitoredFeature = 
  | 'RESUME_SCAN' 
  | 'ATS_SCAN' 
  | 'JOB_MATCH' 
  | 'TAILOR' 
  | 'INTERVIEW' 
  | 'EXPORT' 
  | 'COPILOT';

export interface CreditStatus {
  plan: string;
  planName: string;
  isUnlimited: boolean;
  totalCredits: number;
  usedCredits: number;
  remainingCredits: number;
  canUseFeature: boolean;
}

/**
 * Returns real server-calculated credit status for a user based on UsageLedger.
 */
export async function getUserCreditStatus(userId: string): Promise<CreditStatus> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true }
  });

  const planKey = (user?.subscription?.isActive && user?.subscription?.plan) 
    ? user.subscription.plan.toUpperCase() 
    : 'FREE';

  const planConfig = PLAN_LIMITS[planKey] || PLAN_LIMITS.FREE;

  // Count total credits used
  const usageAggregate = await prisma.usageLedger.aggregate({
    where: { userId },
    _sum: { creditsConsumed: true }
  });

  const usedCredits = usageAggregate._sum.creditsConsumed || 0;
  const totalCredits = planConfig.monthlyCredits;
  const remainingCredits = planConfig.isUnlimited 
    ? 99999 
    : Math.max(0, totalCredits - usedCredits);

  return {
    plan: planKey,
    planName: planConfig.name,
    isUnlimited: planConfig.isUnlimited,
    totalCredits,
    usedCredits,
    remainingCredits,
    canUseFeature: planConfig.isUnlimited || remainingCredits > 0
  };
}

/**
 * Server-enforced credit consumption. Deducts credit and records in UsageLedger.
 */
export async function consumeCredit(
  userId: string,
  feature: MonitoredFeature,
  metadata?: Record<string, any>
): Promise<{ success: boolean; error?: string; remainingCredits: number }> {
  const status = await getUserCreditStatus(userId);

  if (!status.canUseFeature) {
    // Record failed attempt
    await prisma.usageLedger.create({
      data: {
        userId,
        feature,
        actionType: 'CREDIT_DEPLETED_ATTEMPT',
        creditsConsumed: 0,
        plan: status.plan,
        result: 'INSUFFICIENT_CREDITS',
        metadata: metadata || {}
      }
    });

    return {
      success: false,
      error: `You have consumed all ${status.totalCredits} credits for your current ${status.planName} plan. Upgrade to continue.`,
      remainingCredits: 0
    };
  }

  // Consume 1 credit
  await prisma.usageLedger.create({
    data: {
      userId,
      feature,
      actionType: 'FEATURE_USAGE',
      creditsConsumed: 1,
      plan: status.plan,
      result: 'SUCCESS',
      metadata: metadata || {}
    }
  });

  const newRemaining = status.isUnlimited ? 99999 : Math.max(0, status.remainingCredits - 1);

  return {
    success: true,
    remainingCredits: newRemaining
  };
}
