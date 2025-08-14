import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SUBSCRIPTION_PLANS } from "@/lib/stripe";

async function getStripe() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
        throw new Error("STRIPE_SECRET_KEY is not set");
    }
    const { default: Stripe } = await import("stripe");
    return new Stripe(secretKey);
}

function getStripeConfig() {
    return {
        SUCCESS_URL: `${process.env.NEXTAUTH_URL}/dashboard?checkout=success`,
        CANCEL_URL: `${process.env.NEXTAUTH_URL}/dashboard/configuracoes?checkout=cancelled`,
    };
}
import {
    badRequest,
    notFound,
    ok,
    serverError,
    unauthorized,
} from "@/lib/api-response";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return unauthorized();
        }

        const { planId } = await request.json();

        if (!planId) {
            return badRequest("ID do plano é obrigatório");
        }

        const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
        if (!plan) {
            return notFound("Plano não encontrado");
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                customerId: true,
            },
        });

        if (!user) {
            return notFound("Usuário não encontrado");
        }

        let customerId = user.customerId;

        // Criar customer no Stripe se não existir
        if (!customerId) {
            const stripe = await getStripe();
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.name || undefined,
                metadata: {
                    userId: user.id,
                },
            });

            customerId = customer.id;

            // Salvar o customer ID no banco
            await prisma.user.update({
                where: { id: user.id },
                data: { customerId },
            });
        }

        // Criar sessão de checkout
        const stripe = await getStripe();
        const checkoutSession = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ["card"],
            line_items: [
                {
                    price: plan.stripePriceId,
                    quantity: 1,
                },
            ],
            mode: "subscription",
            success_url: getStripeConfig().SUCCESS_URL,
            cancel_url: getStripeConfig().CANCEL_URL,
            metadata: {
                userId: user.id,
                planId: plan.id,
            },
            billing_address_collection: "required",
            allow_promotion_codes: true,
        });

        return ok(
            {
                success: true,
                data: {
                    sessionId: checkoutSession.id,
                    url: checkoutSession.url,
                },
            },
            "Sessão de checkout criada"
        );
    } catch (error) {
        console.error("Erro ao criar sessão de checkout:", error);
        return serverError();
    }
}
