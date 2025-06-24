"use client";

import { useEffect, useState } from "react";
import { Category } from "@/contexts/categories-context";
import { Label } from "@/components/ui/label";

interface CategorySelectProps {
    value?: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    label?: string;
}

export function CategorySelect({
    value,
    onValueChange,
    placeholder = "Selecione uma categoria...",
    disabled = false,
    label,
}: CategorySelectProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/categories");
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            console.error("Erro ao carregar categorias:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-2">
            {label && <Label>{label}</Label>}
            <select
                value={value || ""}
                onChange={(e) => onValueChange(e.target.value)}
                disabled={disabled || loading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <option value="">
                    {loading ? "Carregando..." : placeholder}
                </option>
                {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                        {category.icon ? `${category.icon} ` : ""}
                        {category.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
