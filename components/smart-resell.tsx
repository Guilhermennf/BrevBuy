"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Calculator, 
  Brain, 
  TrendingUp, 
  Target, 
  AlertCircle, 
  CheckCircle, 
  Zap,
  BarChart3,
  Lightbulb,
  DollarSign,
  LineChart,
  Users,
  ShoppingCart,
  Calendar,
  Package,
  RefreshCw,
  Edit,
  Save,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Mode = "percentage" | "amount";

type Result = {
  suggestedPrice: number;
  profitAmount: number;
  profitPercentage: number;
  competitiveMessage: string;
};

type MarketAnalysis = {
  priceRange: { min: number; max: number };
  competitorCount: number;
  marketTrend: "rising" | "falling" | "stable";
  demandLevel: "low" | "medium" | "high";
  recommendations: string[];
  insights: {
    seasonality: string;
    competitiveAdvantage: string;
    riskFactors: string[];
    opportunities: string[];
  };
};

type SmartInsight = {
  type: "warning" | "success" | "info";
  title: string;
  description: string;
  action?: string;
};

type SalesPrediction = {
  estimatedSalesVolume: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  revenueProjection: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  conversionRate: number;
  priceOptimization: {
    recommendedPrice: number;
    expectedImpact: string;
    reasoning: string;
  };
  marketingRecommendations: {
    bestChannels: string[];
    suggestedBudget: number;
    expectedROI: number;
  };
  riskFactors: string[];
  confidenceLevel: number;
  keyInsights: string[];
};

type ProductAnalysis = {
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
};

type UserAnalysisSummary = {
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
};

function parseNumber(value: string): number | null {
  if (value == null) return null;
  const cleaned = value.replace(",", ".").trim();
  if (cleaned === "") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function formatCurrency(n: number, locale?: string) {
  const loc = locale || (typeof navigator !== "undefined" ? navigator.language : "pt-BR");
  return new Intl.NumberFormat(loc, { style: "currency", currency: "BRL" }).format(n);
}

function formatPercent(n: number, decimals = 2) {
  return `${n.toFixed(decimals)}%`;
}

export default function SmartResellCalculator() {
  const [purchasePrice, setPurchasePrice] = useState("");
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [mode, setMode] = useState<Mode>("percentage");
  const [profitPercentage, setProfitPercentage] = useState("");
  const [profitAmount, setProfitAmount] = useState("");
  const [marketAverage, setMarketAverage] = useState("");
  const [marketingBudget, setMarketingBudget] = useState("1000");
  const [inventory, setInventory] = useState("100");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [analyzing, setAnalyzing] = useState(false);
  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysis | null>(null);
  const [smartInsights, setSmartInsights] = useState<SmartInsight[]>([]);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [salesPrediction, setSalesPrediction] = useState<SalesPrediction | null>(null);
  const [userAnalysis, setUserAnalysis] = useState<UserAnalysisSummary | null>(null);
  const [editingPrices, setEditingPrices] = useState<Set<string>>(new Set());
  const [tempPrices, setTempPrices] = useState<Record<string, string>>({});

  const { toast } = useToast();
  const locale = useMemo(() => (typeof navigator !== "undefined" ? navigator.language : "pt-BR"), []);

  // Carregar análise dos produtos do usuário ao montar o componente
  useEffect(() => {
    loadUserAnalysis();
  }, []);

  async function loadUserAnalysis() {
    try {
      setAnalyzing(true);
      const response = await fetch("/api/user-products-analysis");
      
      if (!response.ok) {
        throw new Error("Falha ao carregar análise");
      }

      const analysis = await response.json();
      setUserAnalysis(analysis);
    } catch (error) {
      console.error("Erro ao carregar análise:", error);
    } finally {
      setAnalyzing(false);
    }
  }

  function compute() {
    setError(null);
    setExplanation(null);

    const p = parseNumber(purchasePrice);
    if (p == null || p <= 0) {
      setResult(null);
      setError("Digite um preço de compra válido maior que 0.");
      return;
    }

    let suggestedPrice: number;
    let profitAmt: number;
    let profitPct: number;

    if (mode === "percentage") {
      const pct = parseNumber(profitPercentage);
      if (pct == null || !Number.isFinite(pct)) {
        setResult(null);
        setError("Digite uma porcentagem de lucro válida.");
        return;
      }
      suggestedPrice = p * (1 + pct / 100);
      profitAmt = suggestedPrice - p;
      profitPct = (profitAmt / p) * 100;
    } else {
      const amt = parseNumber(profitAmount);
      if (amt == null || !Number.isFinite(amt)) {
        setResult(null);
        setError("Digite um valor de lucro válido.");
        return;
      }
      suggestedPrice = p + amt;
      profitAmt = amt;
      profitPct = (amt / p) * 100;
    }

    let competitiveMessage = "Nenhuma média de mercado informada.";
    const m = parseNumber(marketAverage);
    if (m != null && Number.isFinite(m) && m > 0) {
      const tolerance = 0.01;
      if (Math.abs(suggestedPrice - m) <= tolerance) {
        competitiveMessage = "Seu preço sugerido está igual à média do mercado.";
      } else if (suggestedPrice > m) {
        const diffPct = ((suggestedPrice - m) / m) * 100;
        competitiveMessage = `Seu preço está ${formatPercent(diffPct)} acima da média. Considere ajustar para melhor competitividade.`;
      } else {
        const diffPct = ((m - suggestedPrice) / m) * 100;
        competitiveMessage = `Seu preço está ${formatPercent(diffPct)} abaixo da média. Isso pode melhorar a competitividade.`;
      }
    }

    setResult({
      suggestedPrice,
      profitAmount: profitAmt,
      profitPercentage: profitPct,
      competitiveMessage,
    });

    generateSmartInsights(suggestedPrice, profitPct, m || undefined);
  }

  function generateSmartInsights(price: number, profit: number, marketAvg?: number) {
    const insights: SmartInsight[] = [];

    if (profit > 50) {
      insights.push({
        type: "warning",
        title: "Margem de lucro alta",
        description: "Lucro acima de 50% pode afetar a competitividade",
        action: "Considere reduzir para aumentar vendas"
      });
    } else if (profit < 10) {
      insights.push({
        type: "warning",
        title: "Margem de lucro baixa",
        description: "Lucro abaixo de 10% pode não cobrir custos operacionais",
        action: "Considere aumentar a margem"
      });
    } else {
      insights.push({
        type: "success",
        title: "Margem equilibrada",
        description: "Sua margem de lucro está em uma faixa competitiva"
      });
    }

    if (marketAvg && Math.abs(price - marketAvg) / marketAvg > 0.2) {
      insights.push({
        type: "info",
        title: "Diferença significativa do mercado",
        description: "Seu preço difere mais de 20% da média do mercado",
        action: "Verifique se isso é estratégico"
      });
    }

    setSmartInsights(insights);
  }

  async function analyzeMarket() {
    if (!productName.trim()) {
      toast({
        title: "Nome do produto necessário",
        description: "Digite o nome do produto para análise de mercado",
        variant: "destructive"
      });
      return;
    }

    setAnalyzing(true);
    try {
      const response = await fetch("/api/market-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          category,
          currentPrice: result?.suggestedPrice || parseNumber(purchasePrice)
        })
      });

      if (!response.ok) {
        throw new Error("Falha na análise de mercado");
      }

      const analysis = await response.json();
      setMarketAnalysis(analysis);
      
      toast({
        title: "Análise concluída",
        description: "Análise de mercado gerada com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro na análise",
        description: "Não foi possível analisar o mercado",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  }

  async function predictSales() {
    if (!productName.trim() || !result) {
      toast({
        title: "Dados insuficientes",
        description: "Calcule o preço e digite o nome do produto primeiro",
        variant: "destructive"
      });
      return;
    }

    setAnalyzing(true);
    try {
      const response = await fetch("/api/sales-prediction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          category,
          price: result.suggestedPrice,
          marketingBudget: parseNumber(marketingBudget) || 1000,
          inventory: parseNumber(inventory) || 100
        })
      });

      if (!response.ok) {
        throw new Error("Falha na previsão de vendas");
      }

      const prediction = await response.json();
      setSalesPrediction(prediction);
      
      toast({
        title: "Previsão gerada",
        description: "Previsão de vendas criada com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro na previsão",
        description: "Não foi possível gerar previsão de vendas",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  }

  async function explainWithAI() {
    if (!result) return;
    setAnalyzing(true);
    try {
      const response = await fetch("/api/price-explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purchasePrice: parseNumber(purchasePrice),
          mode,
          profitPercentage: mode === "percentage" ? parseNumber(profitPercentage) : null,
          profitAmount: mode === "amount" ? parseNumber(profitAmount) : null,
          marketAverage: parseNumber(marketAverage),
          suggestedPrice: result.suggestedPrice,
          profitAmountCalculated: result.profitAmount,
          profitPercentageCalculated: result.profitPercentage,
          productName,
          category
        })
      });

      if (!response.ok) {
        throw new Error("Falha na explicação");
      }

      const data = await response.json();
      setExplanation(data.explanation);
    } catch (error) {
      toast({
        title: "Erro na explicação",
        description: "Não foi possível gerar explicação",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  }

  function startEditingPrice(productId: string, currentPrice: number | null) {
    setEditingPrices(prev => {
      const newSet = new Set(prev);
      newSet.add(productId);
      return newSet;
    });
    setTempPrices(prev => ({
      ...prev,
      [productId]: currentPrice?.toString() || ""
    }));
  }

  function cancelEditingPrice(productId: string) {
    setEditingPrices(prev => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
    setTempPrices(prev => {
      const newPrices = { ...prev };
      delete newPrices[productId];
      return newPrices;
    });
  }

  async function savePrice(productId: string) {
    const newPrice = parseNumber(tempPrices[productId]);
    if (!newPrice || newPrice <= 0) {
      toast({
        title: "Preço inválido",
        description: "Digite um preço válido maior que 0",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch("/api/user-products-analysis/update-prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updates: [{ productId, newSellPrice: newPrice }]
        })
      });

      if (!response.ok) {
        throw new Error("Falha ao atualizar preço");
      }

      // Atualizar o estado local
      if (userAnalysis) {
        const updatedProducts = userAnalysis.products.map(p => 
          p.productId === productId 
            ? { ...p, currentSellPrice: newPrice }
            : p
        );
        setUserAnalysis({
          ...userAnalysis,
          products: updatedProducts
        });
      }

      cancelEditingPrice(productId);
      
      toast({
        title: "Preço atualizado",
        description: "Preço do produto atualizado com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar o preço",
        variant: "destructive"
      });
    }
  }

  async function applySuggestedPrice(productId: string, suggestedPrice: number) {
    try {
      const response = await fetch("/api/user-products-analysis/update-prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updates: [{ productId, newSellPrice: suggestedPrice }]
        })
      });

      if (!response.ok) {
        throw new Error("Falha ao aplicar sugestão");
      }

      // Atualizar o estado local
      if (userAnalysis) {
        const updatedProducts = userAnalysis.products.map(p => 
          p.productId === productId 
            ? { ...p, currentSellPrice: suggestedPrice }
            : p
        );
        setUserAnalysis({
          ...userAnalysis,
          products: updatedProducts
        });
      }

      toast({
        title: "Sugestão aplicada",
        description: "Preço sugerido aplicado com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro ao aplicar",
        description: "Não foi possível aplicar a sugestão",
        variant: "destructive"
      });
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="calculator" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calculator">Calculadora Individual</TabsTrigger>
          <TabsTrigger value="portfolio">Análise do Portfólio</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Card principal de cálculo */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Calculadora Inteligente de Preços
                  </CardTitle>
                  <CardDescription>
                    Configure os parâmetros para calcular preços e prever vendas com IA avançada
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Informações do produto */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="product-name">Nome do Produto</Label>
                      <Input
                        id="product-name"
                        placeholder="Ex: iPhone 14 Pro"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoria</Label>
                      <Input
                        id="category"
                        placeholder="Ex: Eletrônicos"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Preço de compra */}
                  <div className="space-y-2">
                    <Label htmlFor="purchase-price">Preço de Compra</Label>
                    <Input
                      id="purchase-price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="R$ 100,00"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                    />
                  </div>

                  {/* Parâmetros adicionais */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="marketing-budget">Orçamento de Marketing</Label>
                      <Input
                        id="marketing-budget"
                        type="number"
                        step="1"
                        min="0"
                        placeholder="R$ 1.000,00"
                        value={marketingBudget}
                        onChange={(e) => setMarketingBudget(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inventory">Estoque Disponível</Label>
                      <Input
                        id="inventory"
                        type="number"
                        step="1"
                        min="1"
                        placeholder="100 unidades"
                        value={inventory}
                        onChange={(e) => setInventory(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Modo de lucro */}
                  <div className="space-y-4">
                    <Label>Lucro Desejado</Label>
                    <RadioGroup value={mode} onValueChange={(value: Mode) => setMode(value)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="percentage" id="percentage" />
                        <Label htmlFor="percentage">Porcentagem</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="amount" id="amount" />
                        <Label htmlFor="amount">Valor fixo</Label>
                      </div>
                    </RadioGroup>

                    {mode === "percentage" ? (
                      <div className="space-y-2">
                        <Label htmlFor="profit-percentage">Porcentagem de Lucro (%)</Label>
                        <Input
                          id="profit-percentage"
                          type="number"
                          step="0.01"
                          placeholder="25"
                          value={profitPercentage}
                          onChange={(e) => setProfitPercentage(e.target.value)}
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="profit-amount">Valor de Lucro</Label>
                        <Input
                          id="profit-amount"
                          type="number"
                          step="0.01"
                          placeholder="R$ 30,00"
                          value={profitAmount}
                          onChange={(e) => setProfitAmount(e.target.value)}
                        />
                      </div>
                    )}
                  </div>

                  {/* Preço médio do mercado */}
                  <div className="space-y-2">
                    <Label htmlFor="market-average">Preço Médio do Mercado (opcional)</Label>
                    <Input
                      id="market-average"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="R$ 145,00"
                      value={marketAverage}
                      onChange={(e) => setMarketAverage(e.target.value)}
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3 flex-wrap">
                    <Button onClick={compute} className="flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      Calcular Preço
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={analyzeMarket}
                      disabled={analyzing}
                      className="flex items-center gap-2"
                    >
                      <Brain className="h-4 w-4" />
                      {analyzing ? "Analisando..." : "Análise de Mercado"}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={predictSales}
                      disabled={analyzing || !result}
                      className="flex items-center gap-2"
                    >
                      <LineChart className="h-4 w-4" />
                      {analyzing ? "Prevendo..." : "Prever Vendas"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Resultados e insights */}
            <div className="space-y-6">
              {/* Resultado do cálculo */}
              {result && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Resultado
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Preço Sugerido</span>
                        <span className="font-bold text-lg">{formatCurrency(result.suggestedPrice, locale)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Lucro</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(result.profitAmount, locale)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Margem</span>
                        <span className="font-medium">{formatPercent(result.profitPercentage)}</span>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="text-sm text-muted-foreground">
                      {result.competitiveMessage}
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={explainWithAI}
                      disabled={analyzing}
                      className="w-full flex items-center gap-2"
                    >
                      <Lightbulb className="h-4 w-4" />
                      {analyzing ? "Gerando..." : "Explicar com IA"}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Smart Insights */}
              {smartInsights.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Insights Inteligentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {smartInsights.map((insight, index) => (
                      <div 
                        key={index}
                        className={`p-3 rounded-md border ${
                          insight.type === "warning" ? "bg-yellow-50 border-yellow-200" :
                          insight.type === "success" ? "bg-green-50 border-green-200" :
                          "bg-blue-50 border-blue-200"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {insight.type === "warning" && <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />}
                          {insight.type === "success" && <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />}
                          {insight.type === "info" && <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />}
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{insight.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                            {insight.action && (
                              <p className="text-xs font-medium mt-1">{insight.action}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Análise avançada com previsão de vendas */}
            {(marketAnalysis || explanation || salesPrediction) && (
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Análise Avançada com IA
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="explanation" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="explanation">Explicação IA</TabsTrigger>
                        <TabsTrigger value="market">Análise de Mercado</TabsTrigger>
                        <TabsTrigger value="sales">Previsão de Vendas</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="explanation" className="mt-4">
                        {explanation ? (
                          <div className="prose prose-sm max-w-none">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{explanation}</p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Clique em "Explicar com IA" para obter uma análise detalhada
                          </p>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="market" className="mt-4">
                        {marketAnalysis ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="text-center">
                                <p className="text-2xl font-bold">{formatCurrency(marketAnalysis.priceRange.min)}</p>
                                <p className="text-xs text-muted-foreground">Preço Mínimo</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold">{formatCurrency(marketAnalysis.priceRange.max)}</p>
                                <p className="text-xs text-muted-foreground">Preço Máximo</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold">{marketAnalysis.competitorCount}</p>
                                <p className="text-xs text-muted-foreground">Concorrentes</p>
                              </div>
                              <div className="text-center">
                                <Badge variant={
                                  marketAnalysis.demandLevel === "high" ? "default" :
                                  marketAnalysis.demandLevel === "medium" ? "secondary" : "outline"
                                }>
                                  {marketAnalysis.demandLevel === "high" ? "Alta" :
                                   marketAnalysis.demandLevel === "medium" ? "Média" : "Baixa"} Demanda
                                </Badge>
                              </div>
                            </div>
                            
                            <Separator />
                            
                            <div>
                              <h4 className="font-medium mb-2">Recomendações</h4>
                              <ul className="space-y-1">
                                {marketAnalysis.recommendations.map((rec, index) => (
                                  <li key={index} className="text-sm flex items-start gap-2">
                                    <CheckCircle className="h-3 w-3 text-green-600 mt-1 flex-shrink-0" />
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Clique em "Análise de Mercado" para obter dados detalhados
                          </p>
                        )}
                      </TabsContent>

                      <TabsContent value="sales" className="mt-4">
                        {salesPrediction ? (
                          <div className="space-y-6">
                            {/* Previsão de Vendas */}
                            <div>
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <ShoppingCart className="h-4 w-4" />
                                Previsão de Volume de Vendas
                              </h4>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="text-center p-3 bg-blue-50 rounded-md">
                                  <p className="text-2xl font-bold text-blue-600">{salesPrediction.estimatedSalesVolume.daily}</p>
                                  <p className="text-xs text-muted-foreground">Por Dia</p>
                                </div>
                                <div className="text-center p-3 bg-green-50 rounded-md">
                                  <p className="text-2xl font-bold text-green-600">{salesPrediction.estimatedSalesVolume.weekly}</p>
                                  <p className="text-xs text-muted-foreground">Por Semana</p>
                                </div>
                                <div className="text-center p-3 bg-purple-50 rounded-md">
                                  <p className="text-2xl font-bold text-purple-600">{salesPrediction.estimatedSalesVolume.monthly}</p>
                                  <p className="text-xs text-muted-foreground">Por Mês</p>
                                </div>
                              </div>
                            </div>

                            {/* Projeção de Receita */}
                            <div>
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Projeção de Receita
                              </h4>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="text-center p-3 bg-yellow-50 rounded-md">
                                  <p className="text-2xl font-bold text-yellow-600">{formatCurrency(salesPrediction.revenueProjection.daily)}</p>
                                  <p className="text-xs text-muted-foreground">Por Dia</p>
                                </div>
                                <div className="text-center p-3 bg-orange-50 rounded-md">
                                  <p className="text-2xl font-bold text-orange-600">{formatCurrency(salesPrediction.revenueProjection.weekly)}</p>
                                  <p className="text-xs text-muted-foreground">Por Semana</p>
                                </div>
                                <div className="text-center p-3 bg-red-50 rounded-md">
                                  <p className="text-2xl font-bold text-red-600">{formatCurrency(salesPrediction.revenueProjection.monthly)}</p>
                                  <p className="text-xs text-muted-foreground">Por Mês</p>
                                </div>
                              </div>
                            </div>

                            <Separator />

                            {/* Métricas importantes */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              <div className="text-center">
                                <p className="text-xl font-bold">{formatPercent(salesPrediction.conversionRate * 100)}</p>
                                <p className="text-xs text-muted-foreground">Taxa de Conversão</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xl font-bold">{salesPrediction.marketingRecommendations.expectedROI}x</p>
                                <p className="text-xs text-muted-foreground">ROI Esperado</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xl font-bold">{formatPercent(salesPrediction.confidenceLevel * 100)}</p>
                                <p className="text-xs text-muted-foreground">Confiança</p>
                              </div>
                            </div>

                            {/* Otimização de Preço */}
                            <div>
                              <h4 className="font-medium mb-2">Otimização de Preço</h4>
                              <div className="p-3 bg-gray-50 rounded-md">
                                <p className="font-medium text-sm">Preço Otimizado: {formatCurrency(salesPrediction.priceOptimization.recommendedPrice)}</p>
                                <p className="text-xs text-muted-foreground mt-1">{salesPrediction.priceOptimization.expectedImpact}</p>
                                <p className="text-xs mt-1">{salesPrediction.priceOptimization.reasoning}</p>
                              </div>
                            </div>

                            {/* Insights e Recomendações */}
                            <div>
                              <h4 className="font-medium mb-2">Insights Estratégicos</h4>
                              <ul className="space-y-1">
                                {salesPrediction.keyInsights.map((insight, index) => (
                                  <li key={index} className="text-sm flex items-start gap-2">
                                    <Lightbulb className="h-3 w-3 text-blue-600 mt-1 flex-shrink-0" />
                                    {insight}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Clique em "Prever Vendas" para obter projeções detalhadas
                          </p>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="portfolio" className="mt-6">
          <div className="space-y-6">
            {/* Cabeçalho com botão de refresh */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Análise do Portfólio</h2>
                <p className="text-muted-foreground">
                  Análise inteligente dos seus produtos cadastrados
                </p>
              </div>
              <Button 
                onClick={loadUserAnalysis}
                disabled={analyzing}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${analyzing ? "animate-spin" : ""}`} />
                {analyzing ? "Analisando..." : "Atualizar"}
              </Button>
            </div>

            {userAnalysis && (
              <>
                {/* Cards de estatísticas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total de Produtos</p>
                          <p className="text-2xl font-bold">{userAnalysis.totalProducts}</p>
                        </div>
                        <Package className="h-8 w-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Margem Média</p>
                          <p className="text-2xl font-bold">{formatPercent(userAnalysis.averageProfitMargin)}</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Valor Investido</p>
                          <p className="text-2xl font-bold">{formatCurrency(userAnalysis.totalCurrentValue)}</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-orange-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Potencial de Receita</p>
                          <p className="text-2xl font-bold">{formatCurrency(userAnalysis.totalPotentialRevenue)}</p>
                        </div>
                        <BarChart3 className="h-8 w-8 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Insights gerais */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      Insights do Portfólio
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {userAnalysis.insights.map((insight, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Lista de produtos */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Análise por Produto
                    </CardTitle>
                    <CardDescription>
                      Sugestões de preços otimizadas para cada produto
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {userAnalysis.products.map((product) => (
                        <div key={product.productId} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-medium">{product.productName}</h4>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <span>Compra: {formatCurrency(product.currentBuyPrice)}</span>
                                <span>•</span>
                                <span>Margem: {formatPercent(product.profitMargin)}</span>
                              </div>
                            </div>
                            <Badge variant={
                              product.marketPosition === "underpriced" ? "default" :
                              product.marketPosition === "overpriced" ? "destructive" : "secondary"
                            }>
                              {product.marketPosition === "underpriced" ? "Subprecificado" :
                               product.marketPosition === "overpriced" ? "Sobreprecificado" : "Otimizado"}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Preço Atual</p>
                              <div className="flex items-center gap-2">
                                {editingPrices.has(product.productId) ? (
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={tempPrices[product.productId] || ""}
                                      onChange={(e) => setTempPrices(prev => ({
                                        ...prev,
                                        [product.productId]: e.target.value
                                      }))}
                                      className="h-8 w-24"
                                    />
                                    <Button
                                      size="sm"
                                      onClick={() => savePrice(product.productId)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Save className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => cancelEditingPrice(product.productId)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">
                                      {product.currentSellPrice ? formatCurrency(product.currentSellPrice) : "Não definido"}
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => startEditingPrice(product.productId, product.currentSellPrice)}
                                      className="h-6 w-6 p-0"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Preço Sugerido</p>
                              <p className="font-medium text-green-600">{formatCurrency(product.suggestedSellPrice)}</p>
                            </div>
                            
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Potencial de Lucro</p>
                              <p className="font-medium">{formatCurrency(product.potentialProfit)}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground mb-1">Recomendações</p>
                              <ul className="space-y-1">
                                {product.recommendations.slice(0, 2).map((rec, idx) => (
                                  <li key={idx} className="text-xs flex items-start gap-1">
                                    <span className="text-muted-foreground">•</span>
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            {product.currentSellPrice !== product.suggestedSellPrice && (
                              <Button 
                                size="sm"
                                onClick={() => applySuggestedPrice(product.productId, product.suggestedSellPrice)}
                                className="ml-4"
                              >
                                Aplicar Sugestão
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}

                      {userAnalysis.products.length === 0 && (
                        <div className="text-center py-8">
                          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">Nenhum produto encontrado</h3>
                          <p className="text-muted-foreground">
                            Adicione produtos ao seu catálogo para receber análises personalizadas
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}