import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { badRequest, message, serverError } from "@/lib/api-response";

function getStripeConfig() {
    return {
        WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,
    };
}

async function getStripe() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
        throw new Error("STRIPE_SECRET_KEY is not set");
    }
    const { default: Stripe } = await import("stripe");
    return new Stripe(secretKey);
}

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const headersList = headers();
        const signature = headersList.get("stripe-signature");

        if (!signature) {
            return badRequest("Assinatura do webhook ausente");
        }

        const stripe = await getStripe();
        let event: any;

        try {
            event = stripe.webhooks.constructEvent(
                body,
                signature,
                getStripeConfig().WEBHOOK_SECRET
            );
        } catch (err: any) {
            console.error("Erro na validação do webhook:", err.message);
            return badRequest(`Erro na validação do webhook: ${err.message}`);
        }

        // Processar eventos
        switch (event.type) {
            case "checkout.session.completed":
                await handleCheckoutCompleted(event.data.object);
                break;
            case "customer.subscription.created":
                await handleSubscriptionCreated(event.data.object);
                break;
            case "customer.subscription.updated":
                await handleSubscriptionUpdated(event.data.object);
                break;
            case "customer.subscription.deleted":
                await handleSubscriptionDeleted(event.data.object);
                break;
            case "invoice.payment_succeeded":
                await handlePaymentSucceeded(event.data.object);
                break;
            case "invoice.payment_failed":
                await handlePaymentFailed(event.data.object);
                break;
            default:
                console.log(`Evento não tratado: ${event.type}`);
        }

        return message("Webhook processado com sucesso");
    } catch (error: any) {
        console.error("Erro no webhook:", error);
        return serverError("Erro interno do servidor");
    }
}

async function handleCheckoutCompleted(session: any) {
    const userId = session.metadata?.userId;

    if (!userId) {
        console.error("User ID not found in checkout session metadata");
        return;
    }

    const stripe = await getStripe();
    const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
    );

    await updateUserSubscription(userId, subscription, "active");
}

async function handleSubscriptionCreated(subscription: any) {
    const stripe = await getStripe();
    const customer = await stripe.customers.retrieve(
        subscription.customer as string
    );

    if ("deleted" in customer) {
        console.error("Cliente foi deletado");
        return;
    }

    const user = customer.email ? await prisma.user.findUnique({
        where: { email: customer.email },
    }) : null;

    if (user) {
        await updateUserSubscription(user.id, subscription, "active");
    }
}

async function handleSubscriptionUpdated(subscription: any) {
    const stripe = await getStripe();
    const customer = await stripe.customers.retrieve(
        subscription.customer as string
    );

    if ("deleted" in customer) {
        console.error("Cliente foi deletado");
        return;
    }

    const user = customer.email ? await prisma.user.findUnique({
        where: { email: customer.email },
    }) : null;

    if (user) {
        const status = subscription.status === "active" ? "active" : "inactive";
        await updateUserSubscription(user.id, subscription, status);
    }
}

async function handleSubscriptionDeleted(subscription: any) {
    const stripe = await getStripe();
    const customer = await stripe.customers.retrieve(
        subscription.customer as string
    );

    if ("deleted" in customer) {
        console.error("Cliente foi deletado");
        return;
    }

    const user = customer.email ? await prisma.user.findUnique({
        where: { email: customer.email },
    }) : null;

    if (user) {
        await updateUserSubscription(user.id, subscription, "canceled");
    }
}

async function handlePaymentSucceeded(invoice: any) {
    const subscriptionId = invoice.subscription as string;
    if (subscriptionId) {
        const stripe = await getStripe();
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const customer = await stripe.customers.retrieve(
            subscription.customer as string
        );

        if ("deleted" in customer) {
            console.error("Cliente foi deletado");
            return;
        }

        const user = customer.email ? await prisma.user.findUnique({
            where: { email: customer.email },
        }) : null;

        if (user) {
            await updateUserSubscription(user.id, subscription, "active");
        }
    }
}

async function handlePaymentFailed(invoice: any) {
    const subscriptionId = invoice.subscription as string;
    if (subscriptionId) {
        const stripe = await getStripe();
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const customer = await stripe.customers.retrieve(
            subscription.customer as string
        );

        if ("deleted" in customer) {
            console.error("Cliente foi deletado");
            return;
        }

        const user = customer.email ? await prisma.user.findUnique({
            where: { email: customer.email },
        }) : null;

        if (user) {
            await updateUserSubscription(user.id, subscription, "payment_failed");
        }
    }
}

async function updateUserSubscription(
    userId: string,
    subscription: any,
    status: string
) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                subscriptionStatus: status,
                subscriptionId: subscription.id,
                planType: subscription.items.data[0]?.price?.lookup_key || "unknown",
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
        });
        console.log(`Assinatura atualizada para usuário ${userId}: ${status}`);
    } catch (error) {
        console.error("Erro ao atualizar assinatura:", error);
    }
}
