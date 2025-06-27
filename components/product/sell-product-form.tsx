"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSellProduct } from "@/hooks/use-products-query";
import { sellProductSchema, SellProductFormData } from "@/lib/validations";

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
  aliexpressOrderId?: string | null;
  aliexpressUrl?: string | null;
  originalTitle?: string | null;
  importedAt?: Date | null;
  automationSource?: string | null;
}

interface SellProductFormProps {
  product: ProductWithCategory;
  onSuccess: () => void;
}

export function SellProductForm({ product, onSuccess }: SellProductFormProps) {
  const sellProductMutation = useSellProduct();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SellProductFormData>({
    resolver: zodResolver(sellProductSchema),
    defaultValues: {
      sellPrice: 0,
    },
  });

  const sellPrice = watch("sellPrice");
  const profit = sellPrice - product.buyPrice;

  const onSubmit = async (data: SellProductFormData) => {
    sellProductMutation.mutate(
      { id: product.id, data },
      {
        onSuccess: () => {
          onSuccess();
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="sellPrice">Preço de Venda *</Label>
        <Input
          id="sellPrice"
          type="number"
          step="0.01"
          {...register("sellPrice", { valueAsNumber: true })}
          placeholder="0.00"
        />
        {errors.sellPrice && (
          <p className="text-sm text-red-500">{errors.sellPrice.message}</p>
        )}
      </div>

      <div className="bg-muted p-3 rounded-lg">
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span>Preço de compra:</span>
            <span>R$ {product.buyPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Lucro estimado:</span>
            <span className={profit >= 0 ? "text-green-600" : "text-red-600"}>
              R$ {profit.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={sellProductMutation.isPending}>
          {sellProductMutation.isPending
            ? "Processando..."
            : "Marcar como Vendido"}
        </Button>
      </div>
    </form>
  );
}
