"use client";

import { useState } from "react";
import { useExportProducts } from "@/hooks/use-products-query";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  FileText,
  Calendar,
  Package,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function ExportProductsSheet() {
  const [open, setOpen] = useState(false);
  const exportProductsMutation = useExportProducts();

  const handleExport = () => {
    exportProductsMutation.mutate(undefined, {
      onSuccess: () => {
        setOpen(false);
        toast({
          title: "Exportação concluída!",
          description: "Seus produtos foram exportados com sucesso.",
        });
      },
      onError: () => {
        toast({
          title: "Erro na exportação",
          description: "Não foi possível exportar os produtos.",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar Produtos
          </SheetTitle>
          <SheetDescription>
            Exporte todos os seus produtos em formato CSV para backup ou análise
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Informações do arquivo */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-medium">Formato CSV</h3>
                <p className="text-sm text-muted-foreground">
                  Arquivo CSV otimizado para Excel com codificação UTF-8
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Calendar className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-medium">Data de exportação</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Colunas incluídas */}
          <div className="space-y-3">
            <h3 className="font-medium">Colunas incluídas:</h3>
            <div className="grid grid-cols-2 gap-2">
              <Badge variant="secondary" className="justify-start gap-1">
                <Package className="h-3 w-3" />
                Nome do Produto
              </Badge>
              <Badge variant="secondary" className="justify-start gap-1">
                <FileText className="h-3 w-3" />
                Descrição
              </Badge>
              <Badge variant="secondary" className="justify-start gap-1">
                <TrendingUp className="h-3 w-3" />
                Preço de Compra
              </Badge>
              <Badge variant="secondary" className="justify-start gap-1">
                <TrendingUp className="h-3 w-3" />
                Preço de Venda
              </Badge>
              <Badge variant="secondary" className="justify-start gap-1">
                <Package className="h-3 w-3" />
                Categoria
              </Badge>
              <Badge variant="secondary" className="justify-start gap-1">
                <CheckCircle className="h-3 w-3" />
                Status
              </Badge>
            </div>
          </div>

          {/* Informações adicionais */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Informações importantes:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Todos os produtos serão exportados</li>
              <li>• O arquivo CSV será baixado automaticamente</li>
              <li>• Abra o arquivo no Excel para melhor visualização</li>
              <li>• O arquivo inclui instruções para formatação</li>
              <li>• Caracteres especiais (acentos) são preservados</li>
              <li>• Imagens não são incluídas no arquivo</li>
            </ul>
          </div>

          {/* Botão de exportação */}
          <div className="flex gap-3">
            <Button
              onClick={handleExport}
              disabled={exportProductsMutation.isPending}
              className="flex-1"
            >
              <Download className="mr-2 h-4 w-4" />
              {exportProductsMutation.isPending
                ? "Exportando..."
                : "Exportar Produtos"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
