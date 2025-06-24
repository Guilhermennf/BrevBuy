import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateProductSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório").optional(),
    description: z.string().optional(),
    buyPrice: z
        .number()
        .positive("Preço de compra deve ser positivo")
        .optional(),
    sellPrice: z
        .number()
        .positive("Preço de venda deve ser positivo")
        .optional(),
    category: z.string().optional(),
    supplier: z.string().optional(),
    // Aceitar URLs completas ou caminhos locais
    imageUrl: z
        .string()
        .refine((val) => {
            if (!val || val === "") return true;
            // Aceitar URLs completas (http/https) ou caminhos locais (/uploads/...)
            return val.startsWith("http") || val.startsWith("/");
        }, "URL da imagem inválida")
        .optional()
        .or(z.literal("")),
    status: z.enum(["AVAILABLE", "SOLD"]).optional(),
});

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: "Não autorizado" },
                { status: 401 }
            );
        }

        const product = await prisma.product.findFirst({
            where: {
                id: params.id,
                userId: session.user.id,
            },
        });

        if (!product) {
            return NextResponse.json(
                { error: "Produto não encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error("Erro ao buscar produto:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: "Não autorizado" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const validatedData = updateProductSchema.parse(body);

        // Verificar se o produto pertence ao usuário
        const existingProduct = await prisma.product.findFirst({
            where: {
                id: params.id,
                userId: session.user.id,
            },
        });

        if (!existingProduct) {
            return NextResponse.json(
                { error: "Produto não encontrado" },
                { status: 404 }
            );
        }

        const updatedData: any = { ...validatedData };

        // Se estiver marcando como vendido, adicionar data de venda
        if (validatedData.status === "SOLD") {
            updatedData.soldAt = new Date();
        }

        const product = await prisma.product.update({
            where: { id: params.id },
            data: updatedData,
        });

        return NextResponse.json(product);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Dados inválidos", details: error.errors },
                { status: 400 }
            );
        }

        console.error("Erro ao atualizar produto:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: "Não autorizado" },
                { status: 401 }
            );
        }

        // Verificar se o produto pertence ao usuário
        const existingProduct = await prisma.product.findFirst({
            where: {
                id: params.id,
                userId: session.user.id,
            },
        });

        if (!existingProduct) {
            return NextResponse.json(
                { error: "Produto não encontrado" },
                { status: 404 }
            );
        }

        await prisma.product.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ message: "Produto excluído com sucesso" });
    } catch (error) {
        console.error("Erro ao deletar produto:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
