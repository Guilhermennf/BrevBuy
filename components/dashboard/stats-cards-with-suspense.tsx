"use client";

import { Suspense } from "react";
import { StatsCards } from "./stats-cards";
import { StatsCardsSkeleton } from "./stats-cards-skeleton";
import { useProducts } from "@/hooks/use-products-query";

function StatsCardsWrapper() {
  const { data: products, isLoading, error } = useProducts();

  if (isLoading) {
    return <StatsCardsSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Erro ao carregar estatísticas</p>
      </div>
    );
  }

  return <StatsCards />;
}

export function StatsCardsWithSuspense() {
  return (
    <Suspense fallback={<StatsCardsSkeleton />}>
      <StatsCardsWrapper />
    </Suspense>
  );
}
