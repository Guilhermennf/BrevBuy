"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCategoriesApi } from "@/hooks/use-categories-api";
import { Category } from "@/contexts/categories-context";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const categorySchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    description: z.string().optional(),
    color: z.string().optional(),
    icon: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
    category?: Category;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const predefinedColors = [
    "#ef4444", // red
    "#f97316", // orange
    "#eab308", // yellow
    "#22c55e", // green
    "#3b82f6", // blue
    "#a855f7", // purple
    "#ec4899", // pink
    "#6b7280", // gray
];

const predefinedIcons = [
    "📱", // tech
    "👔", // fashion
    "🏠", // home
    "🍔", // food
    "🚗", // automotive
    "📚", // books
    "🎮", // games
    "💻", // computers
    "⚽", // sports
    "🎵", // music
];

export function CategoryForm({
    category,
    open,
    onOpenChange,
}: CategoryFormProps) {
    const { createCategory, updateCategory, loading } = useCategoriesApi();
    const [selectedColor, setSelectedColor] = useState(predefinedColors[0]);
    const [selectedIcon, setSelectedIcon] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm<CategoryFormData>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: "",
            description: "",
            color: predefinedColors[0],
            icon: "",
        },
    });

    // Atualizar formulário quando categoria mudar
    useEffect(() => {
        if (category) {
            setValue("name", category.name);
            setValue("description", category.description || "");
            setSelectedColor(category.color || predefinedColors[0]);
            setSelectedIcon(category.icon || "");
        } else {
            // Limpar formulário para nova categoria
            reset();
            setSelectedColor(predefinedColors[0]);
            setSelectedIcon("");
        }
    }, [category, setValue, reset]);

    const onSubmit = async (data: CategoryFormData) => {
        try {
            const formData = {
                ...data,
                color: selectedColor,
                icon: selectedIcon,
            };

            if (category) {
                await updateCategory(category.id, formData);
            } else {
                await createCategory(formData);
            }

            onOpenChange(false);
            reset();
            setSelectedColor(predefinedColors[0]);
            setSelectedIcon("");
        } catch (error) {
            // Erro já tratado no hook
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {category ? "Editar Categoria" : "Nova Categoria"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome *</Label>
                        <Input
                            id="name"
                            {...register("name")}
                            placeholder="Ex: Eletrônicos"
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
                            rows={2}
                            placeholder="Descreva a categoria..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Cor</Label>
                        <div className="flex gap-2 flex-wrap">
                            {predefinedColors.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setSelectedColor(color)}
                                    className={`w-8 h-8 rounded-full border-2 ${
                                        selectedColor === color
                                            ? "border-gray-800"
                                            : "border-gray-300"
                                    }`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Ícone</Label>
                        <div className="flex gap-2 flex-wrap">
                            {predefinedIcons.map((icon) => (
                                <button
                                    key={icon}
                                    type="button"
                                    onClick={() => setSelectedIcon(icon)}
                                    className={`w-10 h-10 rounded border text-lg ${
                                        selectedIcon === icon
                                            ? "border-primary bg-primary/10"
                                            : "border-gray-300 hover:border-gray-400"
                                    }`}
                                >
                                    {icon}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading
                                ? "Salvando..."
                                : category
                                ? "Atualizar"
                                : "Criar"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
