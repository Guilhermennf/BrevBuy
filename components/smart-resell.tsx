"use client";

import React, { useMemo, useState } from "react";
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
  Calendar
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

  const { toast } = useToast();
  const locale = useMemo(() => (typeof navigator !== "undefined" ? navigator.language : "pt-BR"), []);

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

    generateSmartInsights(suggestedPrice, profitPct, m);
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

  return (
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
  );
}