import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { verifySubscriptionAccess } from "@/lib/subscription-middleware";
import {
    notFound,
    ok,
    serverError,
    fromZod,
    conflict,
} from "@/lib/api-response";

const categorySchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    description: z.string().optional(),
    color: z.string().optional(),
    icon: z.string().optional(),
});

// GET - Buscar categoria específica
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

        const category = await prisma.category.findFirst({
            where: {
                id: params.id,
                userId: user!.id,
            },
            include: {
                _count: {
                    select: { products: true },
                },
                products: {
                    select: {
                        id: true,
                        name: true,
                        status: true,
                        buyPrice: true,
                        sellPrice: true,
                    },
                },
            },
        });

        if (!category) {
            return notFound("Categoria não encontrada");
        }

        return ok(category);
    } catch (error) {
        console.error("Erro ao buscar categoria:", error);
        return serverError();
    }
}

// PUT - Atualizar categoria
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

        const body = await request.json();
        const validatedData = categorySchema.parse(body);

        // Verificar se a categoria existe e pertence ao usuário
        const existingCategory = await prisma.category.findFirst({
            where: {
                id: params.id,
                userId: user!.id,
            },
        });

        if (!existingCategory) {
            return notFound("Categoria não encontrada");
        }

        // Verificar se não existe outra categoria com o mesmo nome
        const duplicateCategory = await prisma.category.findFirst({
            where: {
                name: validatedData.name,
                userId: user!.id,
                id: { not: params.id },
            },
        });

        if (duplicateCategory) {
            return conflict("Já existe uma categoria com este nome");
        }

        const category = await prisma.category.update({
            where: { id: params.id },
            data: validatedData,
            include: {
                _count: {
                    select: { products: true },
                },
            },
        });

        return ok(category, "Categoria atualizada com sucesso");
    } catch (error) {
        console.error("Erro ao atualizar categoria:", error);
        const z = fromZod(error, "Dados inválidos");
        if (z) return z;
        return serverError();
    }
}

// DELETE - Excluir categoria
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

        // Verificar se a categoria existe e pertence ao usuário
        const category = await prisma.category.findFirst({
            where: {
                id: params.id,
                userId: user!.id,
            },
            include: {
                _count: {
                    select: { products: true },
                },
            },
        });

        if (!category) {
            return notFound("Categoria não encontrada");
        }

        // Verificar se há produtos associados
        if (category._count.products > 0) {
            return conflict(
                `Não é possível excluir uma categoria que possui produtos`
            );
        }

        await prisma.category.delete({
            where: { id: params.id },
        });

        return ok({ message: "Categoria excluída com sucesso" });
    } catch (error) {
        console.error("Erro ao excluir categoria:", error);
        return serverError();
    }
}
