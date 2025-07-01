"use client";

import { Suspense } from "react";
import { DashboardCharts } from "./dashboard-charts";
import { DashboardChartsSkeleton } from "./dashboard-charts-skeleton";
import { useProducts } from "@/hooks/use-products-query";

function DashboardChartsWrapper() {
  const { data: products, isLoading, error } = useProducts();

  if (isLoading) {
    return <DashboardChartsSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Erro ao carregar gráficos</p>
      </div>
    );
  }

  return <DashboardCharts />;
}

export function DashboardChartsWithSuspense() {
  return (
    <Suspense fallback={<DashboardChartsSkeleton />}>
      <DashboardChartsWrapper />
    </Suspense>
  );
}
