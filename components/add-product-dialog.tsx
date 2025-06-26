"use client";

import { useState } from "react";
import { Plus, Upload, Edit, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProductForm } from "@/components/product-form";
import { ProductAutomation } from "@/components/automation-upload";
import { Badge } from "@/components/ui/badge";

type Mode = "select" | "manual" | "ai";

export function AddProductDialog() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("select");

  const handleClose = () => {
    setOpen(false);
    // Reset to selection mode when closing
    setTimeout(() => setMode("select"), 200);
  };

  const renderContent = () => {
    switch (mode) {
      case "manual":
        return (
          <div className="flex-1 overflow-y-auto px-1">
            <ProductForm onSuccess={handleClose} />
          </div>
        );
      case "ai":
        return (
          <div className="flex-1 overflow-y-auto px-1">
            <ProductAutomation onSuccess={handleClose} />
          </div>
        );
      default:
        return (
          <div className="space-y-4 w-full">
            <div className="space-y-3 w-full">
              {/* Opção Manual */}
              <div
                className="w-full border border-border rounded-lg p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => setMode("manual")}
              >
                <div className="flex gap-3 w-full">
                  <div className="w-8 h-8 p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="font-medium text-sm">Cadastro Manual</div>
                    <div className="text-xs text-muted-foreground leading-relaxed">
                      Preencha os dados do produto manualmente
                    </div>
                  </div>
                </div>
              </div>

              {/* Opção com IA */}
              <div
                className="w-full border border-border rounded-lg p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => setMode("ai")}
              >
                <div className="flex gap-3 w-full">
                  <div className="w-8 h-8 p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">
                        Cadastro com IA
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-xs px-1.5 py-0.5"
                      >
                        Recomendado
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground leading-relaxed">
                      Faça upload de uma imagem e deixe a IA preencher
                      automaticamente
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  const getDialogTitle = () => {
    switch (mode) {
      case "manual":
        return "Cadastro Manual";
      case "ai":
        return "Cadastro com IA";
      default:
        return "Adicionar Produto";
    }
  };

  const getDialogDescription = () => {
    switch (mode) {
      case "manual":
        return "Preencha as informações do produto manualmente";
      case "ai":
        return "Faça upload de uma imagem e deixe a IA preencher automaticamente";
      default:
        return "Escolha como você gostaria de cadastrar o produto";
    }
  };

  // Definir largura baseada no modo
  const getDialogWidth = () => {
    switch (mode) {
      case "ai":
        return "max-w-4xl";
      case "select":
        return "max-w-lg"; // Mais largo para a seleção
      default:
        return "max-w-md";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Produto
        </Button>
      </DialogTrigger>
      <DialogContent
        className={`${getDialogWidth()} max-h-[90vh] overflow-hidden flex flex-col w-[95vw]`}
      >
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="flex items-center gap-2">
                {mode === "ai" && <Zap className="h-4 w-4 text-purple-600" />}
                {mode === "manual" && (
                  <Edit className="h-4 w-4 text-blue-600" />
                )}
                {getDialogTitle()}
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm">
                {getDialogDescription()}
              </DialogDescription>
            </div>
            {mode !== "select" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMode("select")}
                className="text-xs flex-shrink-0"
              >
                ← Voltar
              </Button>
            )}
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">{renderContent()}</div>
      </DialogContent>
    </Dialog>
  );
}
