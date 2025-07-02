import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
        <CardContent className="pt-6">
          <ProductList filters={{ status: "AVAILABLE" }} />
        </CardContent>
      </Card>
    </div>
  );
}
