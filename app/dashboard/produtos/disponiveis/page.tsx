import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProductListSkeleton } from "@/components/product/product-list-skeleton";
import { Package } from "lucide-react";
import { ProductList } from "@/components/product/product-list";

// Força renderização dinâmica para evitar problemas de build
export const dynamic = "force-dynamic";

export default function ProdutosDisponiveisPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Produtos Disponíveis</h1>
          <p className="text-muted-foreground">Produtos prontos para venda</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Produtos Disponíveis
          </CardTitle>
          <CardDescription>
            Produtos que ainda não foram vendidos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<ProductListSkeleton />}>
            <ProductList filters={{ status: "AVAILABLE" }} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
