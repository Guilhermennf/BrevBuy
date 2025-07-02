"use client";

import { StatsCards } from "./stats-cards";
import { useProducts } from "@/hooks/use-products-query";
import { LoadingSkeletonWrapper } from "@/components/ui/loading-skeleton-wrapper";

function StatsCardsWrapper() {
  const { error, isLoading } = useProducts();

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Erro ao carregar estatísticas</p>
      </div>
    );
  }

  return (
    <LoadingSkeletonWrapper
      isLoading={isLoading}
      skeletonType="grid"
      skeletonCount={4}
    >
      <StatsCards />
    </LoadingSkeletonWrapper>
  );
}

export function StatsCardsWithSuspense() {
  return <StatsCardsWrapper />;
}
