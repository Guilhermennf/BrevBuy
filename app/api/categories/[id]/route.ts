import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

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
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Não autorizado" },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Usuário não encontrado" },
                { status: 404 }
            );
        }

        const category = await prisma.category.findFirst({
            where: {
                id: params.id,
                userId: user.id,
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
            return NextResponse.json(
                { error: "Categoria não encontrada" },
                { status: 404 }
            );
        }

        return NextResponse.json(category);
    } catch (error) {
        console.error("Erro ao buscar categoria:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}

// PUT - Atualizar categoria
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Não autorizado" },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Usuário não encontrado" },
                { status: 404 }
            );
        }

        const body = await request.json();
        const validatedData = categorySchema.parse(body);

        // Verificar se a categoria existe e pertence ao usuário
        const existingCategory = await prisma.category.findFirst({
            where: {
                id: params.id,
                userId: user.id,
            },
        });

        if (!existingCategory) {
            return NextResponse.json(
                { error: "Categoria não encontrada" },
                { status: 404 }
            );
        }

        // Verificar se não existe outra categoria com o mesmo nome
        const duplicateCategory = await prisma.category.findFirst({
            where: {
                name: validatedData.name,
                userId: user.id,
                id: { not: params.id },
            },
        });

        if (duplicateCategory) {
            return NextResponse.json(
                { error: "Já existe uma categoria com este nome" },
                { status: 409 }
            );
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

        return NextResponse.json(category);
    } catch (error) {
        console.error("Erro ao atualizar categoria:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Dados inválidos", details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}

// DELETE - Excluir categoria
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Não autorizado" },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Usuário não encontrado" },
                { status: 404 }
            );
        }

        // Verificar se a categoria existe e pertence ao usuário
        const category = await prisma.category.findFirst({
            where: {
                id: params.id,
                userId: user.id,
            },
            include: {
                _count: {
                    select: { products: true },
                },
            },
        });

        if (!category) {
            return NextResponse.json(
                { error: "Categoria não encontrada" },
                { status: 404 }
            );
        }

        // Verificar se há produtos associados
        if (category._count.products > 0) {
            return NextResponse.json(
                {
                    error: "Não é possível excluir uma categoria que possui produtos",
                    details: `Esta categoria possui ${category._count.products} produto(s) associado(s).`,
                },
                { status: 409 }
            );
        }

        await prisma.category.delete({
            where: { id: params.id },
        });

        return NextResponse.json(
            { message: "Categoria excluída com sucesso" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Erro ao excluir categoria:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
