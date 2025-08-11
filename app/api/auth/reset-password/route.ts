import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";
import { badRequest, notFound, ok, serverError } from "@/lib/api-response";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validar dados de entrada
        const result = resetPasswordSchema.safeParse(body);

        if (!result.success) {
            return badRequest("Dados inválidos", result.error.errors);
        }

        const { token, password } = result.data;

        // Buscar o token no banco
        const verificationToken = await prisma.verificationToken.findUnique({
            where: { token },
        });

        if (!verificationToken) {
            return badRequest("Token inválido ou expirado");
        }

        // Verificar se o token não expirou
        if (verificationToken.expires < new Date()) {
            // Remover token expirado
            await prisma.verificationToken.delete({
                where: { token },
            });

            return badRequest(
                "Token expirado. Solicite um novo link de redefinição."
            );
        }

        // Buscar o usuário pelo email (identifier)
        const user = await prisma.user.findUnique({
            where: { email: verificationToken.identifier },
        });

        if (!user) {
            return notFound("Usuário não encontrado");
        }

        // Criptografar nova senha
        const hashedPassword = await bcrypt.hash(password, 12);

        // Atualizar senha do usuário
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });

        // Remover token usado
        await prisma.verificationToken.delete({
            where: { token },
        });

        return ok({ message: "Senha redefinida com sucesso!" });
    } catch (error) {
        console.error("Erro ao redefinir senha:", error);
        return serverError();
    }
}

// Endpoint para verificar se o token é válido (GET)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get("token");
        const email = searchParams.get("email");

        if (!token || !email) {
            return badRequest("Token e email são obrigatórios");
        }

        // Buscar o token no banco
        const verificationToken = await prisma.verificationToken.findUnique({
            where: { token },
        });

        if (!verificationToken || verificationToken.identifier !== email) {
            return badRequest("Token inválido");
        }

        // Verificar se o token não expirou
        if (verificationToken.expires < new Date()) {
            return badRequest("Token expirado");
        }

        return ok({ valid: true, message: "Token válido" });
    } catch (error) {
        console.error("Erro ao verificar token:", error);
        return serverError();
    }
}
