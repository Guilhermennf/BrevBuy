"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useUpdateProfile } from "@/hooks/use-profile";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Settings,
    User,
    Crown,
    Check,
    Loader2,
    CreditCard,
    ExternalLink,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "@/hooks/use-toast";
import { SubscriptionPlan } from "@/types/subscription";
import { useSubscription } from "@/hooks/use-subscription";

export default function ConfiguracoesPage() {
    const { data: session, update: updateSession } = useSession();
    const { theme, setTheme } = useTheme();
    const { subscription } = useSubscription();
    const updateProfileMutation = useUpdateProfile();
    const searchParams = useSearchParams();
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [checkingOut, setCheckingOut] = useState<string | null>(null);
    const [loadingPortal, setLoadingPortal] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
    });

    useEffect(() => {
        if (session?.user) {
            setFormData({
                name: session.user.name || "",
                email: session.user.email || "",
            });
        }
    }, [session]);

    useEffect(() => {
        fetchPlans();

        // Verificar parâmetros de checkout
        const checkout = searchParams.get("checkout");
        if (checkout === "success") {
            toast({
                title: "Sucesso!",
                description: "Sua assinatura foi ativada com sucesso!",
                variant: "default",
            });
        } else if (checkout === "cancelled") {
            toast({
                title: "Checkout cancelado",
                description:
                    "O processo de pagamento foi cancelado. Você pode tentar novamente quando quiser.",
                variant: "destructive",
            });
        }
    }, [searchParams]);

    const fetchPlans = async () => {
        try {
            const response = await fetch("/api/subscription/plans");
            const data = await response.json();

            if (data.success) {
                setPlans(data.data);
            }
        } catch (error) {
            console.error("Erro ao buscar planos:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleManageSubscription = async () => {
        setLoadingPortal(true);
        try {
            const response = await fetch("/api/subscription/customer-portal", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Erro ao acessar portal de gerenciamento"
                );
            }

            // Redirecionar para o portal do Stripe
            window.location.href = data.url;
        } catch (error) {
            console.error("Erro ao acessar portal:", error);
            toast({
                title: "Erro",
                description:
                    error instanceof Error
                        ? error.message
                        : "Erro ao acessar portal de gerenciamento",
                variant: "destructive",
            });
        } finally {
            setLoadingPortal(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSaveProfile = async () => {
        if (!formData.name.trim()) {
            toast({
                title: "Erro",
                description: "Nome é obrigatório",
                variant: "destructive",
            });
            return;
        }

        updateProfileMutation.mutate(
            {
                name: formData.name.trim(),
            },
            {
                onSuccess: async (data) => {
                    await updateSession({
                        ...session,
                        user: {
                            ...session?.user,
                            name: data.user.name,
                        },
                    });
                },
            }
        );
    };

    const handleSubscribe = async (planId: string) => {
        if (!session) {
            return;
        }

        try {
            setCheckingOut(planId);

            const response = await fetch("/api/subscription/create-checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ planId }),
            });

            const data = await response.json();

            if (data.success && data.data.url) {
                window.location.href = data.data.url;
            } else {
                throw new Error(data.error || "Erro ao criar checkout");
            }
        } catch (error) {
            console.error("Erro ao iniciar checkout:", error);
            toast({
                title: "Erro",
                description: "Erro ao processar pagamento. Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setCheckingOut(null);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Configurações</h1>
                <p className="text-muted-foreground">
                    Personalize sua experiência
                </p>
            </div>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-1">
                {/* Perfil do Usuário */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Perfil do Usuário
                        </CardTitle>
                        <CardDescription>
                            Informações básicas da conta
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome completo</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Seu nome completo"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="seu@email.com"
                                disabled
                            />
                            <p className="text-xs text-muted-foreground">
                                O email não pode ser alterado
                            </p>
                        </div>
                        <Button
                            onClick={handleSaveProfile}
                            disabled={updateProfileMutation.isPending}
                        >
                            <Settings className="mr-2 h-4 w-4" />
                            {updateProfileMutation.isPending
                                ? "Salvando..."
                                : "Salvar Alterações"}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Status da Assinatura */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Status da Assinatura
                    </CardTitle>
                    <CardDescription>
                        Informações sobre seu plano atual
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-1">
                                <p className="font-medium">
                                    Plano Atual:{" "}
                                    {subscription?.hasAccess ? (
                                        <Badge className="ml-2">
                                            <Crown className="h-3 w-3 mr-1" />
                                            PRO{" "}
                                            {subscription.planType === "monthly"
                                                ? "Mensal"
                                                : "Anual"}
                                        </Badge>
                                    ) : (
                                        <Badge
                                            variant="secondary"
                                            className="ml-2"
                                        >
                                            Gratuito
                                        </Badge>
                                    )}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {subscription?.subscriptionStatus ===
                                        "active" && "Assinatura ativa"}
                                    {subscription?.subscriptionStatus ===
                                        "cancelled" && "Assinatura cancelada"}
                                    {subscription?.subscriptionStatus ===
                                        "free_trial" &&
                                        subscription?.isTrialActive &&
                                        `Período de teste - ${subscription.daysLeftInTrial} dias restantes`}
                                    {subscription?.subscriptionStatus ===
                                        "free_trial" &&
                                        !subscription?.isTrialActive &&
                                        "Período de teste expirado"}
                                    {subscription?.subscriptionStatus ===
                                        "expired" && "Assinatura expirada"}
                                </p>
                                {subscription?.currentPeriodEnd &&
                                    subscription?.subscriptionStatus ===
                                        "active" && (
                                        <p className="text-xs text-muted-foreground">
                                            Próxima cobrança:{" "}
                                            {new Date(
                                                subscription.currentPeriodEnd
                                            ).toLocaleDateString("pt-BR")}
                                        </p>
                                    )}
                            </div>
                        </div>

                        {subscription?.hasAccess &&
                            subscription?.subscriptionStatus === "active" && (
                                <div className="border-t pt-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                                        <h4 className="font-medium">
                                            Gerenciar Assinatura
                                        </h4>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Acesse o portal de gerenciamento para
                                        alterar seu plano, atualizar forma de
                                        pagamento ou cancelar sua assinatura.
                                    </p>
                                    <Button
                                        onClick={handleManageSubscription}
                                        disabled={loadingPortal}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        {loadingPortal ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                Carregando...
                                            </>
                                        ) : (
                                            <>
                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                Gerenciar Assinatura
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                    </div>
                </CardContent>
            </Card>

            {/* Planos de Assinatura */}
            {!subscription?.hasAccess && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Crown className="h-5 w-5" />
                            Planos Disponíveis
                        </CardTitle>
                        <CardDescription>
                            Escolha o plano ideal para suas necessidades
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-6 ">
                                {plans.map((plan) => (
                                    <Card
                                        key={plan.id}
                                        className={`relative ${
                                            plan.id === "annual"
                                                ? "border-primary shadow-lg"
                                                : ""
                                        }`}
                                    >
                                        {plan.id === "annual" && (
                                            <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                                                Mais Popular
                                            </Badge>
                                        )}

                                        <CardHeader>
                                            <div className="flex items-center gap-2">
                                                <Crown className="h-5 w-5 text-primary" />
                                                <CardTitle>
                                                    {plan.name}
                                                </CardTitle>
                                            </div>
                                            <CardDescription>
                                                {plan.description}
                                            </CardDescription>

                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-bold">
                                                    R${" "}
                                                    {plan.price
                                                        .toFixed(2)
                                                        .replace(".", ",")}
                                                </span>
                                                <span className="text-muted-foreground">
                                                    /
                                                    {plan.interval === "month"
                                                        ? "mês"
                                                        : "ano"}
                                                </span>
                                            </div>

                                            {plan.id === "annual" && (
                                                <Badge
                                                    variant="secondary"
                                                    className="w-fit"
                                                >
                                                    Economia de 17%
                                                </Badge>
                                            )}
                                        </CardHeader>

                                        <CardContent className="pt-auto">
                                            <ul className="space-y-2 mb-6">
                                                {plan.features.map(
                                                    (feature, index) => (
                                                        <li
                                                            key={index}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <Check className="h-4 w-4 text-green-600" />
                                                            <span className="text-sm">
                                                                {feature}
                                                            </span>
                                                        </li>
                                                    )
                                                )}
                                            </ul>

                                            <Button
                                                onClick={() =>
                                                    handleSubscribe(plan.id)
                                                }
                                                disabled={
                                                    checkingOut === plan.id
                                                }
                                                className="w-full"
                                                variant={
                                                    plan.id === "annual"
                                                        ? "default"
                                                        : "outline"
                                                }
                                            >
                                                {checkingOut === plan.id ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                        Processando...
                                                    </>
                                                ) : (
                                                    "Assinar Agora"
                                                )}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
