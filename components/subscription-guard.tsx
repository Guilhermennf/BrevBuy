'use client';

import { useSubscription } from '@/hooks/use-subscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Lock } from 'lucide-react';
import Link from 'next/link';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  featureName?: string;
}

export function SubscriptionGuard({ 
  children, 
  fallback,
  featureName = 'Esta funcionalidade'
}: SubscriptionGuardProps) {
  const { subscription, loading } = useSubscription();

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!subscription?.hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Card className="border-dashed">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Funcionalidade Premium
          </CardTitle>
          <CardDescription>
            {featureName} está disponível apenas para usuários PRO
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {subscription?.isTrialActive ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Você tem {subscription.daysLeftInTrial} dias restantes no seu período gratuito.
                Faça upgrade para continuar usando esta funcionalidade.
              </p>
              <Button asChild>
                <Link href="/upgrade">
                  Fazer Upgrade para PRO
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Seu período gratuito expirou. Assine o plano PRO para acessar todas as funcionalidades.
              </p>
              <Button asChild>
                <Link href="/upgrade">
                  Ver Planos
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}