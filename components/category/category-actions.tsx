"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { CategoryForm } from "./category-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteCategory } from "@/hooks/use-categories-query";
import { Category } from "@/hooks/use-categories-query";

interface CategoryActionsProps {
  category: Category;
}

export function CategoryActions({ category }: CategoryActionsProps) {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null
  );
  const deleteCategoryMutation = useDeleteCategory();

  const handleDelete = async () => {
    if (deletingCategory) {
      deleteCategoryMutation.mutate(deletingCategory.id, {
        onSuccess: () => {
          setDeletingCategory(null);
        },
      });
    }
  };

  return (
    <>
      <div className="flex items-center gap-1">
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
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
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
