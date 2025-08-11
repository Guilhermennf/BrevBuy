import { NextResponse } from "next/server";
import { SUBSCRIPTION_PLANS } from "@/lib/stripe";
import { ok, serverError } from "@/lib/api-response";

export async function GET() {
    try {
        return ok({ success: true, data: SUBSCRIPTION_PLANS });
    } catch (error) {
        console.error("Erro ao buscar planos:", error);
        return serverError();
    }
}
