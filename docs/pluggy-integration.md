# Integração Pluggy - Guia de Uso

## Visão Geral

A integração Pluggy permite conectar contas bancárias e sincronizar transações financeiras. Existem duas formas principais de criar conexões:

- **Opção A**: Connect Token + Widget (recomendado para UX)
- **Opção B**: Criar Item diretamente via API (programático)

## Autenticação

A autenticação é feita automaticamente através da função `getPluggyApiKey()` que:
- Faz POST para `/auth` com `clientId` e `clientSecret`
- Retorna uma API Key que é cacheada em memória
- Renova automaticamente quando expira

## Opção A: Connect Token + Widget (Recomendado)

### 1. Criar Connect Token

**Endpoint:** `POST /api/pluggy/connect-token`

**Exemplo de requisição:**
```bash
curl -X POST "http://localhost:3000/api/pluggy/connect-token" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "pt",
    "country": "BR"
  }'
```

**Resposta:**
```json
{
  "success": true,
  "connectToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2025-11-05T12:00:00Z"
}
```

### 2. Usar o Connect Token no Frontend

No frontend, você precisa:
1. Incluir o script do Pluggy Connect Widget
2. Inicializar o widget com o `connectToken`
3. O widget retornará o `itemId` quando o usuário conectar

**Exemplo HTML/JS:**
```html
<script src="https://cdn.pluggy.ai/pluggy-connect/v1/pluggy-connect.js"></script>
<script>
  async function connectBank() {
    // 1. Obter Connect Token do backend
    const response = await fetch('/api/pluggy/connect-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: 'pt' })
    });
    const { connectToken } = await response.json();
    
    // 2. Inicializar widget
    const pluggyConnect = new PluggyConnect({
      connectToken: connectToken,
      onSuccess: (item) => {
        console.log('Item criado:', item.id);
        // Salvar item.id para usar na sincronização
      },
      onError: (error) => {
        console.error('Erro:', error);
      }
    });
    
    pluggyConnect.init();
  }
</script>
```

## Opção B: Criar Item Diretamente (API)

### 1. Listar Conectores Disponíveis

**Endpoint:** `GET /api/pluggy/items?listConnectors=true&name=bradesco`

**Exemplo:**
```bash
curl "http://localhost:3000/api/pluggy/items?listConnectors=true&country=BR"
```

**Resposta:**
```json
{
  "success": true,
  "results": [
    {
      "id": "bradesco",
      "name": "Bradesco",
      "country": "BR",
      "type": "BANK",
      "parameters": [
        { "name": "username", "label": "Usuário", "type": "text", "required": true },
        { "name": "password", "label": "Senha", "type": "password", "required": true }
      ]
    }
  ],
  "totalResults": 1
}
```

### 2. Criar Item com Credenciais

**Endpoint:** `POST /api/pluggy/items`

**Exemplo para Bradesco Sandbox:**
```bash
curl -X POST "http://localhost:3000/api/pluggy/items" \
  -H "Content-Type: application/json" \
  -d '{
    "connector": "bradesco",
    "credentials": {
      "username": "bnk100",
      "password": "combelvo"
    },
    "metadata": {
      "externalId": "user-123"
    }
  }'
```

**Resposta:**
```json
{
  "success": true,
  "item": {
    "id": "abc123-def456-ghi789",
    "connector": {
      "id": "bradesco",
      "name": "Bradesco"
    },
    "status": "UPDATING",
    "executionStatus": "CREATED",
    "createdAt": "2025-11-05T10:00:00Z"
  }
}
```

### 3. Verificar Status do Item

**Endpoint:** `GET /api/pluggy/items?itemId=abc123-def456-ghi789`

```bash
curl "http://localhost:3000/api/pluggy/items?itemId=abc123-def456-ghi789"
```

## Sincronização de Transações

Após criar um Item (conexão), você pode sincronizar as transações:

**Endpoint:** `POST /api/pluggy/sync`

**Exemplo:**
```bash
curl -X POST "http://localhost:3000/api/pluggy/sync" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_SERVICE_TOKEN" \
  -d '{
    "itemId": "abc123-def456-ghi789",
    "dateFrom": "2025-10-01",
    "dateTo": "2025-11-05",
    "limit": 500
  }'
```

**Parâmetros:**
- `itemId` (obrigatório se não houver `PLUGGY_DEFAULT_CONNECTION_ID`): ID do item (conexão)
- `accountId` (opcional): ID da conta específica
- `dateFrom` (opcional): Data inicial (YYYY-MM-DD), padrão: 30 dias atrás
- `dateTo` (opcional): Data final (YYYY-MM-DD), padrão: hoje
- `limit` (opcional): Limite por request (máximo 500), padrão: 500

## Buscar Transações (sem sincronizar)

Para apenas buscar transações sem salvar no banco:

**Endpoint:** `GET /api/pluggy/transactions`

**Exemplo:**
```bash
curl "http://localhost:3000/api/pluggy/transactions?itemId=abc123&from=2025-08-01&to=2025-09-30&limit=500" \
  -H "X-API-KEY: SEU_API_KEY"
```

**Query Parameters:**
- `itemId` ou `item_id`: ID do item (conexão)
- `accountId` ou `account_id`: ID da conta (opcional)
- `dateFrom` ou `from`: Data inicial (YYYY-MM-DD)
- `dateTo` ou `to`: Data final (YYYY-MM-DD)
- `limit`: Limite por request (máximo 500)

**Resposta:**
```json
{
  "success": true,
  "transactions": [
    {
      "id": "txn-123",
      "accountId": "acc-456",
      "date": "2025-08-15",
      "description": "Transferência recebida",
      "amount": 1000.00,
      "type": "CREDIT",
      "currency": "BRL",
      "category": "TRANSFER",
      "status": "POSTED"
    }
  ],
  "total": 1,
  "period": {
    "from": "2025-08-01",
    "to": "2025-09-30"
  }
}
```

### Paginação

A API Pluggy retorna até 500 transações por request. Para histórico maior:
- A função `fetchPluggyTransactions()` faz paginação automática usando o campo `next` retornado pela API
- Se houver mais resultados, a função continua buscando até obter todas as transações do período

## Credenciais Sandbox

Para testes no ambiente de desenvolvimento, use as credenciais sandbox fornecidas pela Pluggy:

**Bradesco Sandbox:**
- Username: `bnk100`
- Password: `combelvo`

**Outros bancos:** Consulte a documentação oficial da Pluggy para credenciais sandbox de outros bancos.

## Variáveis de Ambiente

Certifique-se de ter configurado no `.env.local`:

```env
PLUGGY_CLIENT_ID=1606eb95-167d-4bea-b9f7-301cb2c7b9ce
PLUGGY_CLIENT_SECRET=89637b21-a379-44a4-b458-67a0dab37e3d
PLUGGY_ENV=development
PLUGGY_SYNC_SERVICE_TOKEN=seu_token_seguro
```

## Fluxo Completo

1. **Criar conexão** (Opção A ou B)
2. **Aguardar Item ficar pronto** (status = "UPDATED")
3. **Sincronizar transações** usando o `itemId`
4. **Transações são salvas** na tabela `financial_transactions`

## Sincronização Automática

### Opção A: Webhooks (Recomendado)

Webhooks são notificações em tempo real da Pluggy quando há atualizações. É a forma mais eficiente de sincronização.

**1. Registrar Webhook:**

```bash
POST /api/pluggy/webhooks
{
  "url": "https://seu-dominio.com/api/pluggy/webhook",
  "events": ["transactions.updated", "item.updated", "item.error"],
  "active": true
}
```

**2. Configurar URL no .env.local:**

```env
PLUGGY_WEBHOOK_URL=https://seu-dominio.com/api/pluggy/webhook
```

**3. Eventos suportados:**
- `transactions.updated`: Novas transações disponíveis
- `item.updated`: Item foi atualizado
- `item.error`: Erro ao atualizar item

**4. O webhook automaticamente:**
- Recebe notificação da Pluggy
- Busca transações do item desde a última sincronização (últimos 7 dias)
- Verifica duplicatas usando `pluggy_id`
- Salva apenas transações novas no banco

**Exemplo de payload do webhook:**
```json
{
  "event": "transactions.updated",
  "itemId": "abc123-def456-ghi789",
  "timestamp": "2025-11-05T10:00:00Z"
}
```

### Opção B: Cron/Polling

Se preferir sincronização periódica sem webhooks:

**1. Executar manualmente:**
```bash
npm run pluggy:cron
```

**2. Configurar cron automático:**

O script já está configurado para rodar automaticamente. Ajuste no `.env.local`:

```env
PLUGGY_CRON_EXPRESSION=0 */6 * * *  # A cada 6 horas
PLUGGY_CRON_TZ=America/Sao_Paulo
PLUGGY_CRON_RUN_ON_START=true
```

**Expressões CRON comuns:**
- `0 */6 * * *` - A cada 6 horas
- `0 8 * * *` - Todo dia às 08:00
- `*/30 * * * *` - A cada 30 minutos

## Gerenciar Webhooks

**Listar webhooks:**
```bash
GET /api/pluggy/webhooks
```

**Deletar webhook:**
```bash
DELETE /api/pluggy/webhooks?id=webhook-id
```

## Referências

- [Documentação Pluggy](https://docs.pluggy.ai/)
- [Pluggy Connect Widget](https://docs.pluggy.ai/docs/pluggy-connect-widget)
- [Pluggy Webhooks](https://docs.pluggy.ai/docs/webhooks)

