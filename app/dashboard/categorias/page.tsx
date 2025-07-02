"use client";

import { useCategories } from "@/hooks/use-categories-query";
import { CategoriesDataTable } from "@/components/category/categories-data-table";
import { CategoryActions } from "@/components/category/category-actions";
import { Category } from "@/hooks/use-categories-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CategoryForm } from "@/components/category/category-form";

export default function CategoriesPage() {
  const [addingCategory, setAddingCategory] = useState(false);
  const { data: categories = [], isLoading } = useCategories();

  const actionsRenderer = (category: Category) => (
    <CategoryActions category={category} />
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categorias</h1>
          <p className="text-muted-foreground">
            Organize seus produtos por categorias
          </p>
        </div>
        <Button onClick={() => setAddingCategory(true)} className="gap-2">
          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden xs:inline sm:hidden">Adicionar</span>
          <span className="hidden sm:inline">Adicionar Categoria</span>
        </Button>
      </div>

      <CategoryForm open={addingCategory} onOpenChange={setAddingCategory} />

      <CategoriesDataTable
        categories={categories}
        isLoading={isLoading}
        actionsRenderer={actionsRenderer}
      />
    </div>
  );
}
