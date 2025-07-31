import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserSubscriptionInfo } from '@/lib/subscription-utils';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        subscriptionStatus: true,
        trialStartDate: true,
        trialEndDate: true,
        subscriptionId: true,
        customerId: true,
        currentPeriodEnd: true,
        planType: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const subscriptionInfo = getUserSubscriptionInfo(user);

    return NextResponse.json({
      success: true,
      data: subscriptionInfo
    });

  } catch (error) {
    console.error('Erro ao buscar status da assinatura:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}