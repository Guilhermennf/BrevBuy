import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasSubscriptionAccess } from "@/lib/subscription-utils";
import { SubscriptionStatus } from "@/types/subscription";

/**
 * Middleware to verify if user has active subscription access
 * Returns user data if access is granted, or error response if not
 */
export async function verifySubscriptionAccess(request: NextRequest) {
    try {
        // Check if user is authenticated
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.email) {
            return {
                error: NextResponse.json(
                    { error: "Não autorizado" },
                    { status: 401 }
                ),
                user: null
            };
        }

        // Get user with subscription data
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                id: true,
                email: true,
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
            return {
                error: NextResponse.json(
                    { error: "Usuário não encontrado" },
                    { status: 404 }
                ),
                user: null
            };
        }

        // Skip subscription verification for safe HTTP methods (GET, HEAD, OPTIONS)
        const method = request.method.toUpperCase();
        const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
        if (SAFE_METHODS.has(method)) {
            return {
                error: null,
                user: user
            };
        }

        // Check if user has subscription access
        const hasAccess = hasSubscriptionAccess(
            user.subscriptionStatus as SubscriptionStatus,
            user.trialStartDate,
            user.trialEndDate,
            user.currentPeriodEnd
        );

        if (!hasAccess) {
            let errorMessage = "Acesso negado. ";
            
            if (user.subscriptionStatus === "free_trial") {
                errorMessage += "Seu período de teste gratuito de 7 dias expirou. Faça upgrade para continuar usando o sistema.";
            } else if (user.subscriptionStatus === "cancelled") {
                errorMessage += "Sua assinatura foi cancelada. Reative sua assinatura para continuar usando o sistema.";
            } else {
                errorMessage += "Você precisa de uma assinatura ativa para acessar esta funcionalidade.";
            }

            return {
                error: NextResponse.json(
                    { 
                        error: errorMessage,
                        subscriptionStatus: user.subscriptionStatus,
                        requiresUpgrade: true
                    },
                    { status: 403 }
                ),
                user: null
            };
        }

        // User has access, return user data
        return {
            error: null,
            user: user
        };

    } catch (error) {
        console.error("Erro na verificação de assinatura:", error);
        return {
            error: NextResponse.json(
                { error: "Erro interno do servidor" },
                { status: 500 }
            ),
            user: null
        };
    }
}

/**
 * Helper function to create a standardized subscription error response
 */
export function createSubscriptionErrorResponse(
    subscriptionStatus: string,
    customMessage?: string
) {
    let message = customMessage || "Acesso negado. ";
    
    if (subscriptionStatus === "free_trial") {
        message += "Seu período de teste gratuito de 7 dias expirou. Faça upgrade para continuar.";
    } else if (subscriptionStatus === "cancelled") {
        message += "Sua assinatura foi cancelada. Reative para continuar.";
    } else {
        message += "Assinatura ativa necessária.";
    }

    return NextResponse.json(
        {
            error: message,
            subscriptionStatus,
            requiresUpgrade: true
        },
        { status: 403 }
    );
}