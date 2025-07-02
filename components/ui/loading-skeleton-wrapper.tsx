"use client";

import { Suspense, ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface LoadingSkeletonWrapperProps {
  isLoading: boolean;
  children: ReactNode;
  skeletonType?: "card" | "list" | "grid" | "simple";
  skeletonCount?: number;
  className?: string;
}

// Componente de skeleton genérico e dinâmico
function DynamicSkeleton({
  type = "card",
  count = 3,
  className = "",
}: {
  type?: "card" | "list" | "grid" | "simple";
  count?: number;
  className?: string;
}) {
  const renderSkeletonItem = () => {
    switch (type) {
      case "card":
        return (
          <Card className={className}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 bg-muted rounded animate-pulse" />
                  <div className="h-6 w-32 bg-muted rounded animate-pulse" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                  <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-4 w-3/4 bg-muted rounded animate-pulse mb-3" />
              <div className="flex items-center justify-between">
                <div className="h-5 w-24 bg-muted rounded-full animate-pulse" />
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        );

      case "list":
        return (
          <Card className="p-4">
            <CardContent className="p-0">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-muted animate-pulse" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-6 w-32 bg-muted rounded animate-pulse" />
                    <div className="h-5 w-20 bg-muted rounded-full animate-pulse" />
                    <div className="h-5 w-24 bg-muted rounded-full animate-pulse" />
                  </div>
                  <div className="h-4 w-3/4 bg-muted rounded animate-pulse mb-3" />
                  <div className="flex items-center gap-4">
                    <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "grid":
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <div className="h-4 w-4 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 bg-muted rounded animate-pulse" />
              <div className="h-4 w-40 bg-muted rounded animate-pulse mt-2" />
            </CardContent>
          </Card>
        );

      case "simple":
        return (
          <div className="space-y-3">
            <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
          </div>
        );

      default:
        return null;
    }
  };

  const containerClass =
    type === "grid"
      ? "grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      : type === "list"
      ? "grid gap-4 grid-cols-1"
      : "space-y-4";

  return (
    <div className={containerClass}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>{renderSkeletonItem()}</div>
      ))}
    </div>
  );
}

// Wrapper principal que usa Suspense
function LoadingWrapper({
  isLoading,
  children,
  skeletonType = "card",
  skeletonCount = 3,
  className = "",
}: LoadingSkeletonWrapperProps) {
  if (isLoading) {
    return (
      <DynamicSkeleton
        type={skeletonType}
        count={skeletonCount}
        className={className}
      />
    );
  }

  return <>{children}</>;
}

// Componente principal exportado
export function LoadingSkeletonWrapper({
  isLoading,
  children,
  skeletonType = "card",
  skeletonCount = 3,
  className = "",
}: LoadingSkeletonWrapperProps) {
  return (
    <Suspense
      fallback={
        <DynamicSkeleton
          type={skeletonType}
          count={skeletonCount}
          className={className}
        />
      }
    >
      <LoadingWrapper
        isLoading={isLoading}
        skeletonType={skeletonType}
        skeletonCount={skeletonCount}
        className={className}
      >
        {children}
      </LoadingWrapper>
    </Suspense>
  );
}
