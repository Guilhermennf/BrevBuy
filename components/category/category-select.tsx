"use client";

import { Label } from "@/components/ui/label";
import { useCategories } from "@/hooks/use-categories-query";

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
  const { data: categories = [], isLoading: loading } = useCategories();

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <select
        value={value || ""}
        onChange={(e) => onValueChange(e.target.value)}
        disabled={disabled || loading}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="">{loading ? "Carregando..." : placeholder}</option>
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
