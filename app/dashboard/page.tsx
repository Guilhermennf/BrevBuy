"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useProducts } from "@/hooks/use-products-query";
import { LoadingSkeletonWrapper } from "@/components/ui/loading-skeleton-wrapper";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { SubscriptionStatus } from "@/components/subscription-status";
import { useToast } from "@/hooks/use-toast";

// Força renderização dinâmica para evitar problemas de build
export const dynamic = "force-dynamic";

function DashboardContent() {
  const { error, isLoading } = useProducts();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const upgrade = searchParams.get('upgrade');
    if (upgrade === 'success') {
      toast({
        title: "Assinatura ativada!",
        description: "Sua assinatura PRO foi ativada com sucesso. Aproveite todas as funcionalidades premium!",
      });
      // Remove the parameter from URL
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [searchParams, toast]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do seu negócio</p>
        </div>
      </div>

      {/* Subscription Status */}
      <SubscriptionStatus />

      <LoadingSkeletonWrapper
        isLoading={isLoading}
        skeletonType="grid"
        skeletonCount={4}
      >
        <StatsCards />
      </LoadingSkeletonWrapper>

      <LoadingSkeletonWrapper
        isLoading={isLoading}
        skeletonType="card"
        skeletonCount={1}
      >
        <DashboardCharts />
      </LoadingSkeletonWrapper>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
