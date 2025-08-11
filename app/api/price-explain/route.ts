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
    } = body || {};

    if (
      typeof purchasePrice !== "number" ||
      typeof suggestedPrice !== "number" ||
      typeof profitAmountCalculated !== "number" ||
      typeof profitPercentageCalculated !== "number"
    ) {
      return NextResponse.json(
        { error: "Invalid input. Ensure calculation is performed before requesting explanation." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Missing GOOGLE_API_KEY. Please set it in your environment to enable AI explanations.",
        },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const parts: string[] = [];
    parts.push("You are assisting a small reseller in pricing a product.");
    parts.push("Provide a short, friendly explanation (3-6 sentences) of why the suggested price makes sense,");
    parts.push("focusing on profit goals and competitiveness vs market average if provided.");
    parts.push("Avoid repeating raw inputs verbatim; summarize and emphasize reasoning and trade-offs.");

    const details = {
      purchasePrice,
      mode,
      desiredProfitPercentage: mode === "percentage" ? profitPercentage : null,
      desiredProfitAmount: mode === "amount" ? profitAmount : null,
      marketAverage: typeof marketAverage === "number" ? marketAverage : null,
      suggestedPrice,
      profitAmount: profitAmountCalculated,
      profitPercentage: profitPercentageCalculated,
    };

    const prompt =
      parts.join(" ") +
      "\n\nContext (JSON):\n" +
      JSON.stringify(details, null, 2) +
      "\n\nReturn only the explanation, no markdown.";

    const resp = await model.generateContent(prompt);
    const text = resp.response.text().trim();

    return NextResponse.json({ explanation: text });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Unexpected error generating explanation." },
      { status: 500 }
    );
  }
}