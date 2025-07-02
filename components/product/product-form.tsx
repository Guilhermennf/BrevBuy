"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useCreateProduct,
  useUpdateProduct,
  Product,
} from "@/hooks/use-products-query";
import { productSchema, ProductFormData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/upload/image-upload";
import { CategorySelect } from "@/components/category/category-select";

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

interface ProductFormProps {
  product?: ProductWithCategory;
  onSuccess: () => void;
}

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  const loading =
    createProductMutation.isPending || updateProductMutation.isPending;

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    watch,
  } = useForm<ProductFormData>({
    defaultValues: product
      ? {
          name: product.name,
          description: product.description || "",
          buyPrice: product.buyPrice,
          categoryId: product.categoryId || "",
          supplier: product.supplier || "",
          quantity: 1,
          image: undefined,
        }
      : {
          name: "",
          description: "",
          buyPrice: 0,
          categoryId: "",
          supplier: "",
          quantity: 1,
          image: undefined,
        },
  });

  useEffect(() => {
    if (product) setValue("image", undefined);
  }, [product, setValue]);

  const onSubmit = async (data: ProductFormData) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description || "");
    formData.append("buyPrice", String(data.buyPrice));
    formData.append("categoryId", data.categoryId || "");
    formData.append("supplier", data.supplier || "");
    formData.append("quantity", String(data.quantity || 1));
    if (data.image instanceof Blob) {
      formData.append("file", data.image);
    }

    if (product) {
      updateProductMutation.mutate(
        { id: product.id, data: formData },
        {
          onSuccess: () => {
            onSuccess();
          },
        }
      );
    } else {
      createProductMutation.mutate(formData, {
        onSuccess: () => {
          onSuccess();
        },
      });
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
        {errors.name && typeof errors.name.message === "string" && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
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
        {errors.buyPrice && typeof errors.buyPrice.message === "string" && (
          <p className="text-sm text-red-500">{errors.buyPrice.message}</p>
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

      {!product && (
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantidade *</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            max="100"
            {...register("quantity", { valueAsNumber: true })}
            placeholder="1"
          />
          {errors.quantity && typeof errors.quantity.message === "string" && (
            <p className="text-sm text-red-500">{errors.quantity.message}</p>
          )}
          <p className="text-xs text-gray-500">
            Se quantidade for maior que 1, múltiplas unidades serão criadas
          </p>
        </div>
      )}

      <Controller
        name="image"
        control={control}
        render={({ field }) => (
          <ImageUpload
            value={field.value as unknown as File}
            onChange={field.onChange}
            disabled={loading}
          />
        )}
      />
      {errors.image && typeof errors.image.message === "string" && (
        <p className="text-sm text-red-500">{errors.image.message}</p>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : product ? "Atualizar" : "Adicionar"}
        </Button>
      </div>
    </form>
  );
}
