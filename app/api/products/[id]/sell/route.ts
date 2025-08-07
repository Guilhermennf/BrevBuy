import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { verifySubscriptionAccess } from "@/lib/subscription-middleware";
import { notFound, ok, serverError, fromZod } from "@/lib/api-response";

const sellProductSchema = z.object({
    sellPrice: z.number().min(0.01, "Preço de venda deve ser maior que zero"),
});

export async function PATCH(
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
        const { sellPrice } = sellProductSchema.parse(body);

        // Verify that the product belongs to the user
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
                status: "SOLD",
                sellPrice,
                soldAt: new Date(),
            },
        });

        return ok(product, "Produto marcado como vendido");
    } catch (error) {
        const z = fromZod(error, "Dados inválidos");
        if (z) return z;
        console.error("Erro ao marcar produto como vendido:", error);
        return serverError();
    }
}
