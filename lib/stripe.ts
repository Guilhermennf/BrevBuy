import Stripe from 'stripe';
import { SubscriptionPlan } from '@/types/subscription';

// Initialize Stripe with proper error handling for build environments
let stripe: Stripe;

if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
} else {
  // For build/development environments without keys, create a placeholder
  console.warn('STRIPE_SECRET_KEY is not set - using placeholder for build');
  stripe = {} as Stripe;
}

export { stripe };

export const STRIPE_CONFIG = {
  PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  SUCCESS_URL: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard?checkout=success`,
  CANCEL_URL: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/upgrade?checkout=cancelled`,
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'monthly',
    name: 'Plano Mensal PRO',
    description: 'Acesso completo às funcionalidades premium',
    price: 9.99,
    currency: 'BRL',
    interval: 'month',
    stripePriceId: process.env.STRIPE_MONTHLY_PRICE_ID || '',
    features: [
      'Importação automática de produtos',
      'Análise de preços com IA',
      'Relatórios avançados',
      'Suporte prioritário',
      'Sem limite de produtos'
    ]
  },
  {
    id: 'annual',
    name: 'Plano Anual PRO',
    description: 'Acesso completo com desconto anual',
    price: 99.99,
    currency: 'BRL',
    interval: 'year',
    stripePriceId: process.env.STRIPE_ANNUAL_PRICE_ID || '',
    features: [
      'Importação automática de produtos',
      'Análise de preços com IA',
      'Relatórios avançados',
      'Suporte prioritário',
      'Sem limite de produtos',
      'Economia de 17% vs plano mensal'
    ]
  }
];

export const TRIAL_PERIOD_DAYS = 7;