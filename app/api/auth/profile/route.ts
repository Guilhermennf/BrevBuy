import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
    ok,
    serverError,
    fromZod,
    unauthorized,
    notFound,
} from "@/lib/api-response";

const updateProfileSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
});

// PUT - Atualizar perfil do usuário
export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return unauthorized();
        }

        const body = await request.json();
        const { name } = updateProfileSchema.parse(body);

        // Atualizar o usuário no banco
        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: { name },
            select: {
                id: true,
                name: true,
                email: true,
            },
        });

        return ok({ user: updatedUser }, "Perfil atualizado com sucesso");
    } catch (error) {
        const z = fromZod(error, "Dados inválidos");
        if (z) return z;
        console.error("Erro ao atualizar perfil:", error);
        return serverError();
    }
}

// GET - Buscar dados do perfil
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return unauthorized();
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                id: true,
                name: true,
                email: true,
            },
        });

        if (!user) {
            return notFound("Usuário não encontrado");
        }

        return ok({ user });
    } catch (error) {
        console.error("Erro ao buscar perfil:", error);
        return serverError();
    }
}
