"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ProductList } from "@/components/product/product-list";
import { Suspense } from "react";
import { Package } from "lucide-react";
import { ProductListSkeleton } from "@/components/product/product-list-skeleton";

export default function ProdutosVendidosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Produtos Vendidos</h1>
          <p className="text-muted-foreground">
            Produtos que já foram vendidos
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Produtos Vendidos
          </CardTitle>
          <CardDescription>Produtos que já foram vendidos</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<ProductListSkeleton />}>
            <ProductList filters={{ status: "SOLD" }} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
