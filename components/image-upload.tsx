"use client";

import { useState, useRef, useEffect } from "react";
import {
  Upload,
  X,
  Image as ImageIcon,
  Clipboard,
  MousePointer,
} from "lucide-react";
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
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);

  // Validação de arquivo
  const validateFile = (file: File): boolean => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Arquivo inválido",
        description: "Use apenas arquivos JPEG, PNG ou WebP.",
        variant: "destructive",
      });
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 5MB.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  // Upload de arquivo
  const uploadFile = async (file: File) => {
    if (!validateFile(file)) return;

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  // Drag & Drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || uploading) return;

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find((file) => file.type.startsWith("image/"));

    if (imageFile) {
      await uploadFile(imageFile);
    } else {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, solte apenas arquivos de imagem.",
        variant: "destructive",
      });
    }
  };

  // Paste from clipboard handler
  const handlePaste = async (e: ClipboardEvent) => {
    if (disabled || uploading) return;

    const items = Array.from(e.clipboardData?.items || []);
    const imageItem = items.find((item) => item.type.startsWith("image/"));

    if (imageItem) {
      const file = imageItem.getAsFile();
      if (file) {
        await uploadFile(file);
        toast({
          title: "Imagem colada!",
          description: "Imagem da área de transferência foi processada.",
        });
      }
    }
  };

  // Event listeners para paste
  useEffect(() => {
    const handleKeyboardPaste = (e: ClipboardEvent) => {
      // Só processa se o dropArea estiver focado ou em hover
      if (
        dropAreaRef.current &&
        document.activeElement === dropAreaRef.current
      ) {
        handlePaste(e);
      }
    };

    document.addEventListener("paste", handleKeyboardPaste);
    return () => {
      document.removeEventListener("paste", handleKeyboardPaste);
    };
  }, [disabled, uploading]);

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

      <div
        ref={dropAreaRef}
        tabIndex={0}
        className={`
                    border-2 border-dashed rounded-lg p-6 transition-all duration-200 cursor-pointer
                    ${
                      isDragging
                        ? "border-primary bg-primary/5 scale-[1.02]"
                        : "border-muted-foreground/25 hover:border-muted-foreground/40"
                    }
                    ${
                      disabled || uploading
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }
                `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
      >
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
                    description: "Não foi possível carregar a imagem.",
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
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              disabled={disabled || uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center">
            {isDragging ? (
              <>
                <Upload className="mx-auto h-12 w-12 text-primary mb-4 animate-bounce" />
                <p className="text-sm font-medium text-primary">
                  Solte a imagem aqui!
                </p>
              </>
            ) : (
              <>
                <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    <MousePointer className="inline h-4 w-4 mr-1" />
                    Clique, arraste ou pressione{" "}
                    <kbd className="px-1 py-0.5 bg-muted rounded text-xs">
                      Ctrl+V
                    </kbd>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPEG, PNG ou WebP até 5MB
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clipboard className="h-3 w-3 mr-1" />
                      Colar
                    </div>
                    <span className="text-xs text-muted-foreground">•</span>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MousePointer className="h-3 w-3 mr-1" />
                      Arrastar
                    </div>
                    <span className="text-xs text-muted-foreground">•</span>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Upload className="h-3 w-3 mr-1" />
                      Clique
                    </div>
                  </div>
                </div>
              </>
            )}
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
