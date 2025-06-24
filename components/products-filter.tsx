"use client";

import { useState, useEffect } from "react";
import { CategorySelect } from "@/components/category-select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface ProductsFilterProps {
    onFilterChange: (filters: { categoryId?: string; status?: string }) => void;
    initialFilters?: { categoryId?: string; status?: string };
}

export function ProductsFilter({
    onFilterChange,
    initialFilters,
}: ProductsFilterProps) {
    const [selectedCategory, setSelectedCategory] = useState(
        initialFilters?.categoryId || ""
    );
    const [selectedStatus, setSelectedStatus] = useState(
        initialFilters?.status || "ALL"
    );

    useEffect(() => {
        onFilterChange({
            categoryId: selectedCategory || undefined,
            status: selectedStatus === "ALL" ? undefined : selectedStatus,
        });
    }, [selectedCategory, selectedStatus, onFilterChange]);

    const clearFilters = () => {
        setSelectedCategory("");
        setSelectedStatus("ALL");
    };

    const hasActiveFilters = selectedCategory || selectedStatus !== "ALL";

    return (
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Filtros</h3>
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                        <X className="h-3 w-3" />
                        Limpar
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <CategorySelect
                        label="Categoria"
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                        placeholder="Todas as categorias"
                    />
                </div>

                <div className="space-y-2">
                    <Label>Status</Label>
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <option value="ALL">Todos os status</option>
                        <option value="AVAILABLE">Disponíveis</option>
                        <option value="SOLD">Vendidos</option>
                    </select>
                </div>
            </div>

            {hasActiveFilters && (
                <div className="flex flex-wrap gap-2">
                    {selectedCategory && (
                        <Badge variant="secondary" className="gap-1">
                            Categoria selecionada
                            <button
                                onClick={() => setSelectedCategory("")}
                                className="ml-1 h-3 w-3"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}
                    {selectedStatus !== "ALL" && (
                        <Badge variant="secondary" className="gap-1">
                            {selectedStatus === "AVAILABLE"
                                ? "Disponíveis"
                                : "Vendidos"}
                            <button
                                onClick={() => setSelectedStatus("ALL")}
                                className="ml-1 h-3 w-3"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}
                </div>
            )}
        </div>
    );
}
