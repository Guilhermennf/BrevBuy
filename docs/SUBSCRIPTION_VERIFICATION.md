# Subscription Verification System

This document describes the subscription verification system implemented in BrevBuy to restrict access to core features when a user does not have an active subscription.

## Overview

The system automatically checks whether the user has:
- An active subscription (monthly or annual)
- A valid free trial period (7 days)
- Access to system features

## Policy by HTTP Method

- **GET/HEAD/OPTIONS**
  - Do not go through subscription verification.
  - They may still require authentication (depending on the endpoint), but they are not blocked by subscription/trial status.
- **POST/PUT/PATCH**
  - Require subscription/trial verification.
  - If the trial is expired, the subscription is canceled/expired, or there is no valid subscription, returns 403 with `requiresUpgrade: true`.

## Verification Middleware

### `verifySubscriptionAccess()`

Located at: `lib/subscription-middleware.ts`

This middleware function:
1. Checks whether the user is authenticated
2. For GET/HEAD/OPTIONS methods, returns the user without checking subscription
3. For POST/PUT/PATCH methods, checks subscription via `hasSubscriptionAccess()`
4. Returns a 403 error with a specific message if access is denied
5. Returns user data if access is allowed

### Subscription Status Types

- **`free_trial`**: 7-day free trial period
- **`active`**: Active subscription (monthly or annual)
- **`cancelled`**: Canceled subscription
- **`expired`**: Trial or subscription expired

## Protected Endpoints (subscription verification)

Subscription verification applies only to POST/PUT/PATCH:

### Products
- `POST /api/products` - Create product
- `PUT /api/products/[id]` - Update product
- `PATCH /api/products/[id]/sell` - Mark product as sold
- `DELETE /api/products/[id]` - Note: currently does not require subscription verification (may change in the future)

### Categories
- `POST /api/categories` - Create category
- `PUT /api/categories/[id]` - Update category

### Automation
- `POST /api/automation/analyze-screenshot` - AI screenshot analysis

## Endpoints NOT Protected (by subscription)

The following endpoints remain accessible without subscription verification (they may still require authentication if the handler enforces it):

### Read (GET)
- `GET /api/products` - List products
- `GET /api/products/[id]` - Get a specific product
- `GET /api/categories` - List categories
- `GET /api/categories/[id]` - Get a specific category

### Authentication
- All endpoints under `/api/auth/*`
- Login, registration, password recovery, etc.

### Subscription
- `GET /api/subscription/status` - Subscription status
- `POST /api/subscription/create-checkout` - Create checkout
- `GET /api/subscription/plans` - Available plans
- `POST /api/subscription/webhook` - Stripe webhook

### Cron Jobs
- `POST /api/cron/check-trials` - Automatic trial check

## Error Messages

When access is denied, the system returns 403 with specific messages:

### Free Trial Expired
```json
{
  "error": "Access denied. Your 7-day free trial has expired. Upgrade to continue using the system.",
  "subscriptionStatus": "free_trial",
  "requiresUpgrade": true
}
```

### Subscription Canceled
```json
{
  "error": "Access denied. Your subscription has been canceled. Reactivate your subscription to continue using the system.",
  "subscriptionStatus": "cancelled",
  "requiresUpgrade": true
}
```

### No Subscription
```json
{
  "error": "Access denied. You need an active subscription to access this feature.",
  "subscriptionStatus": "expired",
  "requiresUpgrade": true
}
```

## Frontend Implementation

The frontend should handle 403 errors and redirect the user to the upgrade page (this will only happen on POST/PUT/PATCH):

```typescript
// Frontend handling example
if (response.status === 403) {
  const errorData = await response.json();
  if (errorData.requiresUpgrade) {
    // Redirect to upgrade page
    router.push('/upgrade');
    // Or show an upgrade modal
  }
}
```

## Verification Logic

Verification follows this priority order (when applied to POST/PUT/PATCH):

1. **Canceled Subscription**: Always denies access
2. **Active Subscription**: Checks whether `currentPeriodEnd` is still valid
3. **Trial Period**: Checks whether it is still within 7 days
4. **Other Statuses**: Denies access

## Security

- Verification is always done on the server (backend)
- Does not rely on frontend data
- Direct database query
- Resource ownership validation (`userId`)

## Monitoring

To monitor denied access attempts:

1. Logs are automatically generated
2. Metrics can be collected from 403 errors
3. Conversion analysis for blocked users

## Maintenance

To protect new mutable endpoints (POST/PUT/PATCH):

```typescript
import { verifySubscriptionAccess } from "@/lib/subscription-middleware";

export async function POST(request: NextRequest) {
  const { error, user } = await verifySubscriptionAccess(request);
  if (error) return error;
  // logic...
}
```

For public GET endpoints (without requiring login), just do not call the middleware in the route. For authenticated GET endpoints, call the middleware as usual — it will only ensure the user exists without blocking by subscription.

### Modifying Messages

Messages can be customized at:
- `lib/subscription-middleware.ts`
- `createSubscriptionErrorResponse()` function

## Tests

To test the system:

1. **Test with valid trial user**: Should have access
2. **Test with expired trial**: Should be blocked
3. **Test with active subscription**: Should have access
4. **Test with canceled subscription**: Should be blocked
5. **Test without authentication**: Should return 401

## Future Considerations

- Implement rate limiting by subscription type
- Add usage metrics per user
- Implement limited features for free users
- Add near-expiration notifications
