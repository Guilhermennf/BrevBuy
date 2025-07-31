import { addDays, differenceInDays, isAfter } from 'date-fns';
import { UserSubscription, SubscriptionStatus } from '@/types/subscription';
import { User } from '@prisma/client';
import { TRIAL_PERIOD_DAYS } from './stripe';

export function calculateTrialEndDate(trialStartDate: Date): Date {
  return addDays(trialStartDate, TRIAL_PERIOD_DAYS);
}

export function isTrialActive(trialStartDate: Date, trialEndDate: Date | null): boolean {
  if (!trialEndDate) {
    trialEndDate = calculateTrialEndDate(trialStartDate);
  }
  return isAfter(trialEndDate, new Date());
}

export function getDaysLeftInTrial(trialStartDate: Date, trialEndDate: Date | null): number {
  if (!trialEndDate) {
    trialEndDate = calculateTrialEndDate(trialStartDate);
  }
  const daysLeft = differenceInDays(trialEndDate, new Date());
  return Math.max(0, daysLeft);
}

export function hasSubscriptionAccess(
  subscriptionStatus: SubscriptionStatus,
  trialStartDate: Date,
  trialEndDate: Date | null,
  currentPeriodEnd: Date | null
): boolean {
  // If user has active subscription
  if (subscriptionStatus === 'active' && currentPeriodEnd && isAfter(currentPeriodEnd, new Date())) {
    return true;
  }
  
  // If user is in trial period
  if (subscriptionStatus === 'free_trial' && isTrialActive(trialStartDate, trialEndDate)) {
    return true;
  }
  
  return false;
}

export function getUserSubscriptionInfo(user: User): UserSubscription {
  const trialEndDate = user.trialEndDate || calculateTrialEndDate(user.trialStartDate);
  const isTrialActiveNow = isTrialActive(user.trialStartDate, user.trialEndDate);
  const daysLeftInTrial = getDaysLeftInTrial(user.trialStartDate, user.trialEndDate);
  const hasAccess = hasSubscriptionAccess(
    user.subscriptionStatus as SubscriptionStatus,
    user.trialStartDate,
    user.trialEndDate,
    user.currentPeriodEnd
  );

  return {
    subscriptionStatus: user.subscriptionStatus as SubscriptionStatus,
    trialStartDate: user.trialStartDate,
    trialEndDate: user.trialEndDate,
    subscriptionId: user.subscriptionId,
    customerId: user.customerId,
    currentPeriodEnd: user.currentPeriodEnd,
    planType: user.planType as any,
    isTrialActive: isTrialActiveNow,
    daysLeftInTrial,
    hasAccess
  };
}