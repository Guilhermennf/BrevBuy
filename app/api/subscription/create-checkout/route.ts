import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, STRIPE_CONFIG, SUBSCRIPTION_PLANS } from "@/lib/stripe";
import {
    badRequest,
    notFound,
    ok,
    serverError,
    unauthorized,
} from "@/lib/api-response";

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
            success_url: STRIPE_CONFIG.SUCCESS_URL,
            cancel_url: STRIPE_CONFIG.CANCEL_URL,
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
