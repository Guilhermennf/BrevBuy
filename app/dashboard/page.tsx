"use client";

import { Suspense } from "react";
import { useProducts } from "@/hooks/use-products-query";
import { LoadingSkeletonWrapper } from "@/components/ui/loading-skeleton-wrapper";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";

// Força renderização dinâmica para evitar problemas de build
export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const { error, isLoading } = useProducts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do seu negócio</p>
        </div>
      </div>

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
