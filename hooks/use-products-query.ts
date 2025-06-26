"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { ProductFormData, SellProductFormData } from "@/lib/validations";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  buyPrice: number;
  sellPrice: number | null;
  supplier: string | null;
  imageUrl: string | null;
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

const createProduct = async (data: ProductFormData): Promise<Product> => {
  const response = await fetch("/api/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
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
  data: ProductFormData;
}): Promise<Product> => {
  const response = await fetch(`/api/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
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

      toast({
        title: "Sucesso",
        description: "Produto criado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProduct,
    onSuccess: (updatedProduct) => {
      // Invalidar queries de produtos
      queryClient.invalidateQueries({ queryKey: productsKeys.all });

      toast({
        title: "Sucesso",
        description: "Produto atualizado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useSellProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sellProduct,
    onSuccess: (soldProduct) => {
      // Invalidar queries de produtos
      queryClient.invalidateQueries({ queryKey: productsKeys.all });

      toast({
        title: "Sucesso",
        description: "Produto vendido com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      // Invalidar queries de produtos
      queryClient.invalidateQueries({ queryKey: productsKeys.all });

      toast({
        title: "Sucesso",
        description: "Produto excluído com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export interface UploadResponse {
  imageUrl: string;
  message: string;
}

// Função de API para upload
const uploadImage = async (file: File): Promise<UploadResponse> => {
  // Validar tipo de arquivo
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.");
  }

  // Validar tamanho (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Arquivo muito grande. Máximo 5MB.");
  }

  // Fazer upload
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Erro no upload");
  }

  return response.json();
};

// Hook para upload de imagem
export function useUploadImage() {
  return useMutation<UploadResponse, Error, File>({
    mutationFn: uploadImage,
    onSuccess: (data) => {
      toast({
        title: "Upload realizado!",
        description: "Imagem enviada com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Erro no upload:", error);
      toast({
        title: "Erro no upload",
        description: error.message || "Não foi possível enviar a imagem.",
        variant: "destructive",
      });
    },
  });
}
