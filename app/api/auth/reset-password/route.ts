import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar dados de entrada
    const result = resetPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Dados inválidos",
          details: result.error.errors,
        },
        { status: 400 }
      );
    }

    const { token, password } = result.data;

    // Buscar o token no banco
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Token inválido ou expirado" },
        { status: 400 }
      );
    }

    // Verificar se o token não expirou
    if (verificationToken.expires < new Date()) {
      // Remover token expirado
      await prisma.verificationToken.delete({
        where: { token },
      });

      return NextResponse.json(
        { error: "Token expirado. Solicite um novo link de redefinição." },
        { status: 400 }
      );
    }

    // Buscar o usuário pelo email (identifier)
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
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

    return NextResponse.json({
      message: "Senha redefinida com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao redefinir senha:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Endpoint para verificar se o token é válido (GET)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      return NextResponse.json(
        { error: "Token e email são obrigatórios" },
        { status: 400 }
      );
    }

    // Buscar o token no banco
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken || verificationToken.identifier !== email) {
      return NextResponse.json({ error: "Token inválido" }, { status: 400 });
    }

    // Verificar se o token não expirou
    if (verificationToken.expires < new Date()) {
      return NextResponse.json({ error: "Token expirado" }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      message: "Token válido",
    });
  } catch (error) {
    console.error("Erro ao verificar token:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
