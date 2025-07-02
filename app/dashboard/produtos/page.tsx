"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProductList } from "@/components/product/product-list";
import { AddProductDialog } from "@/components/product/add-product-dialog";
import { Package } from "lucide-react";
import { ProductsFilters } from "@/hooks/use-products-query";

export default function ProdutosPage() {
  const [filters, setFilters] = useState<ProductsFilters>({
    status: "ALL",
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie todos os seus produtos
          </p>
        </div>
        <AddProductDialog />
      </div>

      <Card>
        <CardContent className="pt-6">
          <ProductList filters={filters} />
        </CardContent>
      </Card>
    </div>
  );
}
