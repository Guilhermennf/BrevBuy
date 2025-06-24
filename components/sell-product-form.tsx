"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import type { Product } from "@prisma/client";

const sellProductSchema = z.object({
    sellPrice: z.number().min(0.01, "Preço de venda deve ser maior que zero"),
});

type SellProductFormData = z.infer<typeof sellProductSchema>;

interface SellProductFormProps {
    product: Product;
    onSuccess: () => void;
}

export function SellProductForm({ product, onSuccess }: SellProductFormProps) {
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SellProductFormData>({
        resolver: zodResolver(sellProductSchema),
        defaultValues: {
            sellPrice: 0,
        },
    });

    const onSubmit = async (data: SellProductFormData) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/products/${product.id}/sell`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                toast({
                    title: "Produto vendido",
                    description: "Produto marcado como vendido com sucesso.",
                });
                onSuccess();
                window.location.reload();
            } else {
                throw new Error("Erro ao marcar produto como vendido");
            }
        } catch (error) {
            toast({
                title: "Erro",
                description: "Não foi possível marcar o produto como vendido.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const profit = (value: number) => value - product.buyPrice;

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
                    onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        const profitValue = profit(value);
                        console.log(`Lucro: R$ ${profitValue.toFixed(2)}`);
                    }}
                />
                {errors.sellPrice && (
                    <p className="text-sm text-red-500">
                        {errors.sellPrice.message}
                    </p>
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
                        <span className="text-green-600">
                            R$ {profit(0).toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="submit" disabled={loading}>
                    {loading ? "Processando..." : "Marcar como Vendido"}
                </Button>
            </div>
        </form>
    );
}
