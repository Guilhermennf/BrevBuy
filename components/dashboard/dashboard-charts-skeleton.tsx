"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp, BarChart3, Tag } from "lucide-react";

export function DashboardChartsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Métricas de Performance Skeleton */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Métricas de Performance
          </CardTitle>
          <CardDescription>
            Indicadores chave de desempenho do seu negócio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="text-center space-y-1">
                <div className="text-xl sm:text-2xl font-bold bg-muted animate-pulse h-8 rounded" />
                <div className="text-xs sm:text-sm text-muted-foreground bg-muted animate-pulse h-4 rounded w-20 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gráficos lado a lado Skeleton */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Gráfico de Pizza Skeleton */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              Distribuição por Categoria
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Quantidade de produtos por categoria
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36 bg-muted animate-pulse rounded-full" />
              <div className="space-y-2 w-full sm:w-auto">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-muted animate-pulse rounded-full" />
                    <div className="h-4 bg-muted animate-pulse rounded flex-1" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Barras Skeleton */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
              Performance por Categoria
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Investimento vs Receita por categoria (Top 5)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3 sm:space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <div className="h-4 bg-muted animate-pulse rounded w-20" />
                    <div className="h-4 bg-muted animate-pulse rounded w-16" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="w-12 sm:w-16 text-xs text-muted-foreground flex-shrink-0">
                        Investido
                      </div>
                      <div className="flex-1 bg-muted rounded-full h-1.5 sm:h-2 animate-pulse" />
                      <div className="w-16 sm:w-20 text-xs text-right flex-shrink-0">
                        <div className="h-3 bg-muted animate-pulse rounded w-12 ml-auto" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="w-12 sm:w-16 text-xs text-muted-foreground flex-shrink-0">
                        Vendido
                      </div>
                      <div className="flex-1 bg-muted rounded-full h-1.5 sm:h-2 animate-pulse" />
                      <div className="w-16 sm:w-20 text-xs text-right flex-shrink-0">
                        <div className="h-3 bg-muted animate-pulse rounded w-12 ml-auto" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Relatório por Categorias Skeleton */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Relatório por Categorias
          </CardTitle>
          <CardDescription>
            Performance detalhada de cada categoria de produtos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded w-32" />
                  <div className="h-3 bg-muted animate-pulse rounded w-24" />
                </div>
                <div className="space-y-2 text-right">
                  <div className="h-4 bg-muted animate-pulse rounded w-20 ml-auto" />
                  <div className="h-3 bg-muted animate-pulse rounded w-16 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
