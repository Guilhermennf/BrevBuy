"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Package, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useCategories,
  useDeleteCategory,
  Category,
} from "@/hooks/use-categories-query";
import { CategoryForm } from "@/components/category/category-form";
import { usePagination } from "@/hooks/use-pagination";
import { LoadingSkeletonWrapper } from "@/components/ui/loading-skeleton-wrapper";

function CategoriesTableContent() {
  const { data: categories = [], isLoading } = useCategories();
  const deleteCategoryMutation = useDeleteCategory();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null
  );

  const { currentPage, pageSize, goToPage, nextPage, previousPage } =
    usePagination({
      defaultPageSize: 10,
    });

  // Calcular dados da paginação
  const totalItems = categories.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCategories = categories.slice(startIndex, endIndex);

  const handleDelete = async () => {
    if (!deletingCategory) return;

    deleteCategoryMutation.mutate(deletingCategory.id, {
      onSuccess: () => {
        setDeletingCategory(null);
      },
    });
  };

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
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
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Produtos</TableHead>
              <TableHead>Cor</TableHead>
              <TableHead className="text-right">Data Criação</TableHead>
              <TableHead className="w-24">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCategories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {category.icon && (
                      <span className="text-lg">{category.icon}</span>
                    )}
                    <span className="font-medium">{category.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {category.description ? (
                    <span className="text-sm text-muted-foreground">
                      {category.description}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="gap-1">
                    <Package className="w-3 h-3" />
                    {category._count?.products || 0} produto
                    {category._count?.products === 1 ? "" : "s"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {category.color && (
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {category.color}
                      </span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(category.createdAt), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </div>
                </TableCell>
                <TableCell>
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex justify-end items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={previousPage}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                )
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={nextPage}
              disabled={currentPage === totalPages}
            >
              Próximo
            </Button>
          </div>
        </div>
      )}

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
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function CategoriesTable() {
  return (
    <LoadingSkeletonWrapper
      isLoading={false}
      skeletonType="list"
      skeletonCount={5}
    >
      <CategoriesTableContent />
    </LoadingSkeletonWrapper>
  );
}
