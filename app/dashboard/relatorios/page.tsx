"use client";

import { CategoryReports } from "@/components/category-reports";
import { StatsCards } from "@/components/stats-cards";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tag } from "lucide-react";
import { Suspense } from "react";

export default function RelatoriosPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Relatórios</h1>
                    <p className="text-muted-foreground">
                        Analise o desempenho dos seus produtos e categorias
                    </p>
                </div>
            </div>

            <Suspense fallback={<div>Carregando estatísticas...</div>}>
                <StatsCards />
            </Suspense>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Tag className="h-5 w-5" />
                        Relatório por Categorias
                    </CardTitle>
                    <CardDescription>
                        Performance detalhada de cada categoria de produtos
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CategoryReports />
                </CardContent>
            </Card>
        </div>
    );
}
