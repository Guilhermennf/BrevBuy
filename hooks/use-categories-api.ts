"use client";

// Re-export do hook moderno para compatibilidade
// Mantendo este arquivo apenas para não quebrar imports existentes
export {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  categoriesKeys,
  type Category,
} from "@/hooks/use-categories-query";
