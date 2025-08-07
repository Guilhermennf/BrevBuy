import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { verifySubscriptionAccess } from "@/lib/subscription-middleware";
import {
    notFound,
    ok,
    serverError,
    fromZod,
    badRequest,
} from "@/lib/api-response";

const updateProductSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório").optional(),
    description: z.string().optional(),
    buyPrice: z
        .number()
        .positive("Preço de compra deve ser positivo")
        .optional(),
    categoryId: z.string().optional(),
    supplier: z.string().optional(),
    image: z.instanceof(Buffer).optional(),
    status: z.enum(["AVAILABLE", "SOLD"]).optional(),
});

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Verify subscription access
        const { error, user } = await verifySubscriptionAccess(request);
        if (error) {
            return error;
        }

        const product = await prisma.product.findFirst({
            where: {
                id: params.id,
                userId: user!.id,
            },
        });

        if (!product) {
            return notFound("Produto não encontrado");
        }

        return ok(product);
    } catch (error) {
        console.error("Erro ao buscar produto:", error);
        return serverError();
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Verify subscription access
        const { error, user } = await verifySubscriptionAccess(request);
        if (error) {
            return error;
        }

        const formData = await request.formData();
        const data = {
            name: formData.get("name") as string,
            description: formData.get("description") as string,
            buyPrice: parseFloat(formData.get("buyPrice") as string),
            categoryId: formData.get("categoryId") as string,
            supplier: formData.get("supplier") as string,
        };

        const file = formData.get("file") as File | null;

        // Validar os dados
        const validatedData = updateProductSchema.parse(data);

        // Se uma imagem foi enviada, convertê-la para Buffer
        if (file) {
            const bytes = await file.arrayBuffer();
            validatedData.image = Buffer.from(bytes);
        }

        // Verificar se o produto pertence ao usuário
        const existingProduct = await prisma.product.findFirst({
            where: {
                id: params.id,
                userId: user!.id,
            },
        });

        if (!existingProduct) {
            return notFound("Produto não encontrado");
        }

        const product = await prisma.product.update({
            where: { id: params.id },
            data: {
                ...validatedData,
                image: validatedData.image || existingProduct.image,
            },
            include: {
                category: true,
            },
        });

        return ok(product, "Produto atualizado com sucesso");
    } catch (error) {
        const z = fromZod(error, "Dados inválidos");
        if (z) return z;
        console.error("Erro ao atualizar produto:", error);
        return serverError();
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Verify subscription access
        const { error, user } = await verifySubscriptionAccess(request);
        if (error) {
            return error;
        }

        // Verificar se o produto pertence ao usuário
        const existingProduct = await prisma.product.findFirst({
            where: {
                id: params.id,
                userId: user!.id,
            },
        });

        if (!existingProduct) {
            return notFound("Produto não encontrado");
        }

        await prisma.product.delete({
            where: { id: params.id },
        });

        return ok({ message: "Produto excluído com sucesso" });
    } catch (error) {
        console.error("Erro ao deletar produto:", error);
        return serverError();
    }
}
