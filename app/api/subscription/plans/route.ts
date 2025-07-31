import { NextResponse } from 'next/server';
import { SUBSCRIPTION_PLANS } from '@/lib/stripe';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: SUBSCRIPTION_PLANS
    });
  } catch (error) {
    console.error('Erro ao buscar planos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}