"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ProductFormData, SellProductFormData } from "@/lib/validations";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  buyPrice: number;
  sellPrice: number | null;
  supplier: string | null;
  image: Uint8Array | null;
  status: "AVAILABLE" | "SOLD";
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

export interface ProductsFilters {
  categoryId?: string;
  status?: "AVAILABLE" | "SOLD" | "ALL";
}

// Funções de API
const fetchProducts = async (filters?: ProductsFilters): Promise<Product[]> => {
  const params = new URLSearchParams();

  if (filters?.categoryId && filters.categoryId !== "ALL") {
    params.append("categoryId", filters.categoryId);
  }
  if (filters?.status && filters.status !== "ALL") {
    params.append("status", filters.status);
  }

  const response = await fetch(`/api/products?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Erro ao carregar produtos");
  }
  return response.json();
};

// Agora aceita FormData para enviar imagem junto
const createProduct = async (data: FormData): Promise<Product> => {
  const response = await fetch("/api/products", {
    method: "POST",
    body: data,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Erro ao criar produto");
  }

  return response.json();
};

const updateProduct = async ({
  id,
  data,
}: {
  id: string;
  data: FormData;
}): Promise<Product> => {
  const response = await fetch(`/api/products/${id}`, {
    method: "PUT",
    body: data,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Erro ao atualizar produto");
  }

  return response.json();
};

const sellProduct = async ({
  id,
  data,
}: {
  id: string;
  data: SellProductFormData;
}): Promise<Product> => {
  const response = await fetch(`/api/products/${id}/sell`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Erro ao vender produto");
  }

  return response.json();
};

const deleteProduct = async (id: string): Promise<void> => {
  const response = await fetch(`/api/products/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Erro ao excluir produto");
  }
};

// Query Keys
export const productsKeys = {
  all: ["products"] as const,
  lists: () => [...productsKeys.all, "list"] as const,
  list: (filters: ProductsFilters = {}) =>
    [...productsKeys.lists(), filters] as const,
  details: () => [...productsKeys.all, "detail"] as const,
  detail: (id: string) => [...productsKeys.details(), id] as const,
};

// Hooks
export function useProducts(filters?: ProductsFilters) {
  return useQuery({
    queryKey: productsKeys.list(filters),
    queryFn: () => fetchProducts(filters),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: (newProduct) => {
      // Invalidar todas as queries de produtos para garantir consistência
      queryClient.invalidateQueries({ queryKey: productsKeys.all });
    },
    // Toast será exibido automaticamente pelo sistema centralizado
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProduct,
    onSuccess: (updatedProduct) => {
      // Invalidar queries de produtos
      queryClient.invalidateQueries({ queryKey: productsKeys.all });
    },
    // Toast será exibido automaticamente pelo sistema centralizado
  });
}

export function useSellProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sellProduct,
    onSuccess: (soldProduct) => {
      // Invalidar queries de produtos
      queryClient.invalidateQueries({ queryKey: productsKeys.all });
    },
    // Toast será exibido automaticamente pelo sistema centralizado
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      // Invalidar queries de produtos
      queryClient.invalidateQueries({ queryKey: productsKeys.all });
    },
    // Toast será exibido automaticamente pelo sistema centralizado
  });
}

export interface UploadResponse {
  imageUrl: string;
  message: string;
}

// Função de API para upload
const uploadImage = async (
  formData: FormData
): Promise<{ imageUrl: string }> => {
  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Erro no upload da imagem");
  }

  return response.json();
};

// Hook para upload de imagens
export function useUploadImage() {
  return useMutation({
    mutationFn: uploadImage,
    // Toast será exibido automaticamente pelo sistema centralizado
  });
}

// Hook para exportação de dados
const exportProducts = async (): Promise<Blob> => {
  const response = await fetch("/api/products");

  if (!response.ok) {
    throw new Error("Erro ao carregar produtos para exportação");
  }

  const products = await response.json();

  if (products.length === 0) {
    throw new Error("Nenhum produto encontrado para exportar");
  }

  const headers = [
    "NOME",
    "DESCRIÇÃO",
    "PREÇO DE COMPRA",
    "PREÇO DE VENDA",
    "CATEGORIA",
    "FORNECEDOR",
    "STATUS",
  ];

  // Função para escapar campos CSV
  const escapeCsvField = (field: any): string => {
    if (field === null || field === undefined) return '""';
    const stringField = String(field);
    // Se contém vírgula, quebra de linha ou aspas, precisa ser escapado
    if (
      stringField.includes(",") ||
      stringField.includes("\n") ||
      stringField.includes('"')
    ) {
      return `"${stringField.replace(/"/g, '""')}"`;
    }
    return `"${stringField}"`;
  };

  const csvContent = [
    headers.join(";"),
    ...products.map((product: any) =>
      [
        escapeCsvField(product.name),
        escapeCsvField(product.description),
        product.buyPrice,
        product.sellPrice || "",
        escapeCsvField(product.category?.name),
        escapeCsvField(product.supplier),
        product.status,
      ].join(";")
    ),
  ].join("\n");

  // Adicionar BOM para UTF-8
  const excelContent = `\ufeff${csvContent}`;

  return new Blob([excelContent], {
    type: "text/csv;charset=utf-8;",
  });
};

export function useExportProducts() {
  return useMutation({
    mutationFn: exportProducts,
    onSuccess: (blob) => {
      // Fazer download do arquivo
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `produtos_${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
    },
    // Toast será exibido automaticamente pelo sistema centralizado
  });
}
