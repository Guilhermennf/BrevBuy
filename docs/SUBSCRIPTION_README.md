# Stripe Subscription System - BrevBuy

This document outlines the complete implementation of the Stripe subscription system for BrevBuy.

## Features Implemented

### 🔐 Subscription Management
- **Free Trial**: 7-day trial period for all new users
- **Two Plans**: Monthly (R$9.99/month) and Annual (R$99.99/year) in BRL
- **Automatic Trial Expiration**: Background job checks and expires trials daily
- **Access Control**: Premium features protected by subscription status

### 💳 Stripe Integration
- **Checkout Sessions**: Seamless Stripe checkout experience
- **Webhooks**: Complete webhook handling for subscription events
- **Customer Management**: Automatic Stripe customer creation
- **Currency**: BRL (Brazilian Real) pricing
- **Security**: Webhook signature verification

### 🎨 User Interface
- **Subscription Status Widget**: Shows trial countdown and subscription info
- **Upgrade Page**: Beautiful pricing page with plan comparison
- **Premium Feature Guards**: Blocks access to features without subscription
- **Trial Warnings**: Shows warnings when trial is about to expire

### ⚡ Technical Features
- **TypeScript**: Fully typed subscription system
- **React Context**: Subscription state management
- **API Endpoints**: RESTful subscription management
- **Database Schema**: Extended User model with subscription fields
- **Cron Jobs**: Vercel cron integration for trial expiration

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Stripe Price IDs (create these in Stripe Dashboard)
STRIPE_MONTHLY_PRICE_ID="price_..."
STRIPE_ANNUAL_PRICE_ID="price_..."

# Optional: Cron job protection
CRON_SECRET="your-cron-secret-here"
```

## Setup Instructions

### 1. Stripe Dashboard Setup

1. **Create Products** in Stripe Dashboard:
   - Monthly Plan: R$9.99/month recurring
   - Annual Plan: R$99.99/year recurring

2. **Copy Price IDs** and add to environment variables

3. **Setup Webhook Endpoint**:
   - URL: `https://yourdomain.com/api/subscription/webhook`
   - Events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

4. **Copy Webhook Secret** and add to environment variables

### 2. Database Migration

Run the database migration to add subscription fields:

```bash
npx prisma migrate dev --name add-subscription-fields
```

Or apply the migration manually using the SQL in `migrations/add_subscription_fields.sql`

### 3. Test the Implementation

1. **Create a test user** and verify they start with `free_trial` status
2. **Access the upgrade page** at `/upgrade`
3. **Test the checkout flow** with Stripe test cards
4. **Verify webhook handling** by checking Stripe webhook logs
5. **Test trial expiration** by manually updating trial dates

## API Endpoints

### GET `/api/subscription/status`
Returns current user's subscription information including trial status.

### POST `/api/subscription/create-checkout`
Creates a Stripe checkout session for the specified plan.

### POST `/api/subscription/webhook`
Handles Stripe webhook events to update subscription status.

### GET `/api/subscription/plans`
Returns available subscription plans.

### POST `/api/cron/check-trials`
Background job to check and expire trials (called by Vercel cron).

## Components

### `<SubscriptionProvider>`
React context provider that manages subscription state throughout the app.

### `<SubscriptionStatus>`
Dashboard widget displaying current subscription status and trial countdown.

### `<SubscriptionGuard>`
Higher-order component that protects premium features from non-subscribers.

### Upgrade Page
Complete pricing page with Stripe checkout integration.

## Usage Examples

### Protecting Premium Features

```tsx
import { SubscriptionGuard } from '@/components/subscription-guard';

function PremiumFeature() {
  return (
    <SubscriptionGuard featureName="Advanced Analytics">
      {/* Premium content here */}
    </SubscriptionGuard>
  );
}
```

### Using Subscription Context

```tsx
import { useSubscription } from '@/hooks/use-subscription';

function MyComponent() {
  const { subscription, loading } = useSubscription();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {subscription?.hasAccess ? (
        <div>Premium content</div>
      ) : (
        <div>Upgrade to access this feature</div>
      )}
    </div>
  );
}
```

## Database Schema

The User model has been extended with the following subscription fields:

```prisma
model User {
  // ... existing fields
  
  // Subscription fields
  subscriptionStatus String   @default("free_trial")
  trialStartDate     DateTime @default(now())
  trialEndDate       DateTime?
  subscriptionId     String?
  customerId         String?  @unique
  currentPeriodEnd   DateTime?
  planType          String?
}
```

## Security Considerations

- Webhook signature verification is implemented
- Subscription status is verified server-side
- Trial expiration is checked on both client and server
- API endpoints require authentication
- Cron job endpoint can be protected with secret token

## Monitoring and Maintenance

- Monitor Stripe webhook delivery in dashboard
- Check Vercel cron job execution logs
- Monitor trial expiration job success rate
- Track subscription conversion metrics
- Monitor failed payment events

## Troubleshooting

### Common Issues

1. **Webhook not working**: Verify webhook URL and secret
2. **Trial not expiring**: Check cron job execution
3. **Checkout failing**: Verify price IDs and Stripe keys
4. **Database errors**: Ensure migration was applied

### Debug Steps

1. Check Stripe webhook logs
2. Verify environment variables
3. Check database subscription fields
4. Test API endpoints manually
5. Monitor browser console for errors

## Future Enhancements

- Proration handling for plan changes
- Dunning management for failed payments
- Usage-based billing features
- Team/organization subscriptions
- Subscription analytics dashboard
- Email notifications for trial expiration