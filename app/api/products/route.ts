import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const productSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    description: z.string().optional(),
    buyPrice: z.number().positive("Preço de compra deve ser positivo"),
    sellPrice: z
        .number()
        .positive("Preço de venda deve ser positivo")
        .optional(),
    categoryId: z.string().optional(),
    supplier: z.string().optional(),
    imageUrl: z
        .string()
        .refine((val) => {
            if (!val || val === "") return true;
            return val.startsWith("http") || val.startsWith("/");
        }, "URL da imagem inválida")
        .optional()
        .or(z.literal("")),
});

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: "Não autorizado" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const categoryId = searchParams.get("categoryId");

        const whereClause: any = {
            userId: session.user.id,
        };

        if (status && status !== "ALL") {
            whereClause.status = status;
        }

        if (categoryId && categoryId !== "ALL") {
            whereClause.categoryId = categoryId;
        }

        const products = await prisma.product.findMany({
            where: whereClause,
            include: {
                category: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(products);
    } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: "Não autorizado" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const validatedData = productSchema.parse(body);

        // Se categoryId for uma string vazia, definir como null
        const categoryData = {
            ...validatedData,
            categoryId:
                validatedData.categoryId && validatedData.categoryId !== ""
                    ? validatedData.categoryId
                    : null,
        };

        const product = await prisma.product.create({
            data: {
                ...categoryData,
                userId: session.user.id,
                status: "AVAILABLE",
            },
            include: {
                category: true,
            },
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Dados inválidos", details: error.errors },
                { status: 400 }
            );
        }

        console.error("Erro ao criar produto:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
