"use client";

import { useState, Suspense } from "react";
import {
  useCategories,
  useDeleteCategory,
  Category,
} from "@/hooks/use-categories-query";
import { CategoryForm } from "./category-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Package } from "lucide-react";
import { CategorySkeleton } from "@/components/category/category-skeleton";

function CategoriesContent() {
  const { data: categories = [] } = useCategories();
  const deleteCategoryMutation = useDeleteCategory();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null
  );

  const handleDelete = async () => {
    if (!deletingCategory) return;

    deleteCategoryMutation.mutate(deletingCategory.id, {
      onSuccess: () => {
        setDeletingCategory(null);
      },
    });
  };

  if (categories && categories.length === 0) {
    return (
      <div className="text-center p-8">
        <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          Nenhuma categoria cadastrada
        </h3>
        <p className="text-muted-foreground">
          Crie sua primeira categoria para organizar melhor seus produtos
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories?.map((category) => (
            <Card key={category.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {category.icon && (
                      <span className="text-xl">{category.icon}</span>
                    )}
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: category.color || "#6b7280",
                        }}
                      />
                      <span className="line-clamp-1">{category.name}</span>
                    </div>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingCategory(category)}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingCategory(category)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {category.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {category.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="gap-1">
                    <Package className="w-3 h-3" />
                    {category._count?.products || 0} produto
                    {category._count?.products === 1 ? "" : "s"}
                  </Badge>

                  <span className="text-xs text-muted-foreground">
                    Criada em{" "}
                    {new Date(category.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Modal de edição */}
      <CategoryForm
        category={editingCategory || undefined}
        open={!!editingCategory}
        onOpenChange={(open) => !open && setEditingCategory(null)}
      />

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog
        open={!!deletingCategory}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir a categoria "
              {deletingCategory?.name}"?
              {deletingCategory?._count &&
                deletingCategory._count.products > 0 && (
                  <span className="block mt-2 text-amber-600">
                    Esta categoria possui {deletingCategory._count.products}{" "}
                    produto(s) associado(s). Eles ficarão sem categoria.
                  </span>
                )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {/* <AlertDialogCancel>Cancelar</AlertDialogCancel> */}
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function CategoriesList() {
  return (
    <Suspense
      fallback={
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CategorySkeleton key={i} />
          ))}
        </div>
      }
    >
      <CategoriesContent />
    </Suspense>
  );
}
