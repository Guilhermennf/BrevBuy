import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      purchasePrice,
      mode,
      profitPercentage,
      profitAmount,
      marketAverage,
      suggestedPrice,
      profitAmountCalculated,
      profitPercentageCalculated,
      productName,
      category,
    } = body || {};

    if (
      typeof purchasePrice !== "number" ||
      typeof suggestedPrice !== "number" ||
      typeof profitAmountCalculated !== "number" ||
      typeof profitPercentageCalculated !== "number"
    ) {
      return NextResponse.json(
        { error: "Dados inválidos. Certifique-se de calcular antes de solicitar explicação." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Chave da API do Google não configurada. Configure GOOGLE_API_KEY para habilitar explicações de IA.",
        },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Prompt melhorado para análise contextual
    const prompt = `
Você é um consultor especialista em precificação e estratégia comercial para pequenos e médios revendedores no Brasil. 

Analise a estratégia de precificação abaixo e forneça uma explicação detalhada, prática e personalizada:

DADOS DO PRODUTO:
- Nome: ${productName || "Produto não especificado"}
- Categoria: ${category || "Categoria não informada"}
- Preço de compra: R$ ${purchasePrice.toFixed(2)}
- Modo de cálculo: ${mode === "percentage" ? "Porcentagem de lucro" : "Valor fixo de lucro"}
- ${mode === "percentage" ? `Porcentagem desejada: ${profitPercentage}%` : `Valor de lucro desejado: R$ ${profitAmount?.toFixed(2)}`}
- Preço sugerido: R$ ${suggestedPrice.toFixed(2)}
- Lucro calculado: R$ ${profitAmountCalculated.toFixed(2)} (${profitPercentageCalculated.toFixed(2)}%)
- Preço médio do mercado: ${typeof marketAverage === "number" ? `R$ ${marketAverage.toFixed(2)}` : "Não informado"}

FORNEÇA UMA ANÁLISE ESTRUTURADA COM:

1. **Análise da Estratégia de Preço:**
   - Avaliação da margem de lucro escolhida
   - Competitividade em relação ao mercado (se informado)
   - Adequação para o tipo de produto/categoria

2. **Considerações Estratégicas:**
   - Fatores específicos da categoria do produto
   - Sazonalidade e tendências de mercado
   - Estratégias de posicionamento recomendadas

3. **Recomendações Práticas:**
   - Ajustes sugeridos (se necessário)
   - Estratégias complementares (desconto, bundle, etc.)
   - Pontos de atenção para maximizar vendas

4. **Cenários e Riscos:**
   - Como o preço pode afetar o volume de vendas
   - Flexibilidade de precificação
   - Margem de segurança

IMPORTANTE:
- Use linguagem clara e direta
- Seja específico para o contexto brasileiro
- Forneça insights acionáveis
- Considere tanto aspectos financeiros quanto comerciais
- Mantenha um tom consultivo e prático
- Limite a resposta a 300-400 palavras
- Não use formatação markdown, apenas texto corrido com quebras de linha naturais
`;

    const resp = await model.generateContent(prompt);
    const text = resp.response.text().trim();

    return NextResponse.json({ explanation: text });
  } catch (err: any) {
    console.error("Erro na explicação de preços:", err);
    return NextResponse.json(
      { error: err?.message || "Erro inesperado ao gerar explicação." },
      { status: 500 }
    );
  }
}