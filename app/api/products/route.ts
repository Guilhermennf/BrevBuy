import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  buyPrice: z.number().positive("Preço de compra deve ser positivo"),
  sellPrice: z.number().positive("Preço de venda deve ser positivo").optional(),
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
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
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
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const formData = await request.formData();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const buyPrice = parseFloat(formData.get("buyPrice") as string);
    const categoryId = formData.get("categoryId") as string;
    const supplier = formData.get("supplier") as string;
    const file = formData.get("file") as File | null;

    let imageBuffer: Buffer | undefined = undefined;
    if (file) {
      const bytes = await file.arrayBuffer();
      imageBuffer = Buffer.from(bytes);
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        buyPrice,
        categoryId: categoryId || null,
        supplier,
        image: imageBuffer,
        userId: session.user.id,
        status: "AVAILABLE",
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
