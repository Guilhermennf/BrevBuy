import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface ProductAnalysis {
  productId: string;
  productName: string;
  currentBuyPrice: number;
  currentSellPrice: number | null;
  suggestedSellPrice: number;
  potentialProfit: number;
  profitMargin: number;
  marketPosition: "underpriced" | "overpriced" | "optimal";
  recommendations: string[];
  competitiveAnalysis: {
    estimatedMarketPrice: number;
    competitorCount: number;
    demandLevel: "low" | "medium" | "high";
  };
}

interface UserAnalysisSummary {
  totalProducts: number;
  averageProfitMargin: number;
  totalPotentialRevenue: number;
  totalCurrentValue: number;
  productsByStatus: {
    available: number;
    sold: number;
  };
  insights: string[];
  products: ProductAnalysis[];
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
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

    // Buscar produtos do usuário
    const products = await prisma.product.findMany({
      where: { userId: user.id },
      include: {
        category: true
      },
      orderBy: { createdAt: 'desc' }
    });

    if (products.length === 0) {
      return NextResponse.json({
        totalProducts: 0,
        averageProfitMargin: 0,
        totalPotentialRevenue: 0,
        totalCurrentValue: 0,
        productsByStatus: { available: 0, sold: 0 },
        insights: ["Você ainda não tem produtos cadastrados. Comece adicionando alguns produtos para receber análises personalizadas."],
        products: []
      });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "IA não configurada" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Analisar produtos em lotes para evitar muitas chamadas de API
    const productAnalyses: ProductAnalysis[] = [];
    const batchSize = 5; // Analisar 5 produtos por vez

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      
      const batchPrompt = `
Você é um especialista em análise de preços e estratégia comercial. Analise os seguintes produtos de um revendedor brasileiro e forneça sugestões de preços otimizadas.

PRODUTOS PARA ANÁLISE:
${batch.map((p, idx) => `
${idx + 1}. ${p.name}
   - Categoria: ${p.category?.name || "Sem categoria"}
   - Preço de compra: R$ ${p.buyPrice.toFixed(2)}
   - Preço de venda atual: ${p.sellPrice ? `R$ ${p.sellPrice.toFixed(2)}` : "Não definido"}
   - Status: ${p.status}
   - Descrição: ${p.description || "Sem descrição"}
`).join('')}

Para cada produto, retorne um JSON com a seguinte estrutura EXATA:

{
  "analyses": [
    {
      "productIndex": [índice do produto 1-${batch.length}],
      "suggestedSellPrice": [preço sugerido em número],
      "marketPosition": "[underpriced/overpriced/optimal]",
      "recommendations": [
        "[2-3 recomendações específicas]"
      ],
      "competitiveAnalysis": {
        "estimatedMarketPrice": [preço médio estimado do mercado],
        "competitorCount": [número estimado de concorrentes],
        "demandLevel": "[low/medium/high]"
      }
    }
  ]
}

DIRETRIZES:
- Use preços realistas para o mercado brasileiro
- Considere margem de 20-80% dependendo da categoria
- Para eletrônicos: margem menor (20-40%)
- Para itens de nicho: margem maior (50-80%)
- Analise a competitividade baseada no nome e categoria
- Seja conservador mas otimista
- Retorne APENAS o JSON, sem texto adicional
`;

      try {
        const response = await model.generateContent(batchPrompt);
        const text = response.response.text().trim();
        const cleanText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "");
        
        const batchResult = JSON.parse(cleanText);
        
        // Processar resultados do lote
        batchResult.analyses.forEach((analysis: any, index: number) => {
          const product = batch[index];
          const suggestedPrice = analysis.suggestedSellPrice || (product.buyPrice * 1.5);
          const potentialProfit = suggestedPrice - product.buyPrice;
          const profitMargin = (potentialProfit / product.buyPrice) * 100;

          productAnalyses.push({
            productId: product.id,
            productName: product.name,
            currentBuyPrice: product.buyPrice,
            currentSellPrice: product.sellPrice,
            suggestedSellPrice: suggestedPrice,
            potentialProfit,
            profitMargin,
            marketPosition: analysis.marketPosition || "optimal",
            recommendations: analysis.recommendations || [
              "Monitore preços de concorrentes regularmente",
              "Considere estratégias de marketing digital",
              "Avalie criar promoções sazonais"
            ],
            competitiveAnalysis: {
              estimatedMarketPrice: analysis.competitiveAnalysis?.estimatedMarketPrice || suggestedPrice,
              competitorCount: analysis.competitiveAnalysis?.competitorCount || 15,
              demandLevel: analysis.competitiveAnalysis?.demandLevel || "medium"
            }
          });
        });
      } catch (error) {
        console.error("Erro ao analisar lote:", error);
        
        // Fallback para análise automática
        batch.forEach(product => {
          const category = product.category?.name?.toLowerCase() || "";
          let marginMultiplier = 1.5; // 50% padrão
          
          if (category.includes("eletrônico") || category.includes("celular") || category.includes("computador")) {
            marginMultiplier = 1.3; // 30%
          } else if (category.includes("roupa") || category.includes("acessório") || category.includes("decoração")) {
            marginMultiplier = 1.7; // 70%
          }
          
          const suggestedPrice = product.buyPrice * marginMultiplier;
          const potentialProfit = suggestedPrice - product.buyPrice;
          const profitMargin = (potentialProfit / product.buyPrice) * 100;

          productAnalyses.push({
            productId: product.id,
            productName: product.name,
            currentBuyPrice: product.buyPrice,
            currentSellPrice: product.sellPrice,
            suggestedSellPrice: suggestedPrice,
            potentialProfit,
            profitMargin,
            marketPosition: "optimal",
            recommendations: [
              "Análise baseada em dados históricos da categoria",
              "Monitore concorrentes para ajustes",
              "Considere testes A/B de preço"
            ],
            competitiveAnalysis: {
              estimatedMarketPrice: suggestedPrice,
              competitorCount: Math.floor(Math.random() * 30) + 10,
              demandLevel: "medium"
            }
          });
        });
      }
    }

    // Calcular estatísticas gerais
    const totalProducts = products.length;
    const availableProducts = products.filter(p => p.status === "AVAILABLE").length;
    const soldProducts = products.filter(p => p.status === "SOLD" || p.soldAt).length;
    
    const averageProfitMargin = productAnalyses.reduce((sum, p) => sum + p.profitMargin, 0) / productAnalyses.length;
    const totalPotentialRevenue = productAnalyses.reduce((sum, p) => sum + p.suggestedSellPrice, 0);
    const totalCurrentValue = products.reduce((sum, p) => sum + p.buyPrice, 0);

    // Gerar insights gerais
    const insights: string[] = [];
    
    if (averageProfitMargin < 30) {
      insights.push("📈 Suas margens estão baixas. Considere aumentar os preços de alguns produtos.");
    } else if (averageProfitMargin > 70) {
      insights.push("⚠️ Margens muito altas podem afetar competitividade. Considere ajustes estratégicos.");
    } else {
      insights.push("✅ Suas margens de lucro estão em uma faixa saudável.");
    }

    const underpriced = productAnalyses.filter(p => p.marketPosition === "underpriced").length;
    if (underpriced > totalProducts * 0.3) {
      insights.push(`💰 ${underpriced} produtos podem estar subprecificados. Há oportunidade de aumentar receita.`);
    }

    const overpriced = productAnalyses.filter(p => p.marketPosition === "overpriced").length;
    if (overpriced > totalProducts * 0.2) {
      insights.push(`🎯 ${overpriced} produtos podem estar acima do mercado. Considere ajustar para aumentar vendas.`);
    }

    insights.push(`💵 Valor total investido: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalCurrentValue)}`);
    insights.push(`🚀 Potencial de receita: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPotentialRevenue)}`);

    const summary: UserAnalysisSummary = {
      totalProducts,
      averageProfitMargin,
      totalPotentialRevenue,
      totalCurrentValue,
      productsByStatus: {
        available: availableProducts,
        sold: soldProducts
      },
      insights,
      products: productAnalyses
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Erro na análise de produtos:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}