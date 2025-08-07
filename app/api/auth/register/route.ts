import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { conflict, created, fromZod, serverError } from "@/lib/api-response";

const registerSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, password } = registerSchema.parse(body);

        // Verificar se usuário já existe
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return conflict("Usuário já existe com este email");
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, 12);

        // Criar usuário
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        return created(
            { user: { id: user.id, name: user.name, email: user.email } },
            "Usuário criado com sucesso"
        );
    } catch (error) {
        const z = fromZod(error, "Dados inválidos");
        if (z) return z;
        console.error("Erro ao criar usuário:", error);
        return serverError();
    }
}
