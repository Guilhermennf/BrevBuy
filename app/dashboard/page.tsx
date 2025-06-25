import { Suspense } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ProductList } from "@/components/product-list";
import { StatsCards } from "@/components/stats-cards";
import { AddProductDialog } from "@/components/add-product-dialog";
import { Package } from "lucide-react";

// Força renderização dinâmica para evitar problemas de build
export const dynamic = "force-dynamic";

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Visão geral do seu negócio
                    </p>
                </div>
                <AddProductDialog />
            </div>

            <Suspense fallback={<div>Carregando estatísticas...</div>}>
                <StatsCards />
            </Suspense>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Produtos Recentes
                    </CardTitle>
                    <CardDescription>
                        Gerencie seus produtos comprados e vendidos
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<div>Carregando produtos...</div>}>
                        <ProductList />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    );
}
