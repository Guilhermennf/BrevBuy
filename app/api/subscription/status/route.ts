import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserSubscriptionInfo } from "@/lib/subscription-utils";
import { unauthorized, notFound, ok, serverError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return unauthorized();
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                subscriptionStatus: true,
                trialStartDate: true,
                trialEndDate: true,
                subscriptionId: true,
                customerId: true,
                currentPeriodEnd: true,
                planType: true,
            },
        });

        if (!user) {
            return notFound("Usuário não encontrado");
        }

        const subscriptionInfo = getUserSubscriptionInfo(user);

        return ok({ success: true, data: subscriptionInfo });
    } catch (error) {
        console.error("Erro ao buscar status da assinatura:", error);
        return serverError();
    }
}
