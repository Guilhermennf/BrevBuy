import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe, STRIPE_CONFIG } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Assinatura do webhook ausente' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        STRIPE_CONFIG.WEBHOOK_SECRET
      );
    } catch (err: any) {
      console.error('Erro na verificação do webhook:', err.message);
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      );
    }

    console.log('Received webhook event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
        
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Erro no webhook:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  
  if (!userId) {
    console.error('User ID not found in checkout session metadata');
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
  
  await updateUserSubscription(userId, subscription, 'active');
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customer = await stripe.customers.retrieve(subscription.customer as string);
  
  if ('deleted' in customer) {
    console.error('Customer deleted');
    return;
  }

  const userId = customer.metadata?.userId;
  
  if (!userId) {
    console.error('User ID not found in customer metadata');
    return;
  }

  await updateUserSubscription(userId, subscription, 'active');
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customer = await stripe.customers.retrieve(subscription.customer as string);
  
  if ('deleted' in customer) {
    console.error('Customer deleted');
    return;
  }

  const userId = customer.metadata?.userId;
  
  if (!userId) {
    console.error('User ID not found in customer metadata');
    return;
  }

  const status = subscription.status === 'active' ? 'active' : 'expired';
  await updateUserSubscription(userId, subscription, status);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customer = await stripe.customers.retrieve(subscription.customer as string);
  
  if ('deleted' in customer) {
    console.error('Customer deleted');
    return;
  }

  const userId = customer.metadata?.userId;
  
  if (!userId) {
    console.error('User ID not found in customer metadata');
    return;
  }

  await updateUserSubscription(userId, subscription, 'cancelled');
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription;
  if (subscriptionId && typeof subscriptionId === 'string') {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    
    if ('deleted' in customer) {
      console.error('Customer deleted');
      return;
    }

    const userId = customer.metadata?.userId;
    
    if (!userId) {
      console.error('User ID not found in customer metadata');
      return;
    }

    await updateUserSubscription(userId, subscription, 'active');
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription;
  if (subscriptionId && typeof subscriptionId === 'string') {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    
    if ('deleted' in customer) {
      console.error('Customer deleted');
      return;
    }

    const userId = customer.metadata?.userId;
    
    if (!userId) {
      console.error('User ID not found in customer metadata');
      return;
    }

    // Don't immediately cancel - Stripe will retry
    console.log(`Payment failed for user ${userId}, subscription ${subscription.id}`);
  }
}

async function updateUserSubscription(
  userId: string, 
  subscription: Stripe.Subscription, 
  status: string
) {
  try {
    const planType = subscription.items.data[0]?.price?.recurring?.interval === 'month' ? 'monthly' : 'annual';
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: status,
        subscriptionId: subscription.id,
        currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null,
        planType,
      }
    });

    console.log(`Updated subscription for user ${userId}: ${status}`);
  } catch (error) {
    console.error('Error updating user subscription:', error);
  }
}