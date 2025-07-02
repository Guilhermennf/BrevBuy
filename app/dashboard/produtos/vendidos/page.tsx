"use client";

import { useProducts } from "@/hooks/use-products-query";
import { ProductsDataTable } from "@/components/product/products-data-table";
import { AddProductDialog } from "@/components/product/add-product-dialog";
import { ExportProductsSheet } from "@/components/product/export-products-sheet";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";

export default function SoldProductsPage() {
  const { data: products = [], isLoading } = useProducts({ status: "SOLD" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Produtos Vendidos
          </h1>
          <p className="text-muted-foreground">
            Visualize o histórico de todos os produtos vendidos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* <ExportProductsSheet /> */}
          <AddProductDialog />
        </div>
      </div>

      <ProductsDataTable products={products} isLoading={isLoading} />
    </div>
  );
}
