import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar dados de entrada
    const result = forgotPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Dados inválidos",
          details: result.error.errors,
        },
        { status: 400 }
      );
    }

    const { email } = result.data;

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Por segurança, sempre retorna sucesso mesmo se o email não existir
    // Isso evita que atacantes descubram emails válidos
    if (!user) {
      return NextResponse.json({
        message:
          "Se o email existir em nossa base, você receberá um link de redefinição de senha.",
      });
    }

    // Gerar token único e seguro
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hora

    // Remover qualquer token existente para este email
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: email,
      },
    });

    // Criar novo token no banco
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: resetToken,
        expires,
      },
    });

    // Gerar link de redefinição
    const resetUrl = `${
      process.env.NEXTAUTH_URL || "http://localhost:3000"
    }/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // Verificar se as variáveis de ambiente estão configuradas
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      // Retorna sucesso mesmo sem enviar email (para não quebrar o fluxo)
      return NextResponse.json({
        message:
          "Se o email existir em nossa base, você receberá um link de redefinição de senha.",
      });
    }

    try {
      // Configurar transporter do nodemailer
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Verificar conexão com o servidor de email
      await transporter.verify();

      // Enviar email
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: "Redefinir senha - BrevBuy",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333; text-align: center;">Redefinir senha</h1>
            <p>Olá,</p>
            <p>Você solicitou a redefinição de senha para sua conta no BrevBuy.</p>
            <p>Clique no botão abaixo para redefinir sua senha:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Redefinir senha
              </a>
            </div>
            <p>Ou copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 3px;">
              ${resetUrl}
            </p>
            <p><strong>Este link expira em 1 hora.</strong></p>
            <p>Se você não solicitou a redefinição de senha, ignore este email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #666; font-size: 12px; text-align: center;">
              BrevBuy - Sistema de Gestão de Compras
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      // Mesmo com erro de email, não quebra o fluxo para o usuário
      // Em produção, você pode querer registrar este erro em um sistema de monitoramento
    }

    return NextResponse.json({
      message:
        "Se o email existir em nossa base, você receberá um link de redefinição de senha.",
    });
  } catch (error) {
    console.error("Erro ao processar solicitação de reset de senha:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
