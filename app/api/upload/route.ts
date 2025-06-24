import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: "Não autorizado" },
                { status: 401 }
            );
        }

        const data = await request.formData();
        const file: File | null = data.get("file") as unknown as File;

        if (!file) {
            return NextResponse.json(
                { error: "Nenhum arquivo enviado" },
                { status: 400 }
            );
        }

        // Validar tipo de arquivo
        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
        ];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                {
                    error: "Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.",
                },
                { status: 400 }
            );
        }

        // Validar tamanho (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                {
                    error: "Arquivo muito grande. Máximo 5MB.",
                },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Gerar nome único para o arquivo
        const timestamp = Date.now();
        const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "");
        const fileName = `${timestamp}-${originalName}`;

        // Criar diretório se não existir
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (error) {
            // Diretório já existe
        }

        // Salvar arquivo
        const filePath = path.join(uploadDir, fileName);
        await writeFile(filePath, buffer);

        // Retornar URL da imagem
        const imageUrl = `/uploads/${fileName}`;

        return NextResponse.json({
            imageUrl,
            message: "Upload realizado com sucesso",
        });
    } catch (error) {
        console.error("Erro no upload:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
