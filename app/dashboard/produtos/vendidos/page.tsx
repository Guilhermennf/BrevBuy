"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ProductListClient } from "@/components/product/product-list-client";

export default function ProdutosVendidosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Produtos Vendidos</h1>
          <p className="text-muted-foreground">
            Histórico de produtos vendidos
          </p>
        </div>
      </div>

      <Card>
        <CardContent>
          <ProductListClient filters={{ status: "SOLD" }} />
        </CardContent>
      </Card>
    </div>
  );
}
