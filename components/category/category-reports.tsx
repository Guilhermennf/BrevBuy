"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Package } from "lucide-react";
import { useProducts } from "@/hooks/use-products-query";
import { useMemo } from "react";

interface CategoryReport {
  category: {
    id: string;
    name: string;
    color?: string;
    icon?: string;
  } | null;
  totalProducts: number;
  soldProducts: number;
  availableProducts: number;
  totalInvested: number;
  totalSold: number;
  totalProfit: number;
}

export function CategoryReports() {
  const { data: products = [] } = useProducts();

  const reports = useMemo(() => {
    if (products.length === 0) return [];

    const categoryGroups = products.reduce((acc: any, product: any) => {
      const categoryId = product.categoryId || "uncategorized";

      if (!acc[categoryId]) {
        acc[categoryId] = {
          category: product.category || {
            id: "uncategorized",
            name: "Sem categoria",
          },
          products: [],
        };
      }

      acc[categoryId].products.push(product);
      return acc;
    }, {});

    const categoryReports: CategoryReport[] = Object.values(categoryGroups).map(
      (group: any) => {
        const products = group.products;
        const soldProducts = products.filter((p: any) => p.status === "SOLD");
        const availableProducts = products.filter(
          (p: any) => p.status === "AVAILABLE"
        );

        const totalInvested = products.reduce(
          (sum: number, p: any) => sum + p.buyPrice,
          0
        );
        const totalSold = soldProducts.reduce(
          (sum: number, p: any) => sum + (p.sellPrice || 0),
          0
        );
        const totalProfit = soldProducts.reduce(
          (sum: number, p: any) => sum + ((p.sellPrice || 0) - p.buyPrice),
          0
        );

        return {
          category: group.category,
          totalProducts: products.length,
          soldProducts: soldProducts.length,
          availableProducts: availableProducts.length,
          totalInvested,
          totalSold,
          totalProfit,
        };
      }
    );

    categoryReports.sort((a, b) => b.totalInvested - a.totalInvested);
    return categoryReports;
  }, [products]);

  if (reports.length === 0) {
    return (
      <div className="text-center p-8">
        <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Nenhum dado encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <Card key={report.category?.id || "uncategorized"}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3">
              {report.category?.icon && (
                <span className="text-xl">{report.category.icon}</span>
              )}
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: report.category?.color || "#6b7280",
                  }}
                />
                <span>{report.category?.name || "Sem categoria"}</span>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Produtos
                  </span>
                </div>
                <div className="text-xl font-bold">{report.totalProducts}</div>
                <div className="flex gap-2">
                  <Badge variant="default" className="text-xs">
                    {report.availableProducts} disponível
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {report.soldProducts} vendido
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Investido
                  </span>
                </div>
                <div className="text-xl font-bold">
                  R$ {report.totalInvested.toFixed(2)}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Vendido</span>
                </div>
                <div className="text-xl font-bold">
                  R$ {report.totalSold.toFixed(2)}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign
                    className={`h-4 w-4 ${
                      report.totalProfit >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  />
                  <span className="text-sm text-muted-foreground">Lucro</span>
                </div>
                <div
                  className={`text-xl font-bold ${
                    report.totalProfit >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  R$ {report.totalProfit.toFixed(2)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
