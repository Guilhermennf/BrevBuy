"use client";

import { useSubscription } from "@/hooks/use-subscription";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Crown,
    Clock,
    AlertTriangle,
    CheckCircle,
    Calendar,
} from "lucide-react";
import Link from "next/link";

export function SubscriptionStatus() {
    const { subscription, loading } = useSubscription();

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-5 w-5 bg-muted rounded animate-pulse" />
                            <div className="h-6 w-32 bg-muted rounded animate-pulse" />
                        </div>
                        <div className="h-6 w-16 bg-muted rounded-full animate-pulse" />
                    </div>
                    <div className="h-4 w-48 bg-muted rounded animate-pulse" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg border">
                            <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                            <div className="flex-1">
                                <div className="h-4 w-32 bg-muted rounded animate-pulse mb-1" />
                                <div className="h-4 w-40 bg-muted rounded animate-pulse" />
                            </div>
                        </div>
                        <div className="h-10 w-full bg-muted rounded animate-pulse" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!subscription) {
        return null;
    }

    const getStatusConfig = () => {
        if (subscription.subscriptionStatus === "active") {
            return {
                icon: <CheckCircle className="h-5 w-5 text-green-600" />,
                badge: (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                        Ativo
                    </Badge>
                ),
                title: "Assinatura Ativa",
                description: `Plano ${
                    subscription.planType === "monthly" ? "Mensal" : "Anual"
                } - Acesso completo`,
            };
        }
        if (subscription.isTrialActive) {
            return {
                icon: <Clock className="h-5 w-5 text-blue-600" />,
                badge: (
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        Período Gratuito
                    </Badge>
                ),
                title: "Período Gratuito",
                description: `${subscription.daysLeftInTrial} dias restantes`,
            };
        }
        return {
            icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
            badge: (
                <Badge className="bg-red-100 text-red-800 border-red-200">
                    Expirado
                </Badge>
            ),
            title: "Assinatura Expirada",
            description: "Renove para continuar usando",
        };
    };

    const statusConfig = getStatusConfig();

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-white">
                        {statusConfig.icon}
                        {statusConfig.title}
                    </CardTitle>
                    {statusConfig.badge}
                </div>
                <CardDescription className="text-gray-300">
                    {statusConfig.description}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {subscription.subscriptionStatus === "active" &&
                        subscription.currentPeriodEnd && (
                            <div className="flex items-center gap-2 p-3 border border-grey-600 rounded-lg">
                                <Calendar className="h-4 w-4 text-green-600" />
                                <div>
                                    <p className="text-sm font-medium text-white">
                                        Próxima renovação
                                    </p>
                                    <p className="text-sm text-gray-300">
                                        {new Date(
                                            subscription.currentPeriodEnd
                                        ).toLocaleDateString("pt-BR", {
                                            day: "2-digit",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </p>
                                </div>
                            </div>
                        )}

                    {subscription.isTrialActive &&
                        subscription.daysLeftInTrial <= 3 && (
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-center gap-2 text-yellow-800">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span className="text-sm font-medium">
                                        Período gratuito acabando!
                                    </span>
                                </div>
                                <p className="text-sm text-yellow-700 mt-1">
                                    Faça upgrade para PRO para continuar usando
                                    todas as funcionalidades.
                                </p>
                            </div>
                        )}

                    {!subscription.hasAccess && !subscription.isTrialActive && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center gap-2 text-red-800">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                    Acesso Limitado
                                </span>
                            </div>
                            <p className="text-sm text-red-700 mt-1">
                                Sua assinatura expirou. Faça upgrade para
                                continuar usando o BrevBuy.
                            </p>
                        </div>
                    )}

                    <div className="flex gap-2">
                        {!subscription.hasAccess ||
                        subscription.isTrialActive ? (
                            <Button asChild className="w-full">
                                <Link href="/upgrade">
                                    {subscription.isTrialActive
                                        ? "Fazer Upgrade"
                                        : "Renovar Assinatura"}
                                </Link>
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                asChild
                                className="w-full"
                            >
                                <Link href="/upgrade">
                                    Gerenciar Assinatura
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
