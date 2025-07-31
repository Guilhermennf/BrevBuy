'use client';

import { useSubscription } from '@/hooks/use-subscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Clock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export function SubscriptionStatus() {
  const { subscription, loading } = useSubscription();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Status da Assinatura
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return null;
  }

  const getStatusColor = () => {
    if (subscription.subscriptionStatus === 'active') return 'bg-green-500';
    if (subscription.isTrialActive) return 'bg-blue-500';
    return 'bg-red-500';
  };

  const getStatusText = () => {
    if (subscription.subscriptionStatus === 'active') {
      return `Assinatura Ativa - ${subscription.planType === 'monthly' ? 'Mensal' : 'Anual'}`;
    }
    if (subscription.isTrialActive) {
      return `Período Gratuito - ${subscription.daysLeftInTrial} dias restantes`;
    }
    return 'Assinatura Expirada';
  };

  const getIcon = () => {
    if (subscription.subscriptionStatus === 'active') return <Crown className="h-5 w-5" />;
    if (subscription.isTrialActive) return <Clock className="h-5 w-5" />;
    return <AlertTriangle className="h-5 w-5" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getIcon()}
          Status da Assinatura
        </CardTitle>
        <CardDescription>
          Gerencie sua assinatura e acesso às funcionalidades premium
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
            <span className="font-medium">{getStatusText()}</span>
          </div>

          {subscription.subscriptionStatus === 'active' && subscription.currentPeriodEnd && (
            <div className="text-sm text-muted-foreground">
              Renovação em: {new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR')}
            </div>
          )}

          {subscription.isTrialActive && subscription.daysLeftInTrial <= 3 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Seu período gratuito está acabando!
                </span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Faça upgrade para PRO para continuar usando todas as funcionalidades.
              </p>
            </div>
          )}

          {!subscription.hasAccess && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Acesso Limitado
                </span>
              </div>
              <p className="text-sm text-red-700 mt-1">
                Sua assinatura expirou. Faça upgrade para continuar usando o BrevBuy.
              </p>
            </div>
          )}

          <div className="flex gap-2">
            {!subscription.hasAccess || subscription.isTrialActive ? (
              <Button asChild>
                <Link href="/upgrade">
                  {subscription.isTrialActive ? 'Fazer Upgrade' : 'Renovar Assinatura'}
                </Link>
              </Button>
            ) : (
              <Button variant="outline" asChild>
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