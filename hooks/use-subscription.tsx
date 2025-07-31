'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { UserSubscription } from '@/types/subscription';

interface SubscriptionContextType {
  subscription: UserSubscription | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/subscription/status');
      
      if (!response.ok) {
        throw new Error('Erro ao buscar informações da assinatura');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSubscription(data.data);
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
    } catch (err) {
      console.error('Erro ao buscar assinatura:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const refetch = async () => {
    await fetchSubscription();
  };

  return (
    <SubscriptionContext.Provider value={{ subscription, loading, error, refetch }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  
  // Handle build-time context issues gracefully
  if (context === undefined) {
    // During build time or when outside provider, return a fallback
    if (typeof window === 'undefined') {
      return {
        subscription: null,
        loading: true,
        error: null,
        refetch: async () => {}
      };
    }
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}