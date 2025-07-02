"use client";

import { Suspense } from "react";
import { useProducts } from "@/hooks/use-products-query";
import { ProductsDataTable } from "@/components/product/products-data-table";
import { AddProductDialog } from "@/components/product/add-product-dialog";
import { ExportProductsSheet } from "@/components/product/export-products-sheet";

// Componente que carrega os dados
function ProductsContent() {
  const { data: products = [], isLoading } = useProducts({
    status: "ALL",
  });

  return <ProductsDataTable products={products} isLoading={isLoading} />;
}

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie todos os seus produtos em um só lugar.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* <ExportProductsSheet /> */}
          <AddProductDialog />
        </div>
      </div>

      {/* <Suspense fallback={<ProductsDataTable products={[]} isLoading={true} />}> */}
      <ProductsContent />
      {/* </Suspense> */}
    </div>
  );
}
