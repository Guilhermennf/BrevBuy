"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tag, BarChart3, TrendingUp } from "lucide-react";
import { CategoryReports } from "@/components/category/category-reports";
import { useProducts } from "@/hooks/use-products-query";
import { useMemo } from "react";

// Força renderização dinâmica para evitar problemas de build
export const dynamic = "force-dynamic";

function BarChart({
  data,
}: {
  data: Array<{ name: string; invested: number; sold: number; profit: number }>;
}) {
  const maxValue = Math.max(...data.map((d) => Math.max(d.invested, d.sold)));

  if (maxValue === 0)
    return <div className="text-center text-muted-foreground">Sem dados</div>;

  return (
    <div className="space-y-3 sm:space-y-4">
      {data.slice(0, 5).map((item, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="font-medium truncate max-w-[120px] sm:max-w-none">
              {item.name}
            </span>
            <span className="text-muted-foreground flex-shrink-0 ml-2">
              R$ {item.profit.toFixed(2)}
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-12 sm:w-16 text-xs text-muted-foreground flex-shrink-0">
                Investido
              </div>
              <div className="flex-1 bg-muted rounded-full h-1.5 sm:h-2 min-w-0">
                <div
                  className="bg-blue-500 h-1.5 sm:h-2 rounded-full transition-all"
                  style={{ width: `${(item.invested / maxValue) * 100}%` }}
                />
              </div>
              <div className="w-16 sm:w-20 text-xs text-right flex-shrink-0">
                R$ {item.invested.toFixed(2)}
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-12 sm:w-16 text-xs text-muted-foreground flex-shrink-0">
                Vendido
              </div>
              <div className="flex-1 bg-muted rounded-full h-1.5 sm:h-2 min-w-0">
                <div
                  className="bg-green-500 h-1.5 sm:h-2 rounded-full transition-all"
                  style={{ width: `${(item.sold / maxValue) * 100}%` }}
                />
              </div>
              <div className="w-16 sm:w-20 text-xs text-right flex-shrink-0">
                R$ {item.sold.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PieChart({
  data,
}: {
  data: Array<{ name: string; value: number; color: string }>;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulativePercentage = 0;

  if (total === 0)
    return <div className="text-center text-muted-foreground">Sem dados</div>;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
      {/* Gráfico de Pizza */}
      <div className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36 flex-shrink-0">
        <svg viewBox="0 0 42 42" className="w-full h-full">
          <circle
            cx="21"
            cy="21"
            r="15.915"
            fill="transparent"
            stroke="hsl(var(--muted))"
            strokeWidth="3"
          />
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const strokeDasharray = `${percentage} ${100 - percentage}`;
            const strokeDashoffset = 100 - cumulativePercentage;
            cumulativePercentage += percentage;

            return (
              <circle
                key={index}
                cx="21"
                cy="21"
                r="15.915"
                fill="transparent"
                stroke={item.color}
                strokeWidth="3"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 21 21)"
              />
            );
          })}
        </svg>
      </div>

      {/* Legenda */}
      <div className="space-y-1.5 sm:space-y-2 w-full sm:w-auto">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 text-xs sm:text-sm"
          >
            <div
              className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-muted-foreground truncate flex-1 sm:flex-initial">
              {item.name}
            </span>
            <span className="font-medium flex-shrink-0">{item.value}</span>
            <span className="text-xs text-muted-foreground flex-shrink-0">
              ({((item.value / total) * 100).toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PerformanceMetrics({ products }: { products: any[] }) {
  const soldProducts = products.filter((p) => p.status === "SOLD");
  const availableProducts = products.filter((p) => p.status === "AVAILABLE");

  const totalInvested = products.reduce((sum, p) => sum + p.buyPrice, 0);
  const totalSold = soldProducts.reduce(
    (sum, p) => sum + (p.sellPrice || 0),
    0
  );
  const totalProfit = soldProducts.reduce(
    (sum, p) => sum + ((p.sellPrice || 0) - p.buyPrice),
    0
  );

  const conversionRate =
    products.length > 0 ? (soldProducts.length / products.length) * 100 : 0;
  const avgTicket =
    soldProducts.length > 0 ? totalSold / soldProducts.length : 0;
  const roi = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  const metrics = [
    {
      label: "Taxa de Conversão",
      value: `${conversionRate.toFixed(1)}%`,
      color: "text-blue-600",
    },
    {
      label: "Ticket Médio",
      value: `R$ ${avgTicket.toFixed(2)}`,
      color: "text-green-600",
    },
    {
      label: "ROI",
      value: `${roi.toFixed(1)}%`,
      color: roi >= 0 ? "text-green-600" : "text-red-600",
    },
    {
      label: "Estoque",
      value: `${availableProducts.length} produtos`,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <div key={index} className="text-center space-y-1">
          <div className="text-xl sm:text-2xl font-bold">{metric.value}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">
            {metric.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardCharts() {
  const { data: products = [] } = useProducts();
  const chartData = useMemo(() => {
    if (products.length === 0)
      return { categoryDistribution: [], categoryPerformance: [] };

    // Dados para gráfico de pizza - distribuição por categoria
    const categoryGroups = products.reduce((acc: any, product: any) => {
      const categoryName = product.category?.name || "Sem categoria";
      const categoryColor = product.category?.color || "#6b7280";

      if (!acc[categoryName]) {
        acc[categoryName] = { count: 0, color: categoryColor };
      }
      acc[categoryName].count++;
      return acc;
    }, {});

    const categoryDistribution = Object.entries(categoryGroups).map(
      ([name, data]: [string, any]) => ({
        name,
        value: data.count,
        color: data.color,
      })
    );

    // Dados para gráfico de barras - performance por categoria
    const categoryPerformance = Object.entries(categoryGroups)
      .map(([name, data]: [string, any]) => {
        const categoryProducts = products.filter(
          (p) => (p.category?.name || "Sem categoria") === name
        );
        const soldProducts = categoryProducts.filter(
          (p) => p.status === "SOLD"
        );

        const invested = categoryProducts.reduce(
          (sum, p) => sum + p.buyPrice,
          0
        );
        const sold = soldProducts.reduce(
          (sum, p) => sum + (p.sellPrice || 0),
          0
        );
        const profit = soldProducts.reduce(
          (sum, p) => sum + ((p.sellPrice || 0) - p.buyPrice),
          0
        );

        return {
          name,
          invested,
          sold,
          profit,
        };
      })
      .sort((a, b) => b.invested - a.invested);

    return { categoryDistribution, categoryPerformance };
  }, [products]);

  return (
    <div className="space-y-6">
      {/* Métricas de Performance */}
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
          <PerformanceMetrics products={products} />
        </CardContent>
      </Card>

      {/* Gráficos lado a lado */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Gráfico de Pizza - Distribuição por Categoria */}
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
            <PieChart data={chartData.categoryDistribution} />
          </CardContent>
        </Card>

        {/* Gráfico de Barras - Performance por Categoria */}
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
            <BarChart data={chartData.categoryPerformance} />
          </CardContent>
        </Card>
      </div>

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
          <CategoryReports />
        </CardContent>
      </Card>
    </div>
  );
}
