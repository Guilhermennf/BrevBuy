import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, STRIPE_CONFIG } from "@/lib/stripe";
import {
    unauthorized,
    notFound,
    badRequest,
    ok,
    serverError,
} from "@/lib/api-response";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return unauthorized();
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                customerId: true,
                subscriptionStatus: true,
            },
        });

        if (!user) {
            return notFound("Usuário não encontrado");
        }

        // Verificar se o usuário tem uma assinatura ativa
        if (!user.customerId || user.subscriptionStatus === "free_trial") {
            return badRequest(
                "Usuário não possui assinatura ativa para gerenciar"
            );
        }

        // Criar sessão do portal de cobrança
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: user.customerId,
            return_url: `${process.env.NEXTAUTH_URL}/dashboard/configuracoes`,
        });

        return ok({ url: portalSession.url }, "Sessão do portal criada");
    } catch (error) {
        console.error("Erro ao criar sessão do portal:", error);
        return serverError();
    }
}
