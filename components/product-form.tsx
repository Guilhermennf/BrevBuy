"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/image-upload";
import { CategorySelect } from "@/components/category-select";
import { toast } from "@/hooks/use-toast";
import type { Product } from "@prisma/client";

const productSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    description: z.string().optional(),
    buyPrice: z.number().min(0.01, "Preço de compra deve ser maior que zero"),
    categoryId: z.string().optional(),
    supplier: z.string().optional(),
    // Aceitar URLs completas ou caminhos locais
    imageUrl: z
        .string()
        .refine((val) => {
            if (!val || val === "") return true;
            // Aceitar URLs completas (http/https) ou caminhos locais (/uploads/...)
            return val.startsWith("http") || val.startsWith("/");
        }, "URL da imagem inválida")
        .optional()
        .or(z.literal("")),
});

type ProductFormData = z.infer<typeof productSchema>;

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

interface ProductFormProps {
    product?: ProductWithCategory;
    onSuccess: () => void;
}

export function ProductForm({ product, onSuccess }: ProductFormProps) {
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: product
            ? {
                  name: product.name,
                  description: product.description || "",
                  buyPrice: product.buyPrice,
                  categoryId: product.categoryId || "",
                  supplier: product.supplier || "",
                  imageUrl: product.imageUrl || "",
              }
            : {
                  name: "",
                  description: "",
                  buyPrice: 0,
                  categoryId: "",
                  supplier: "",
                  imageUrl: "",
              },
    });

    const onSubmit = async (data: ProductFormData) => {
        setLoading(true);
        try {
            const url = product
                ? `/api/products/${product.id}`
                : "/api/products";
            const method = product ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                toast({
                    title: product ? "Produto atualizado" : "Produto criado",
                    description: product
                        ? "Produto atualizado com sucesso."
                        : "Novo produto adicionado com sucesso.",
                });
                onSuccess();
                window.location.reload();
            } else {
                throw new Error("Erro ao salvar produto");
            }
        } catch (error) {
            toast({
                title: "Erro",
                description: "Não foi possível salvar o produto.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                    id="name"
                    {...register("name")}
                    placeholder="Ex: iPhone 15 Pro"
                />
                {errors.name && (
                    <p className="text-sm text-red-500">
                        {errors.name.message}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Descreva detalhes do produto..."
                    rows={3}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="buyPrice">Preço de Compra *</Label>
                <Input
                    id="buyPrice"
                    type="number"
                    step="0.01"
                    {...register("buyPrice", { valueAsNumber: true })}
                    placeholder="0.00"
                />
                {errors.buyPrice && (
                    <p className="text-sm text-red-500">
                        {errors.buyPrice.message}
                    </p>
                )}
            </div>

            <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                    <CategorySelect
                        label="Categoria"
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Selecione uma categoria..."
                        disabled={loading}
                    />
                )}
            />

            <div className="space-y-2">
                <Label htmlFor="supplier">Fornecedor</Label>
                <Input
                    id="supplier"
                    {...register("supplier")}
                    placeholder="Nome do fornecedor..."
                />
            </div>

            <Controller
                name="imageUrl"
                control={control}
                render={({ field }) => (
                    <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        disabled={loading}
                    />
                )}
            />
            {errors.imageUrl && (
                <p className="text-sm text-red-500">
                    {errors.imageUrl.message}
                </p>
            )}

            <div className="flex justify-end gap-2 pt-4">
                <Button type="submit" disabled={loading}>
                    {loading
                        ? "Salvando..."
                        : product
                        ? "Atualizar"
                        : "Adicionar"}
                </Button>
            </div>
        </form>
    );
}
