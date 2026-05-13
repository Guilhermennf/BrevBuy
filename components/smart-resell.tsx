"use client";

import React, { useMemo, useState } from "react";

type Mode = "percentage" | "amount";

type Result = {
  suggestedPrice: number;
  profitAmount: number;
  profitPercentage: number;
  competitiveMessage: string;
};

function parseNumber(value: string): number | null {
  if (value == null) return null;
  const cleaned = value.replace(",", ".").trim();
  if (cleaned === "") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function formatCurrency(n: number, locale?: string) {
  const loc = locale || (typeof navigator !== "undefined" ? navigator.language : "en-US");
  return new Intl.NumberFormat(loc, { style: "currency", currency: "USD" }).format(n);
}

function formatPercent(n: number, decimals = 2) {
  return `${n.toFixed(decimals)}%`;
}

export default function SmartResellCalculator() {
  const [purchasePrice, setPurchasePrice] = useState("");
  const [mode, setMode] = useState<Mode>("percentage");
  const [profitPercentage, setProfitPercentage] = useState("");
  const [profitAmount, setProfitAmount] = useState("");
  const [marketAverage, setMarketAverage] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [explaining, setExplaining] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [explainError, setExplainError] = useState<string | null>(null);

  const locale = useMemo(() => (typeof navigator !== "undefined" ? navigator.language : "en-US"), []);

  function compute() {
    setError(null);
    setExplanation(null);
    setExplainError(null);

    const p = parseNumber(purchasePrice);
    if (p == null || p <= 0) {
      setResult(null);
      setError("Please enter a valid purchase price greater than 0.");
      return;
    }

    let suggestedPrice: number;
    let profitAmt: number;
    let profitPct: number;

    if (mode === "percentage") {
      const pct = parseNumber(profitPercentage);
      if (pct == null || !Number.isFinite(pct)) {
        setResult(null);
        setError("Please enter a valid profit percentage.");
        return;
      }
      suggestedPrice = p * (1 + pct / 100);
      profitAmt = suggestedPrice - p;
      profitPct = (profitAmt / p) * 100;
    } else {
      const amt = parseNumber(profitAmount);
      if (amt == null || !Number.isFinite(amt)) {
        setResult(null);
        setError("Please enter a valid profit amount.");
        return;
      }
      suggestedPrice = p + amt;
      profitAmt = amt;
      profitPct = (amt / p) * 100;
    }

    let competitiveMessage = "No market average provided.";
    const m = parseNumber(marketAverage);
    if (m != null && Number.isFinite(m) && m > 0) {
      const tolerance = 0.01; // ~1 cent tolerance
      if (Math.abs(suggestedPrice - m) <= tolerance) {
        competitiveMessage = "Your suggested price is equal to the market average.";
      } else if (suggestedPrice > m) {
        const diffPct = ((suggestedPrice - m) / m) * 100;
        competitiveMessage = `Your suggested price is ${formatPercent(diffPct)} above the market average. Consider adjusting if competitiveness is a priority.`;
      } else {
        const diffPct = ((m - suggestedPrice) / m) * 100;
        competitiveMessage = `Your suggested price is ${formatPercent(diffPct)} below the market average. This can improve competitiveness but verify your profit goals.`;
      }
    }

    setResult({
      suggestedPrice,
      profitAmount: profitAmt,
      profitPercentage: profitPct,
      competitiveMessage,
    });
  }

  async function explainWithAI() {
    if (!result) return;
    setExplaining(true);
    setExplainError(null);
    setExplanation(null);
    try {
      const body = {
        purchasePrice: parseNumber(purchasePrice),
        mode,
        profitPercentage: mode === "percentage" ? parseNumber(profitPercentage) : null,
        profitAmount: mode === "amount" ? parseNumber(profitAmount) : null,
        marketAverage: parseNumber(marketAverage),
        suggestedPrice: result.suggestedPrice,
        profitAmountCalculated: result.profitAmount,
        profitPercentageCalculated: result.profitPercentage,
      };
      const res = await fetch("/api/price-explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Failed to get explanation.");
      }
      const json = await res.json();
      setExplanation(json.explanation || "No explanation returned.");
    } catch (e: any) {
      setExplainError(e?.message || "Failed to generate explanation.");
    } finally {
      setExplaining(false);
    }
  }

  return (
    <div className="w-full rounded-lg border bg-background p-4 md:p-6">
      <div className="grid gap-4 md:gap-6">
        <div className="grid gap-2">
          <label htmlFor="purchase-price" className="text-sm font-medium">
            Purchase Price
          </label>
          <input
            id="purchase-price"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="e.g. 100"
            className="w-full rounded-md border px-3 py-2 bg-transparent"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <span className="text-sm font-medium">Desired Profit</span>
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mode"
                value="percentage"
                checked={mode === "percentage"}
                onChange={() => setMode("percentage")}
              />
              <span className="text-sm">Percentage</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mode"
                value="amount"
                checked={mode === "amount"}
                onChange={() => setMode("amount")}
              />
              <span className="text-sm">Amount</span>
            </label>
          </div>

          {mode === "percentage" ? (
            <div className="grid gap-2">
              <label htmlFor="profit-percentage" className="text-sm text-muted-foreground">
                Profit Percentage (%)
              </label>
              <input
                id="profit-percentage"
                type="number"
                inputMode="decimal"
                step="0.01"
                placeholder="e.g. 25"
                className="w-full rounded-md border px-3 py-2 bg-transparent"
                value={profitPercentage}
                onChange={(e) => setProfitPercentage(e.target.value)}
              />
            </div>
          ) : (
            <div className="grid gap-2">
              <label htmlFor="profit-amount" className="text-sm text-muted-foreground">
                Profit Amount
              </label>
              <input
                id="profit-amount"
                type="number"
                inputMode="decimal"
                step="0.01"
                placeholder="e.g. 30"
                className="w-full rounded-md border px-3 py-2 bg-transparent"
                value={profitAmount}
                onChange={(e) => setProfitAmount(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="grid gap-2">
          <label htmlFor="market-average" className="text-sm font-medium">
            Market Average Price (optional)
          </label>
          <input
            id="market-average"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="e.g. 145"
            className="w-full rounded-md border px-3 py-2 bg-transparent"
            value={marketAverage}
            onChange={(e) => setMarketAverage(e.target.value)}
          />
        </div>

        {error && (
          <div className="text-sm text-red-500">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={compute}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
          >
            Calculate
          </button>
          <button
            onClick={explainWithAI}
            disabled={!result || explaining}
            className="inline-flex items-center justify-center rounded-md border px-4 py-2 hover:bg-accent disabled:opacity-50"
            title={!result ? "Calculate first to enable AI explanation." : "Generate AI explanation"}
          >
            {explaining ? "Explaining..." : "Explain Suggestion with AI"}
          </button>
        </div>

        {result && (
          <div className="mt-2 grid gap-3 rounded-md border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Suggested Selling Price</span>
              <span className="font-medium">{formatCurrency(result.suggestedPrice, locale)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Profit Amount</span>
              <span className="font-medium">{formatCurrency(result.profitAmount, locale)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Profit Percentage</span>
              <span className="font-medium">{formatPercent(result.profitPercentage)}</span>
            </div>
            <div className="pt-2 border-t text-sm">
              {result.competitiveMessage}
            </div>
          </div>
        )}

        {explainError && (
          <div className="text-sm text-red-500">
            {explainError}
          </div>
        )}

        {explanation && (
          <div className="rounded-md border p-4 bg-muted/30">
            <p className="whitespace-pre-wrap text-sm">{explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}