'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Loader2 } from 'lucide-react';
import { SubscriptionPlan } from '@/types/subscription';
import { useSubscription } from '@/hooks/use-subscription';

// Force this page to be dynamic to avoid pre-rendering issues
export const dynamic = 'force-dynamic';

export default function UpgradePage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);
  const { data: session } = useSession();
  const { subscription } = useSubscription();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    const checkout = searchParams.get('checkout');
    if (checkout === 'success') {
      router.push('/dashboard?upgrade=success');
    }
  }, [searchParams, router]);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/subscription/plans');
      const data = await response.json();
      
      if (data.success) {
        setPlans(data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!session) {
      router.push('/login');
      return;
    }

    try {
      setCheckingOut(planId);
      
      const response = await fetch('/api/subscription/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();
      
      if (data.success && data.data.url) {
        window.location.href = data.data.url;
      } else {
        throw new Error(data.error || 'Erro ao criar checkout');
      }
    } catch (error) {
      console.error('Erro ao iniciar checkout:', error);
      alert('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setCheckingOut(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">
          Upgrade para PRO
        </h1>
        <p className="text-lg text-muted-foreground mb-2">
          Desbloqueie todas as funcionalidades premium do BrevBuy
        </p>
        {subscription?.isTrialActive && (
          <Badge variant="secondary" className="text-sm">
            {subscription.daysLeftInTrial} dias restantes no período gratuito
          </Badge>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative ${plan.id === 'annual' ? 'border-primary shadow-lg' : ''}`}>
            {plan.id === 'annual' && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                Mais Popular
              </Badge>
            )}
            
            <CardHeader>
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                <CardTitle>{plan.name}</CardTitle>
              </div>
              <CardDescription>{plan.description}</CardDescription>
              
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">
                  R$ {plan.price.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-muted-foreground">
                  /{plan.interval === 'month' ? 'mês' : 'ano'}
                </span>
              </div>
              
              {plan.id === 'annual' && (
                <Badge variant="secondary" className="w-fit">
                  Economia de 17%
                </Badge>
              )}
            </CardHeader>
            
            <CardContent>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button
                onClick={() => handleSubscribe(plan.id)}
                disabled={checkingOut === plan.id}
                className="w-full"
                variant={plan.id === 'annual' ? 'default' : 'outline'}
              >
                {checkingOut === plan.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processando...
                  </>
                ) : (
                  'Assinar Agora'
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-8 text-sm text-muted-foreground">
        <p>✓ Cancelamento a qualquer momento</p>
        <p>✓ Suporte prioritário</p>
        <p>✓ Atualizações gratuitas</p>
      </div>
    </div>
  );
}