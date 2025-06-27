"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { CategorySelect } from "@/components/category/category-select";
import { useCategories } from "@/hooks/use-categories-query";
import { useCreateProduct, useUploadImage } from "@/hooks/use-products-query";
import {
  Upload,
  Camera,
  Link,
  Sparkles,
  Loader2,
  Clipboard,
  MousePointer,
  X,
} from "lucide-react";

interface ProductData {
  title: string;
  price: number;
  image: Uint8Array | null;
  description: string;
  category: string;
  categoryId: string;
}

interface ProductAutomationProps {
  onSuccess?: () => void;
}

export function ProductAutomation({ onSuccess }: ProductAutomationProps) {
  const [extractedData, setExtractedData] = useState<ProductData | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<{
    file: File;
    preview: string;
    data: Uint8Array | null;
  } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);
  const [productImage, setProductImage] = useState<{
    file: File;
    preview: string;
  } | null>(null);
  const [isProductImageDragging, setIsProductImageDragging] = useState(false);
  const productImageDropRef = useRef<HTMLDivElement>(null);

  // Hooks do React Query
  const { data: categories = [] } = useCategories();
  const createProductMutation = useCreateProduct();
  const uploadImageMutation = useUploadImage();

  // Loading state vem da mutation ou upload de imagem
  const loading =
    createProductMutation.isPending || uploadImageMutation.isPending;

  // Função para encontrar categoria similar
  const findSimilarCategory = (suggestedCategory: string): string => {
    if (!suggestedCategory || categories.length === 0) return "";

    const suggestion = suggestedCategory.toLowerCase().trim();

    // 1. Busca exata
    const exactMatch = categories.find(
      (cat) => cat.name.toLowerCase() === suggestion
    );
    if (exactMatch) return exactMatch.id;

    // 2. Busca por conter a palavra
    const containsMatch = categories.find(
      (cat) =>
        cat.name.toLowerCase().includes(suggestion) ||
        suggestion.includes(cat.name.toLowerCase())
    );
    if (containsMatch) return containsMatch.id;

    // 3. Mapeamento manual para categorias comuns
    const categoryMap: Record<string, string[]> = {
      eletrônicos: [
        "eletrônicos",
        "eletrônico",
        "electronics",
        "tech",
        "tecnologia",
      ],
      "casa e jardim": [
        "casa",
        "jardim",
        "home",
        "garden",
        "decoração",
        "cozinha",
      ],
      moda: ["moda", "fashion", "roupas", "clothes", "vestuário", "acessórios"],
      esportes: ["esportes", "sports", "fitness", "exercício"],
      saúde: ["saúde", "health", "beleza", "beauty", "cuidados"],
      automotivo: ["carro", "auto", "automotive", "veículo"],
      livros: ["livros", "books", "literatura"],
      brinquedos: ["brinquedos", "toys", "jogos", "games"],
    };

    // Buscar por mapeamento
    for (const [categoryName, keywords] of Object.entries(categoryMap)) {
      if (keywords.some((keyword) => suggestion.includes(keyword))) {
        const foundCategory = categories.find((cat) =>
          cat.name.toLowerCase().includes(categoryName)
        );
        if (foundCategory) return foundCategory.id;
      }
    }

    return ""; // Não encontrou correspondência
  };

  // Validação e preparação da imagem
  const handleImageUpload = async (file: File) => {
    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive",
      });
      return;
    }

    // Validar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 10MB.",
        variant: "destructive",
      });
      return;
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const previewUrl = URL.createObjectURL(file);
    setUploadedImage({
      file,
      preview: previewUrl,
      data: uint8Array,
    });

    setDialogOpen(false);
    setExtractedData(null); // Limpar dados anteriores

    toast({
      title: "Imagem carregada!",
      description: "Agora você pode analisar a screenshot com IA.",
    });
  };

  // Análise da imagem com Gemini
  const analyzeImageWithAI = async () => {
    if (!uploadedImage) return;

    setAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append("screenshot", uploadedImage.file);

      // Chamada real para a API do Gemini
      const response = await fetch("/api/automation/analyze-screenshot", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro na análise");
      }

      const result = await response.json();

      if (result.success) {
        // Buscar categoria similar automaticamente
        const matchedCategoryId = findSimilarCategory(result.data.category);

        const extractedProduct: ProductData = {
          title: result.data.title,
          price: result.data.price,
          image: result.data.image,
          description: result.data.description,
          category: result.data.category,
          categoryId: matchedCategoryId, // Auto-selecionada baseada na IA
        };

        setExtractedData(extractedProduct);

        const categoryMessage = matchedCategoryId
          ? ` | Categoria: ${result.data.category} ✓`
          : ` | Categoria: ${result.data.category} (selecione)`;

        toast({
          title: "Análise concluída!",
          description: `A IA extraiu as informações do produto e agora você pode adicionar ao estoque.`,
        });
      } else {
        throw new Error("Falha na análise da imagem");
      }
    } catch (error) {
      console.error("Erro na análise:", error);
      toast({
        title: "Erro na análise",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível analisar a screenshot.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
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

    if (loading || analyzing) return;

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find((file) => file.type.startsWith("image/"));

    if (imageFile) {
      handleImageUpload(imageFile);
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
    if (loading || analyzing) return;

    const items = Array.from(e.clipboardData?.items || []);
    const imageItem = items.find((item) => item.type.startsWith("image/"));

    if (imageItem) {
      const file = imageItem.getAsFile();
      if (file) {
        handleImageUpload(file);
        toast({
          title: "Screenshot colada!",
          description: "Imagem carregada! Clique em 'Analisar' para processar.",
        });
      }
    }
  };

  // Limpar imagem carregada
  const clearUploadedImage = () => {
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage.preview);
    }
    setUploadedImage(null);
    setExtractedData(null);
  };

  // Event listeners para paste
  useEffect(() => {
    const handleKeyboardPaste = (e: ClipboardEvent) => {
      // Só processa se estiver na área de automação
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
  }, [loading, analyzing]);

  // Função para salvar produto modificada
  const handleSaveProduct = () => {
    if (
      !extractedData ||
      !extractedData.title.trim() ||
      !extractedData.categoryId
    ) {
      toast({
        title: "Dados incompletos",
        description: "Preencha pelo menos o nome e selecione uma categoria.",
        variant: "destructive",
      });
      return;
    }

    const imageToUse = productImage?.file || uploadedImage?.file;

    if (!imageToUse) {
      toast({
        title: "Imagem necessária",
        description: "Adicione uma imagem do produto.",
        variant: "destructive",
      });
      return;
    }

    // Montar FormData com todos os campos do produto
    const formData = new FormData();
    formData.append("name", extractedData.title.trim());
    formData.append("description", extractedData.description.trim() || "");
    formData.append("buyPrice", String(extractedData.price));
    formData.append("categoryId", extractedData.categoryId);
    formData.append("supplier", "Registrado pela IA");
    formData.append("file", imageToUse);

    createProductMutation.mutate(formData, {
      onSuccess: () => {
        // Limpar estado
        setUploadedImage(null);
        setProductImage(null);
        setExtractedData(null);
        if (onSuccess) onSuccess();
      },
    });
  };

  // Função para atualizar dados extraídos (permitir edição)
  const updateExtractedData = (
    field: keyof ProductData,
    value: string | number
  ) => {
    if (!extractedData) return;

    setExtractedData({
      ...extractedData,
      [field]: value,
    });
  };

  const handleProductImageUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 10MB.",
        variant: "destructive",
      });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setProductImage({
      file,
      preview: previewUrl,
    });

    toast({
      title: "Imagem do produto carregada!",
      description: "Agora esta imagem será usada no estoque.",
    });
  };

  const handleProductImageDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsProductImageDragging(true);
  };

  const handleProductImageDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsProductImageDragging(false);
  };

  const handleProductImageDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleProductImageDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsProductImageDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find((file) => file.type.startsWith("image/"));

    if (imageFile) {
      handleProductImageUpload(imageFile);
    } else {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, solte apenas arquivos de imagem.",
        variant: "destructive",
      });
    }
  };

  const handleProductImagePaste = async (e: ClipboardEvent) => {
    const items = Array.from(e.clipboardData?.items || []);
    const imageItem = items.find((item) => item.type.startsWith("image/"));

    if (imageItem) {
      const file = imageItem.getAsFile();
      if (file) {
        handleProductImageUpload(file);
        toast({
          title: "Imagem colada!",
          description:
            "Imagem da área de transferência foi carregada para o produto.",
        });
      }
    }
  };

  const clearProductImage = () => {
    if (productImage) {
      URL.revokeObjectURL(productImage.preview);
    }
    setProductImage(null);
  };

  useEffect(() => {
    const handleProductKeyboardPaste = (e: ClipboardEvent) => {
      if (
        productImageDropRef.current &&
        document.activeElement === productImageDropRef.current
      ) {
        handleProductImagePaste(e);
      }
    };

    document.addEventListener("paste", handleProductKeyboardPaste);
    return () => {
      document.removeEventListener("paste", handleProductKeyboardPaste);
    };
  }, []);

  return (
    <div className="h-full max-h-[70vh] overflow-y-auto space-y-4 pr-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Análise Inteligente de Produtos
          </CardTitle>
          <CardDescription>
            Faça upload de qualquer imagem de produto e deixe a IA extrair as
            informações automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload de Imagem */}
          <div className="space-y-3">
            <Label>Upload de Imagem do Produto</Label>

            {uploadedImage ? (
              /* Imagem carregada - mostrar preview e opções */
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {/* Preview da imagem */}
                    <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={uploadedImage.preview}
                        alt="Imagem do produto"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={clearUploadedImage}
                        disabled={analyzing}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Informações do arquivo */}
                    <div className="text-sm text-muted-foreground">
                      <p>
                        <strong>Arquivo:</strong> {uploadedImage.file.name}
                      </p>
                      <p>
                        <strong>Tamanho:</strong>{" "}
                        {(uploadedImage.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>

                    {/* Botão de análise */}
                    <Button
                      onClick={analyzeImageWithAI}
                      disabled={analyzing}
                      className="w-full"
                      size="lg"
                    >
                      {analyzing ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Analisando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          Analisar com IA
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      A IA extrairá automaticamente: nome, preço, descrição e
                      categoria
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Área de upload quando não há imagem */
              <>
                {/* Área de Drop principal */}
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
                                      loading
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                    }
                                `}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => !loading && fileInputRef.current?.click()}
                >
                  <div className="text-center">
                    {loading ? (
                      <>
                        <Loader2 className="mx-auto h-8 w-8 text-primary mb-3 animate-spin" />
                        <p className="text-sm font-medium text-primary">
                          Analisando...
                        </p>
                      </>
                    ) : isDragging ? (
                      <>
                        <Upload className="mx-auto h-8 w-8 text-primary mb-3 animate-bounce" />
                        <p className="text-sm font-medium text-primary">
                          Solte a screenshot aqui!
                        </p>
                      </>
                    ) : (
                      <>
                        <Camera className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            <MousePointer className="inline h-4 w-4 mr-1" />
                            Clique, arraste ou pressione{" "}
                            <kbd className="px-1 py-0.5 bg-muted rounded text-xs">
                              Ctrl+V
                            </kbd>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Imagem de produto • Máximo 10MB
                          </p>
                          <div className="flex items-center justify-center gap-2 mt-3">
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clipboard className="h-3 w-3 mr-1" />
                              Colar
                            </div>
                            <span className="text-xs text-muted-foreground">
                              •
                            </span>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <MousePointer className="h-3 w-3 mr-1" />
                              Arrastar
                            </div>
                            <span className="text-xs text-muted-foreground">
                              •
                            </span>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Camera className="h-3 w-3 mr-1" />
                              Clique
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Input file oculto */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {/* Botão alternativo para modal */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={loading}
                      size="sm"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Ou abrir seletor de arquivo
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        Analisar Screenshot do AliExpress
                      </DialogTitle>
                      <DialogDescription>
                        Selecione uma captura de tela da página do produto
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileInputChange}
                        className="w-full p-2 border rounded"
                      />
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>
                          💡 <strong>Dica:</strong> Você também pode:
                        </p>
                        <ul className="ml-4 space-y-1">
                          <li>• Arrastar e soltar a imagem na área acima</li>
                          <li>• Copiar uma imagem e pressionar Ctrl+V</li>
                          <li>• Fazer print da tela e colar diretamente</li>
                        </ul>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>

          {/* Dados Extraídos com Scroll */}
          {extractedData && (
            <Card className="mt-4 border-green-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-green-600" />
                  Dados Extraídos pela IA
                </CardTitle>
                <CardDescription>
                  Revise e edite as informações antes de adicionar ao estoque
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pr-2">
                {/* NOVA SEÇÃO: Upload da Imagem do Produto */}
                <div className="border-2 border-dashed border-orange-300 rounded-lg p-4 bg-orange-50">
                  <Label className="text-sm font-medium text-orange-800 mb-3 flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    📸 Imagem do Produto para o Estoque
                  </Label>

                  {productImage ? (
                    <div className="space-y-3">
                      <div className="w-32 h-32 rounded-lg overflow-hidden bg-muted mx-auto relative">
                        <img
                          src={productImage.preview}
                          alt="Produto para estoque"
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1"
                          onClick={clearProductImage}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-green-600 font-medium mb-2">
                          ✅ Imagem do produto selecionada
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.accept = "image/*";
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement)
                                .files?.[0];
                              if (file) handleProductImageUpload(file);
                            };
                            input.click();
                          }}
                          className="border-orange-300 text-orange-600 hover:bg-orange-100"
                        >
                          <Upload className="mr-2 h-3 w-3" />
                          Trocar Imagem
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-32 h-32 rounded-lg overflow-hidden bg-muted mx-auto relative">
                        <img
                          src={
                            extractedData.image
                              ? `data:image/png;base64,${Buffer.from(
                                  extractedData.image
                                ).toString("base64")}`
                              : ""
                          }
                          alt="Screenshot original"
                          className="w-full h-full object-cover opacity-50"
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded">
                            Screenshot
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-orange-600 text-center mb-3">
                        ⚠️ Atualmente usando o screenshot completo
                      </p>

                      <div
                        ref={productImageDropRef}
                        tabIndex={0}
                        className={`
                          border-2 border-dashed rounded-lg p-4 transition-all duration-200 cursor-pointer
                          ${
                            isProductImageDragging
                              ? "border-orange-500 bg-orange-100 scale-[1.02]"
                              : "border-orange-300 hover:border-orange-400"
                          }
                        `}
                        onDragEnter={handleProductImageDragEnter}
                        onDragLeave={handleProductImageDragLeave}
                        onDragOver={handleProductImageDragOver}
                        onDrop={handleProductImageDrop}
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = "image/*";
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement)
                              .files?.[0];
                            if (file) handleProductImageUpload(file);
                          };
                          input.click();
                        }}
                      >
                        <div className="text-center">
                          {isProductImageDragging ? (
                            <>
                              <Upload className="mx-auto h-6 w-6 text-orange-500 mb-2 animate-bounce" />
                              <p className="text-sm font-medium text-orange-600">
                                Solte a imagem do produto aqui!
                              </p>
                            </>
                          ) : (
                            <>
                              <Camera className="mx-auto h-6 w-6 text-orange-500 mb-2" />
                              <div className="space-y-1">
                                <p className="text-sm font-medium text-orange-600">
                                  <MousePointer className="inline h-3 w-3 mr-1" />
                                  Clique, arraste ou pressione{" "}
                                  <kbd className="px-1 py-0.5 bg-orange-200 rounded text-xs">
                                    Ctrl+V
                                  </kbd>
                                </p>
                                <p className="text-xs text-orange-500">
                                  Selecione uma imagem limpa apenas do produto
                                </p>
                                <div className="flex items-center justify-center gap-2 mt-2">
                                  <div className="flex items-center text-xs text-orange-500">
                                    <Clipboard className="h-3 w-3 mr-1" />
                                    Colar
                                  </div>
                                  <span className="text-xs text-orange-500">
                                    •
                                  </span>
                                  <div className="flex items-center text-xs text-orange-500">
                                    <MousePointer className="h-3 w-3 mr-1" />
                                    Arrastar
                                  </div>
                                  <span className="text-xs text-orange-500">
                                    •
                                  </span>
                                  <div className="flex items-center text-xs text-orange-500">
                                    <Camera className="h-3 w-3 mr-1" />
                                    Clique
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nome do Produto</Label>
                    <Input
                      value={extractedData.title}
                      onChange={(e) =>
                        updateExtractedData("title", e.target.value)
                      }
                      placeholder="Nome do produto"
                    />
                  </div>
                  <div>
                    <Label>Preço de Compra (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={extractedData.price}
                      onChange={(e) =>
                        updateExtractedData(
                          "price",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    value={extractedData.description}
                    onChange={(e) =>
                      updateExtractedData("description", e.target.value)
                    }
                    placeholder="Descrição do produto"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Categoria</Label>
                  <CategorySelect
                    value={extractedData.categoryId}
                    onValueChange={(value) =>
                      updateExtractedData("categoryId", value)
                    }
                    placeholder={`Selecione uma categoria (sugerida: ${extractedData.category})`}
                    disabled={loading}
                  />
                  {extractedData.categoryId ? (
                    <></>
                  ) : (
                    <p className="text-xs text-amber-600 mt-1">
                      ⚠️ <strong>IA sugeriu:</strong> {extractedData.category} -{" "}
                      <span className="text-blue-600">
                        Selecione a categoria correspondente
                      </span>
                    </p>
                  )}
                </div>

                <div className="border-t pt-4 ">
                  <div className="flex justify-between items-center gap-4">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        <strong>Dados processados pela IA</strong>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Você pode editar qualquer informação antes de salvar
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setExtractedData(null)}
                        disabled={loading}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleSaveProduct}
                        disabled={
                          loading ||
                          !extractedData.title.trim() ||
                          !extractedData.categoryId
                        }
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {uploadImageMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Fazendo upload...
                          </>
                        ) : createProductMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Salvando produto...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Adicionar ao Estoque
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
