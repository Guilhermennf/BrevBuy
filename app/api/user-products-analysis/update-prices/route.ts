import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface PriceUpdate {
  productId: string;
  newSellPrice: number;
}

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const body = await request.json();
    const { updates }: { updates: PriceUpdate[] } = body;

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    // Validar que todos os produtos pertencem ao usuário
    const productIds = updates.map(u => u.productId);
    const userProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        userId: user.id
      },
      select: { id: true }
    });

    if (userProducts.length !== productIds.length) {
      return NextResponse.json({ error: "Alguns produtos não foram encontrados" }, { status: 404 });
    }

    // Atualizar preços em lote
    const updatePromises = updates.map(update => 
      prisma.product.update({
        where: { id: update.productId },
        data: { sellPrice: update.newSellPrice }
      })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({ 
      message: "Preços atualizados com sucesso",
      updatedCount: updates.length 
    });
  } catch (error) {
    console.error("Erro ao atualizar preços:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}