"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  Edit2,
  Trash2,
  ShoppingCart,
  AlertTriangle,
  Copy,
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
import { ProductForm } from "@/components/product/product-form";
import { SellProductForm } from "@/components/product/sell-product-form";
import { useDeleteProduct, useCreateProduct } from "@/hooks/use-products-query";

/**
 * Converte diferentes formatos de dados de imagem para Uint8Array
 *
 * O Prisma pode retornar dados de imagem em diferentes formatos dependendo do driver:
 * - Uint8Array (formato ideal)
 * - Buffer object com propriedade data
 * - Array simples de bytes
 *
 * @param image - Dados da imagem em qualquer formato suportado
 * @returns Uint8Array dos dados da imagem ou null se o formato não for reconhecido
 */
function convertImageToUint8Array(
  image: Uint8Array | { data: number[] } | number[] | null
): Uint8Array | null {
  if (!image) return null;

  if (image instanceof Uint8Array) {
    return image;
  }

  if (
    typeof image === "object" &&
    "data" in image &&
    Array.isArray(image.data)
  ) {
    // Prisma retorna como { type: 'Buffer', data: [...] }
    return new Uint8Array(image.data);
  }

  if (Array.isArray(image)) {
    // Array simples de bytes
    return new Uint8Array(image);
  }

  return null;
}

interface ProductWithCategory {
  id: string;
  name: string;
  description: string | null;
  buyPrice: number;
  sellPrice: number | null;
  supplier: string | null;
  image: Uint8Array | null;
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
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const deleteProductMutation = useDeleteProduct();
  const createProductMutation = useCreateProduct();

  const handleDelete = () => {
    deleteProductMutation.mutate(product.id, {
      onSuccess: () => {
        setDeleteOpen(false);
      },
    });
  };

  const handleDuplicate = () => {
    const formData = new FormData();
    formData.append("name", `${product.name} - Cópia`);
    formData.append("description", product.description || "");
    formData.append("buyPrice", String(product.buyPrice));
    formData.append("categoryId", product.categoryId || "");
    formData.append("supplier", product.supplier || "");
    formData.append("quantity", "1"); // Sempre duplica uma unidade

    // Processar imagem se existir
    if (product.image) {
      const imageData = convertImageToUint8Array(product.image);

      if (imageData && imageData.length > 0) {
        const imageFile = new File([imageData], "product-image.jpg", {
          type: "image/jpeg",
        });
        formData.append("file", imageFile);
      }
    }

    createProductMutation.mutate(formData, {
      onSuccess: () => {
        setDuplicateOpen(false);
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

          <DropdownMenuItem onClick={() => setDuplicateOpen(true)}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicar
          </DropdownMenuItem>

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

      <AlertDialog open={duplicateOpen} onOpenChange={setDuplicateOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Copy className="h-5 w-5 text-blue-600" />
              Duplicar Produto
            </AlertDialogTitle>
            <AlertDialogDescription>
              Deseja criar uma cópia do produto{" "}
              <strong>"{product.name}"</strong>?
              <br />
              <span className="text-gray-600 text-sm mt-2 block">
                O produto será duplicado com o nome "{product.name} - Cópia".
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDuplicate}
              className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-600 text-white"
            >
              {createProductMutation.isPending ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Duplicando...
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicar Produto
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
