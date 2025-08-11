# Sistema de Verificação de Assinatura

Este documento descreve o sistema de verificação de assinatura implementado no BrevBuy para restringir o acesso às funcionalidades principais quando o usuário não possui uma assinatura ativa.

## Visão Geral

O sistema verifica automaticamente se o usuário tem:
- Assinatura ativa (mensal ou anual)
- Período de teste gratuito válido (7 dias)
- Acesso às funcionalidades do sistema

## Política por método HTTP

- **GET/HEAD/OPTIONS**
  - Não passam pela verificação de assinatura.
  - Podem ainda exigir autenticação (dependendo do endpoint), mas não bloqueiam por status de assinatura/trial.
- **POST/PUT/PATCH**
  - Exigem verificação de assinatura/trial.
  - Se o trial estiver expirado, a assinatura estiver cancelada/expirada ou não houver assinatura válida, retornará 403 com `requiresUpgrade: true`.

## Middleware de Verificação

### `verifySubscriptionAccess()`

Localizado em: `lib/subscription-middleware.ts`

Esta função middleware:
1. Verifica se o usuário está autenticado
2. Em métodos GET/HEAD/OPTIONS, retorna o usuário sem verificar assinatura
3. Em métodos POST/PUT/PATCH, verifica assinatura via `hasSubscriptionAccess()`
4. Retorna erro 403 com mensagem específica se não tiver acesso
5. Retorna dados do usuário se tiver acesso

### Tipos de Status de Assinatura

- **`free_trial`**: Período de teste gratuito de 7 dias
- **`active`**: Assinatura ativa (mensal ou anual)
- **`cancelled`**: Assinatura cancelada
- **`expired`**: Período de teste ou assinatura expirados

## Endpoints Protegidos (verificação de assinatura)

A verificação de assinatura aplica-se apenas a POST/PUT/PATCH:

### Produtos
- `POST /api/products` - Criar produto
- `PUT /api/products/[id]` - Atualizar produto
- `PATCH /api/products/[id]/sell` - Marcar produto como vendido
- `DELETE /api/products/[id]` - Observação: por ora, não exige verificação de assinatura (pode ser alterado futuramente)

### Categorias
- `POST /api/categories` - Criar categoria
- `PUT /api/categories/[id]` - Atualizar categoria

### Automação
- `POST /api/automation/analyze-screenshot` - Análise de screenshot com IA

## Endpoints NÃO Protegidos (por assinatura)

Os seguintes endpoints permanecem acessíveis sem verificação de assinatura (podem ainda exigir autenticação se o handler assim o fizer):

### Leitura (GET)
- `GET /api/products` - Listar produtos
- `GET /api/products/[id]` - Buscar produto específico
- `GET /api/categories` - Listar categorias
- `GET /api/categories/[id]` - Buscar categoria específica

### Autenticação
- Todos os endpoints em `/api/auth/*`
- Login, registro, recuperação de senha, etc.

### Assinatura
- `GET /api/subscription/status` - Status da assinatura
- `POST /api/subscription/create-checkout` - Criar checkout
- `GET /api/subscription/plans` - Planos disponíveis
- `POST /api/subscription/webhook` - Webhook do Stripe

### Cron Jobs
- `POST /api/cron/check-trials` - Verificação automática de trials

## Mensagens de Erro

Quando o acesso é negado, o sistema retorna erro 403 com mensagens específicas:

### Período de Teste Expirado
```json
{
  "error": "Acesso negado. Seu período de teste gratuito de 7 dias expirou. Faça upgrade para continuar usando o sistema.",
  "subscriptionStatus": "free_trial",
  "requiresUpgrade": true
}
```

### Assinatura Cancelada
```json
{
  "error": "Acesso negado. Sua assinatura foi cancelada. Reative sua assinatura para continuar usando o sistema.",
  "subscriptionStatus": "cancelled",
  "requiresUpgrade": true
}
```

### Sem Assinatura
```json
{
  "error": "Acesso negado. Você precisa de uma assinatura ativa para acessar esta funcionalidade.",
  "subscriptionStatus": "expired",
  "requiresUpgrade": true
}
```

## Implementação no Frontend

O frontend deve tratar os erros 403 e redirecionar o usuário para a página de upgrade (isso só ocorrerá em POST/PUT/PATCH):

```typescript
// Exemplo de tratamento no frontend
if (response.status === 403) {
  const errorData = await response.json();
  if (errorData.requiresUpgrade) {
    // Redirecionar para página de upgrade
    router.push('/upgrade');
    // Ou mostrar modal de upgrade
  }
}
```

## Lógica de Verificação

A verificação segue esta ordem de prioridade (quando aplicada a POST/PUT/PATCH):

1. **Assinatura Cancelada**: Sempre nega acesso
2. **Assinatura Ativa**: Verifica se `currentPeriodEnd` ainda é válido
3. **Período de Teste**: Verifica se ainda está dentro dos 7 dias
4. **Outros Status**: Nega acesso

## Segurança

- Verificação sempre feita no servidor (backend)
- Não depende de dados do frontend
- Consulta direta ao banco de dados
- Validação de propriedade dos recursos (userId)

## Monitoramento

Para monitorar tentativas de acesso negado:

1. Logs são gerados automaticamente
2. Métricas podem ser coletadas dos erros 403
3. Análise de conversão de usuários bloqueados

## Manutenção

Para proteger novos endpoints mutáveis (POST/PUT/PATCH):

```typescript
import { verifySubscriptionAccess } from "@/lib/subscription-middleware";

export async function POST(request: NextRequest) {
  const { error, user } = await verifySubscriptionAccess(request);
  if (error) return error;
  // lógica...
}
```

Para GET públicos (sem exigir login), basta não chamar o middleware na rota. Para GET autenticados, chame o middleware normalmente — ele apenas garantirá o usuário sem bloquear por assinatura.

### Modificando Mensagens

As mensagens podem ser customizadas em:
- `lib/subscription-middleware.ts`
- Função `createSubscriptionErrorResponse()`

## Testes

Para testar o sistema:

1. **Teste com usuário em trial válido**: Deve ter acesso
2. **Teste com trial expirado**: Deve ser bloqueado
3. **Teste com assinatura ativa**: Deve ter acesso
4. **Teste com assinatura cancelada**: Deve ser bloqueado
5. **Teste sem autenticação**: Deve retornar 401

## Considerações Futuras

- Implementar rate limiting por tipo de assinatura
- Adicionar métricas de uso por usuário
- Implementar funcionalidades limitadas para usuários gratuitos
- Adicionar notificações de expiração próxima