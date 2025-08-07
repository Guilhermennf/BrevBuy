import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { verifySubscriptionAccess } from "@/lib/subscription-middleware";
import {
    ok,
    serverError,
    fromZod,
    conflict,
    created,
} from "@/lib/api-response";

const categorySchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    description: z.string().optional(),
    color: z.string().optional(),
    icon: z.string().optional(),
});

// GET - Listar categorias do usuário
export async function GET(request: NextRequest) {
    try {
        // Verify subscription access
        const { error, user } = await verifySubscriptionAccess(request);
        if (error) {
            return error;
        }

        const categories = await prisma.category.findMany({
            where: { userId: user!.id },
            include: {
                _count: {
                    select: { products: true },
                },
            },
            orderBy: { name: "asc" },
        });

        return ok(categories);
    } catch (error) {
        console.error("Erro ao buscar categorias:", error);
        return serverError();
    }
}

// POST - Criar nova categoria
export async function POST(request: NextRequest) {
    try {
        // Verify subscription access
        const { error, user } = await verifySubscriptionAccess(request);
        if (error) {
            return error;
        }

        const body = await request.json();
        const validatedData = categorySchema.parse(body);

        // Verificar se já existe uma categoria com esse nome para o usuário
        const existingCategory = await prisma.category.findFirst({
            where: {
                name: validatedData.name,
                userId: user!.id,
            },
        });

        if (existingCategory) {
            return NextResponse.json(
                { error: "Já existe uma categoria com este nome" },
                { status: 409 }
            );
        }

        const category = await prisma.category.create({
            data: {
                ...validatedData,
                userId: user!.id,
            },
            include: {
                _count: {
                    select: { products: true },
                },
            },
        });

        return created(category, "Categoria criada com sucesso");
    } catch (error) {
        console.error("Erro ao criar categoria:", error);
        const z = fromZod(error, "Dados inválidos");
        if (z) return z;
        return serverError();
    }
}
