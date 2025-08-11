export type SubscriptionStatus =
    | "free_trial"
    | "active"
    | "expired"
    | "cancelled";
export type PlanType = "monthly" | "annual";

export interface SubscriptionPlan {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    interval: "month" | "year";
    stripePriceId: string;
    features: string[];
}

export interface UserSubscription {
    subscriptionStatus: SubscriptionStatus;
    trialStartDate: Date;
    trialEndDate: Date | null;
    subscriptionId: string | null;
    customerId: string | null;
    currentPeriodEnd: Date | null;
    planType: PlanType | null;
    isTrialActive: boolean;
    daysLeftInTrial: number;
    hasAccess: boolean;
}

export interface CheckoutSessionData {
    sessionId: string;
    url: string;
}

export interface WebhookEvent {
    id: string;
    type: string;
    data: {
        object: any;
    };
}
