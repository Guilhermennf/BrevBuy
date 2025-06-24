import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const sellProductSchema = z.object({
    sellPrice: z.number().min(0.01, "Preço de venda deve ser maior que zero"),
});

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { sellPrice } = sellProductSchema.parse(body);

        const product = await prisma.product.update({
            where: { id: params.id },
            data: {
                status: "SOLD",
                sellPrice,
                soldAt: new Date(),
            },
        });

        return NextResponse.json(product);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Dados inválidos", details: error.errors },
                { status: 400 }
            );
        }

        console.error("Erro ao marcar produto como vendido:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
