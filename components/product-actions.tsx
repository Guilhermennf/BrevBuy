"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  Edit2,
  Trash2,
  ShoppingCart,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { ProductForm } from "@/components/product-form";
import { SellProductForm } from "@/components/sell-product-form";
import { useDeleteProduct } from "@/hooks/use-products-query";
import type { Product } from "@prisma/client";

interface ProductWithCategory {
  id: string;
  name: string;
  description: string | null;
  buyPrice: number;
  sellPrice: number | null;
  supplier: string | null;
  imageUrl: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  soldAt: Date | null;
  userId: string;
  categoryId: string | null;
  category?: {
    id: string;
    name: string;
    description: string | null;
    color: string | null;
    icon: string | null;
  } | null;
}

interface ProductActionsProps {
  product: ProductWithCategory;
}

export function ProductActions({ product }: ProductActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [sellOpen, setSellOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const deleteProductMutation = useDeleteProduct();

  const handleDelete = () => {
    deleteProductMutation.mutate(product.id, {
      onSuccess: () => {
        setDeleteOpen(false);
      },
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Edit2 className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>

          {product.status === "AVAILABLE" && (
            <DropdownMenuItem onClick={() => setSellOpen(true)}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Marcar como Vendido
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription>
              Atualize as informações do produto
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-1">
            <ProductForm
              product={product}
              onSuccess={() => setEditOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={sellOpen} onOpenChange={setSellOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Marcar como Vendido</DialogTitle>
            <DialogDescription>
              Informe o preço de venda para finalizar a transação
            </DialogDescription>
          </DialogHeader>
          <SellProductForm
            product={product}
            onSuccess={() => setSellOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o produto{" "}
              <strong>"{product.name}"</strong>?
              <br />
              <span className="text-red-600 text-sm mt-2 block">
                Esta ação não pode ser desfeita.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white"
            >
              {deleteProductMutation.isPending ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir Produto
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
