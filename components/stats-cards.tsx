"use client";

import { useState, useEffect } from "react";
import { DollarSign, Package, TrendingUp, ShoppingCart } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface Stats {
    totalProducts: number;
    soldProducts: number;
    availableProducts: number;
    totalInvested: number;
    totalSold: number;
    totalProfit: number;
    profitMargin: number;
}

export function StatsCards() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/products");
            if (response.ok) {
                const products = await response.json();
                const calculatedStats = calculateStats(products);
                setStats(calculatedStats);
            }
        } catch (error) {
            console.error("Erro ao carregar estatísticas:", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (products: any[]): Stats => {
        const totalProducts = products.length;
        const soldProducts = products.filter((p) => p.status === "SOLD").length;
        const availableProducts = products.filter(
            (p) => p.status === "AVAILABLE"
        ).length;

        const totalInvested = products.reduce(
            (sum, product) => sum + product.buyPrice,
            0
        );
        const totalSold = products
            .filter((p) => p.status === "SOLD" && p.sellPrice)
            .reduce((sum, product) => sum + (product.sellPrice || 0), 0);

        const totalProfit =
            totalSold -
            products
                .filter((p) => p.status === "SOLD")
                .reduce((sum, product) => sum + product.buyPrice, 0);

        const profitMargin =
            totalSold > 0 ? (totalProfit / totalSold) * 100 : 0;

        return {
            totalProducts,
            soldProducts,
            availableProducts,
            totalInvested,
            totalSold,
            totalProfit,
            profitMargin,
        };
    };

    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                            <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 w-24 bg-muted animate-pulse rounded mb-2" />
                            <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="text-center p-8">
                <p className="text-muted-foreground">
                    Erro ao carregar estatísticas
                </p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Investido
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        R$ {stats.totalInvested.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Em {stats.totalProducts} produtos
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Vendido
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        R$ {stats.totalSold.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Em {stats.soldProducts} vendas
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Lucro Total
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        R$ {stats.totalProfit.toFixed(2)}
                    </div>
                    <p
                        className={`text-xs ${
                            stats.totalProfit >= 0
                                ? "text-green-600"
                                : "text-red-600"
                        }`}
                    >
                        {stats.totalProfit >= 0 ? "+" : ""}
                        {stats.profitMargin.toFixed(1)}% de margem
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Produtos Disponíveis
                    </CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {stats.availableProducts}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Prontos para venda
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
