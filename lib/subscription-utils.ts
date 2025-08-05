import { addDays, differenceInDays, isAfter } from "date-fns";
import { UserSubscription, SubscriptionStatus } from "@/types/subscription";
import { TRIAL_PERIOD_DAYS } from "./stripe";

// Define a User type that matches our schema
type User = {
    id: string;
    subscriptionStatus: string;
    trialStartDate: Date;
    trialEndDate: Date | null;
    subscriptionId: string | null;
    customerId: string | null;
    currentPeriodEnd: Date | null;
    planType: string | null;
};

export function calculateTrialEndDate(trialStartDate: Date): Date {
    return addDays(trialStartDate, TRIAL_PERIOD_DAYS);
}

export function isTrialActive(
    trialStartDate: Date,
    trialEndDate: Date | null
): boolean {
    if (!trialEndDate) {
        trialEndDate = calculateTrialEndDate(trialStartDate);
    }
    return isAfter(trialEndDate, new Date());
}

export function getDaysLeftInTrial(
    trialStartDate: Date,
    trialEndDate: Date | null
): number {
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
    // Se a assinatura foi cancelada, não tem acesso
    if (subscriptionStatus === "cancelled") {
        return false;
    }

    // Se o usuário tem assinatura ativa, verifica se o período atual ainda é válido
    if (subscriptionStatus === "active") {
        // Se não há currentPeriodEnd, assume que a assinatura está ativa
        if (!currentPeriodEnd) {
            return true;
        }
        // Se há currentPeriodEnd, verifica se ainda é válido
        return isAfter(currentPeriodEnd, new Date());
    }

    // Se o usuário está no período de teste
    if (
        subscriptionStatus === "free_trial" &&
        isTrialActive(trialStartDate, trialEndDate)
    ) {
        return true;
    }

    return false;
}

export function getUserSubscriptionInfo(user: User): UserSubscription {
    const trialEndDate =
        user.trialEndDate || calculateTrialEndDate(user.trialStartDate);
    const isTrialActiveNow = isTrialActive(
        user.trialStartDate,
        user.trialEndDate
    );
    const daysLeftInTrial = getDaysLeftInTrial(
        user.trialStartDate,
        user.trialEndDate
    );
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
        hasAccess,
    };
}
