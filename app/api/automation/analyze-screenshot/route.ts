import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { verifySubscriptionAccess } from "@/lib/subscription-middleware";
import { badRequest, ok, serverError } from "@/lib/api-response";

// Análise de screenshot usando Google Gemini 1.5 Flash
async function analyzeScreenshotWithAI(imageBuffer: Buffer): Promise<{
    title: string;
    price: number;
    description: string;
    category: string;
}> {
    if (!process.env.NEXT_PUBLIC_GOOGLE_API_KEY) {
        throw new Error("NEXT_PUBLIC_GOOGLE_API_KEY não configurada");
    }

    const genAI = new GoogleGenerativeAI(
        process.env.NEXT_PUBLIC_GOOGLE_API_KEY
    );
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Analise esta screenshot de um pedido do AliExpress e extraia as seguintes informações em formato JSON:

    {
        "title": "nome completo do produto",
        "price": "preço TOTAL do pedido em número decimal (BRL/USD, sem símbolos)",
        "description": "descrição detalhada do produto com suas características principais",
        "category": "categoria do produto (ex: Eletrônicos, Casa e Jardim, Moda, etc.)"
    }

    INSTRUÇÕES CRÍTICAS PARA O PREÇO:
    - Procure pelo valor "Total:" ou preço final do pedido
    - Se houver "R$" use esse valor em reais
    - Se houver "$" converta de USD para BRL (multiplique por 5.2)
    - Ignore preços unitários, descontos ou outros valores
    - O preço deve ser um número decimal com 2 casas (ex: 197.18)
    - NÃO inclua símbolos de moeda, apenas o número

    EXEMPLO: Se ver "Total:R$197,18" → retorne 197.18
    EXEMPLO: Se ver "Total:$37.92" → retorne 197.18 (37.92 * 5.2)

    Outras instruções:
    - A descrição deve incluir características técnicas importantes
    - A categoria deve ser adequada para e-commerce
    - Responda APENAS o JSON, sem texto adicional
    `;

    try {
        const imagePart = {
            inlineData: {
                data: imageBuffer.toString("base64"),
                mimeType: "image/jpeg",
            },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        // Extrair JSON da resposta
        let jsonText = text.trim();

        // Remover markdown se existir
        if (jsonText.startsWith("```json")) {
            jsonText = jsonText
                .replace(/```json\n?/g, "")
                .replace(/\n?```/g, "");
        } else if (jsonText.startsWith("```")) {
            jsonText = jsonText.replace(/```\n?/g, "");
        }

        const parsed = JSON.parse(jsonText);

        // Validar e sanitizar os dados
        const price = parseFloat(parsed.price) || 0;

        return {
            title: parsed.title || "Produto do AliExpress",
            price: Math.round(price * 100) / 100, // Garantir 2 casas decimais
            description:
                parsed.description || "Produto importado do AliExpress",
            category: parsed.category || "Outros",
        };
    } catch (error) {
        console.error("Erro ao analisar com Gemini:", error);

        // Fallback em caso de erro
        return {
            title: "Produto do AliExpress",
            price: 0,
            description: "Não foi possível extrair a descrição automaticamente",
            category: "Outros",
        };
    }
}

export async function POST(request: NextRequest) {
    try {
        // Verify subscription access
        const { error, user } = await verifySubscriptionAccess(request);
        if (error) {
            return error;
        }

        const formData = await request.formData();
        const file = formData.get("screenshot") as File;

        if (!file) {
            return badRequest("Nenhum arquivo enviado");
        }

        // Validar tipo de arquivo
        if (!file.type.startsWith("image/")) {
            return badRequest("Arquivo deve ser uma imagem");
        }

        // Validar tamanho (máximo 10MB)
        if (file.size > 10 * 1024 * 1024) {
            return badRequest("Arquivo muito grande (máximo 10MB)");
        }

        // Converter para buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Analisar com IA
        const analysisResult = await analyzeScreenshotWithAI(buffer);

        const response = {
            success: true,
            data: {
                ...analysisResult,
                extractedAt: new Date().toISOString(),
                source: "screenshot_analysis",
            },
        };

        return ok(response, "Análise concluída com sucesso");
    } catch (error) {
        console.error("Erro na análise de screenshot:", error);
        return serverError();
    }
}
