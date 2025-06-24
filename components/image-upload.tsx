"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(value || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validações no frontend
        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
        ];
        if (!allowedTypes.includes(file.type)) {
            toast({
                title: "Arquivo inválido",
                description: "Use apenas arquivos JPEG, PNG ou WebP.",
                variant: "destructive",
            });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "Arquivo muito grande",
                description: "O arquivo deve ter no máximo 5MB.",
                variant: "destructive",
            });
            return;
        }

        setUploading(true);

        try {
            // Preview local
            const previewUrl = URL.createObjectURL(file);
            setPreview(previewUrl);

            // Upload para servidor
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                onChange(result.imageUrl);
                setPreview(result.imageUrl);
                toast({
                    title: "Upload realizado!",
                    description: "Imagem enviada com sucesso.",
                });
            } else {
                throw new Error(result.error || "Erro no upload");
            }
        } catch (error) {
            console.error("Erro no upload:", error);
            toast({
                title: "Erro no upload",
                description: "Não foi possível enviar a imagem.",
                variant: "destructive",
            });
            setPreview(value || null);
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleRemove = () => {
        setPreview(null);
        onChange("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-2">
            <Label>Imagem do Produto</Label>

            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                {preview ? (
                    <div className="relative">
                        <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted">
                            <Image
                                src={preview}
                                alt="Preview"
                                fill
                                className="object-cover"
                                onError={() => {
                                    setPreview(null);
                                    toast({
                                        title: "Erro na imagem",
                                        description:
                                            "Não foi possível carregar a imagem.",
                                        variant: "destructive",
                                    });
                                }}
                            />
                        </div>
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={handleRemove}
                            disabled={disabled || uploading}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="text-center">
                        <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                                Clique para selecionar uma imagem
                            </p>
                            <p className="text-xs text-muted-foreground">
                                JPEG, PNG ou WebP até 5MB
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled || uploading}
                    className="flex-1"
                >
                    <Upload className="mr-2 h-4 w-4" />
                    {uploading
                        ? "Enviando..."
                        : preview
                        ? "Trocar Imagem"
                        : "Selecionar Imagem"}
                </Button>

                {preview && (
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={handleRemove}
                        disabled={disabled || uploading}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
            />
        </div>
    );
}
