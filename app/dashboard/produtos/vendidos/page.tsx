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
import { ShoppingCart } from "lucide-react";

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
