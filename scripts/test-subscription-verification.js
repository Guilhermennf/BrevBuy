/**
 * Script para testar a verificação de assinatura
 * Execute com: node scripts/test-subscription-verification.js
 */

const { PrismaClient } = require('@prisma/client');
const { hasSubscriptionAccess, calculateTrialEndDate } = require('../lib/subscription-utils');

const prisma = new PrismaClient();

async function testSubscriptionVerification() {
    console.log('🧪 Testando Sistema de Verificação de Assinatura\n');

    try {
        // Buscar alguns usuários para teste
        const users = await prisma.user.findMany({
            take: 5,
            select: {
                id: true,
                email: true,
                subscriptionStatus: true,
                trialStartDate: true,
                trialEndDate: true,
                currentPeriodEnd: true,
                planType: true,
            },
        });

        if (users.length === 0) {
            console.log('❌ Nenhum usuário encontrado no banco de dados');
            return;
        }

        console.log(`📊 Testando ${users.length} usuários:\n`);

        for (const user of users) {
            console.log(`👤 Usuário: ${user.email}`);
            console.log(`   Status: ${user.subscriptionStatus}`);
            console.log(`   Plano: ${user.planType || 'N/A'}`);
            
            // Calcular data de fim do trial se não existir
            const trialEndDate = user.trialEndDate || calculateTrialEndDate(user.trialStartDate);
            
            // Verificar acesso
            const hasAccess = hasSubscriptionAccess(
                user.subscriptionStatus,
                user.trialStartDate,
                user.trialEndDate,
                user.currentPeriodEnd
            );

            console.log(`   🔐 Acesso: ${hasAccess ? '✅ PERMITIDO' : '❌ NEGADO'}`);
            
            if (user.subscriptionStatus === 'free_trial') {
                const now = new Date();
                const daysLeft = Math.ceil((trialEndDate - now) / (1000 * 60 * 60 * 24));
                console.log(`   ⏰ Trial expira em: ${daysLeft} dias`);
            }
            
            if (user.currentPeriodEnd) {
                const now = new Date();
                const daysLeft = Math.ceil((user.currentPeriodEnd - now) / (1000 * 60 * 60 * 24));
                console.log(`   💳 Assinatura expira em: ${daysLeft} dias`);
            }
            
            console.log('');
        }

        // Estatísticas gerais
        const stats = await prisma.user.groupBy({
            by: ['subscriptionStatus'],
            _count: {
                subscriptionStatus: true,
            },
        });

        console.log('📈 Estatísticas de Assinatura:');
        stats.forEach(stat => {
            console.log(`   ${stat.subscriptionStatus}: ${stat._count.subscriptionStatus} usuários`);
        });

        // Verificar usuários com trial expirado
        const expiredTrials = await prisma.user.count({
            where: {
                subscriptionStatus: 'free_trial',
                trialStartDate: {
                    lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 dias atrás
                }
            }
        });

        console.log(`\n⚠️  Usuários com trial expirado: ${expiredTrials}`);
        
        if (expiredTrials > 0) {
            console.log('   💡 Execute o cron job para atualizar status: POST /api/cron/check-trials');
        }

    } catch (error) {
        console.error('❌ Erro ao testar verificação de assinatura:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Função para simular diferentes cenários
async function simulateScenarios() {
    console.log('\n🎭 Simulando Cenários de Teste:\n');

    const scenarios = [
        {
            name: 'Trial Ativo (3 dias restantes)',
            subscriptionStatus: 'free_trial',
            trialStartDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 dias atrás
            trialEndDate: null,
            currentPeriodEnd: null
        },
        {
            name: 'Trial Expirado',
            subscriptionStatus: 'free_trial',
            trialStartDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 dias atrás
            trialEndDate: null,
            currentPeriodEnd: null
        },
        {
            name: 'Assinatura Ativa (Mensal)',
            subscriptionStatus: 'active',
            trialStartDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            trialEndDate: null,
            currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 dias no futuro
        },
        {
            name: 'Assinatura Cancelada',
            subscriptionStatus: 'cancelled',
            trialStartDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            trialEndDate: null,
            currentPeriodEnd: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 dias atrás
        }
    ];

    scenarios.forEach((scenario, index) => {
        console.log(`${index + 1}. ${scenario.name}`);
        
        const hasAccess = hasSubscriptionAccess(
            scenario.subscriptionStatus,
            scenario.trialStartDate,
            scenario.trialEndDate,
            scenario.currentPeriodEnd
        );

        console.log(`   Resultado: ${hasAccess ? '✅ ACESSO PERMITIDO' : '❌ ACESSO NEGADO'}`);
        console.log('');
    });
}

// Executar testes
if (require.main === module) {
    testSubscriptionVerification()
        .then(() => simulateScenarios())
        .then(() => {
            console.log('✅ Testes concluídos!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Erro nos testes:', error);
            process.exit(1);
        });
}

module.exports = {
    testSubscriptionVerification,
    simulateScenarios
};