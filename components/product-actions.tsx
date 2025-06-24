"use client";

import { useState } from "react";
import { MoreHorizontal, Edit2, Trash2, ShoppingCart, Eye } from "lucide-react";
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
import { ProductForm } from "@/components/product-form";
import { SellProductForm } from "@/components/sell-product-form";
import { toast } from "@/hooks/use-toast";
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
    const [deleteLoading, setDeleteLoading] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Tem certeza que deseja excluir este produto?")) return;

        setDeleteLoading(true);
        try {
            const response = await fetch(`/api/products/${product.id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                toast({
                    title: "Produto excluído",
                    description: "O produto foi removido com sucesso.",
                });
                window.location.reload();
            } else {
                throw new Error("Erro ao excluir produto");
            }
        } catch (error) {
            toast({
                title: "Erro",
                description: "Não foi possível excluir o produto.",
                variant: "destructive",
            });
        } finally {
            setDeleteLoading(false);
        }
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
                        onClick={handleDelete}
                        disabled={deleteLoading}
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
        </>
    );
}
