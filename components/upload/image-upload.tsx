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
import { useUploadImage } from "@/hooks/use-products-query";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";

interface ImageUploadProps {
  value?: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(
    value ? URL.createObjectURL(value) : null
  );
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);

  const uploadImageMutation = useUploadImage();

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
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    onChange(file);
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

    if (disabled || uploadImageMutation.isPending) return;

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
    if (disabled || uploadImageMutation.isPending) return;

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
  }, [disabled, uploadImageMutation.isPending]);

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
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
                      disabled || uploadImageMutation.isPending
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }
                `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() =>
          !disabled &&
          !uploadImageMutation.isPending &&
          fileInputRef.current?.click()
        }
      >
        {preview ? (
          <div className="space-y-3">
            <div className="relative w-full h-48 rounded-lg overflow-hidden">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                disabled={disabled || uploadImageMutation.isPending}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-3">
            {uploadImageMutation.isPending ? (
              <>
                <Upload className="mx-auto h-8 w-8 text-primary animate-pulse" />
                <p className="text-sm font-medium text-primary">
                  Fazendo upload...
                </p>
              </>
            ) : isDragging ? (
              <>
                <Upload className="mx-auto h-8 w-8 text-primary animate-bounce" />
                <p className="text-sm font-medium text-primary">
                  Solte a imagem aqui!
                </p>
              </>
            ) : (
              <>
                <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    <MousePointer className="inline h-3 w-3 mr-1" />
                    Clique, arraste ou pressione{" "}
                    <kbd className="px-1 py-0.5 bg-muted rounded text-xs">
                      Ctrl+V
                    </kbd>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG ou WebP (máx. 5MB)
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={disabled || uploadImageMutation.isPending}
        className="hidden"
      />

      {preview && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clipboard className="h-3 w-3" />
          <span>Dica: Cole uma nova imagem (Ctrl+V) para substituir</span>
        </div>
      )}
    </div>
  );
}
