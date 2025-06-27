"use client";

import { CategoriesList } from "@/components/category/categories-list";
import { CategoryForm } from "@/components/category/category-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Tag } from "lucide-react";
import { useState } from "react";

export default function CategoriasPage() {
  const [addingCategory, setAddingCategory] = useState(false);

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
          <Plus className="h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Suas Categorias
          </CardTitle>
          <CardDescription>
            Gerencie as categorias dos seus produtos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CategoriesList />
        </CardContent>
      </Card>

      <CategoryForm open={addingCategory} onOpenChange={setAddingCategory} />
    </div>
  );
}
