"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProductListClient } from "@/components/product-list-client";
import { ProductsFilter } from "@/components/products-filter";
import { AddProductDialog } from "@/components/add-product-dialog";
import { Package } from "lucide-react";

export default function ProdutosPage() {
  const [filters, setFilters] = useState<{
    categoryId?: string;
    status?: string;
  }>({});

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

      {/* <ProductsFilter
                onFilterChange={setFilters}
                initialFilters={filters}
            /> */}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {filters.categoryId || filters.status
              ? "Produtos Filtrados"
              : "Todos os Produtos"}
          </CardTitle>
          <CardDescription>
            {filters.categoryId || filters.status
              ? "Produtos correspondentes aos filtros aplicados"
              : "Lista completa de produtos cadastrados"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductListClient />
        </CardContent>
      </Card>
    </div>
  );
}
