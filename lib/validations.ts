import { z } from "zod";

// Esquemas de validação para Categoria
export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(50, "Nome deve ter no máximo 50 caracteres"),
  description: z.string().optional(),
  color: z
    .string()
    .min(7, "Cor deve estar no formato #RRGGBB")
    .max(7)
    .regex(/^#[0-9A-Fa-f]{6}$/, "Cor deve estar no formato #RRGGBB")
    .optional(),
  icon: z.string().max(10, "Ícone deve ter no máximo 10 caracteres").optional(),
});

export const createCategorySchema = categorySchema;
export const updateCategorySchema = categorySchema;

export type CategoryFormData = z.infer<typeof categorySchema>;

// Esquemas de validação para Produto
export const productSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  description: z
    .string()
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .optional(),
  buyPrice: z
    .number({ required_error: "Preço de compra é obrigatório" })
    .min(0.01, "Preço de compra deve ser maior que zero"),
  categoryId: z
    .string()
    .min(1, "Selecione uma categoria")
    .optional()
    .or(z.literal("")),
  supplier: z
    .string()
    .max(100, "Nome do fornecedor deve ter no máximo 100 caracteres")
    .optional(),
  image: z.instanceof(Uint8Array).optional(),
});

export const createProductSchema = productSchema;
export const updateProductSchema = productSchema;

export type ProductFormData = z.infer<typeof productSchema>;

// Esquemas de validação para Venda de Produto
export const sellProductSchema = z.object({
  sellPrice: z
    .number({ required_error: "Preço de venda é obrigatório" })
    .min(0.01, "Preço de venda deve ser maior que zero"),
  soldAt: z
    .date()
    .optional()
    .default(() => new Date()),
});

export type SellProductFormData = z.infer<typeof sellProductSchema>;

// Esquemas de validação para Autenticação
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Nome deve ter pelo menos 2 caracteres")
      .max(50, "Nome deve ter no máximo 50 caracteres"),
    email: z.string().email("Email inválido"),
    password: z
      .string()
      .min(6, "Senha deve ter pelo menos 6 caracteres")
      .max(100, "Senha deve ter no máximo 100 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

// Esquemas de validação para Upload de Imagem
export const uploadImageSchema = z.object({
  file: z
    .instanceof(File, { message: "Arquivo é obrigatório" })
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "Arquivo deve ter no máximo 5MB"
    )
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "Arquivo deve ser uma imagem (JPEG, PNG ou WebP)"
    ),
});

export type UploadImageFormData = z.infer<typeof uploadImageSchema>;

// Esquemas de validação para Reset de Senha
export const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token é obrigatório"),
    password: z
      .string()
      .min(6, "Senha deve ter pelo menos 6 caracteres")
      .max(100, "Senha deve ter no máximo 100 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"],
  });

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
