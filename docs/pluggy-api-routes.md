# Rotas da API Pluggy - Documentação

Este documento descreve as rotas da API Pluggy implementadas no backend.

## Rotas Implementadas

### 1. POST /api/pluggy/auth

**Descrição:** Obtém a API Key da Pluggy (opcional, só no server)

**Método:** `POST`

**Headers:**
- `Content-Type: application/json`

**Resposta:**
```json
{
  "success": true,
  "apiKey": "x-api-key-completa",
  "masked": "primeiros-20-caracteres...",
  "message": "API Key obtida com sucesso. Use no header X-API-KEY nas requisições."
}
```

**Nota:** Esta rota é útil para debug ou quando você precisa da API Key no servidor. Normalmente, a API Key é obtida automaticamente pelo cliente Pluggy.

---

### 2. POST /api/pluggy/connect-token

**Descrição:** Cria um Connect Token para usar com o Pluggy Connect Widget

**Método:** `POST`

**Headers:**
- `Content-Type: application/json`

**Body:**
```json
{
  "language": "pt",                    // Opcional, padrão: "pt"
  "country": "BR",                     // Opcional
  "institution": "bradesco",          // Opcional
  "connector": "bradesco",            // Opcional
  "webhookUrl": "https://...",        // Opcional
  "clientUserId": "user-123"          // Opcional
}
```

**Resposta:**
```json
{
  "success": true,
  "connectToken": "token-para-widget",
  "expiresAt": "2025-11-10T12:00:00Z"  // Opcional
}
```

**Uso:** Este token é usado pelo Pluggy Connect Widget para permitir que o usuário conecte suas contas bancárias através da interface da Pluggy.

---

### 3. POST /api/pluggy/items

**Descrição:** Cria um Item (conexão) diretamente via API, registra no banco e inicia sincronização

**Método:** `POST`

**Headers:**
- `Content-Type: application/json`

**Body:**
```json
{
  "connector": "bradesco",                    // Obrigatório
  "credentials": {                            // Obrigatório
    "username": "bnk100",
    "password": "combelvo"
  },
  "metadata": {                               // Opcional
    "externalId": "user-123"
  },
  "webhookUrl": "https://...",               // Opcional
  "clientUserId": "user-123",                // Opcional
  "userId": "uuid-do-usuario",               // Opcional (necessário para registrar no banco)
  "segmentId": "uuid-do-segmento",          // Opcional
  "startSync": true                          // Opcional, padrão: true
}
```

**Resposta:**
```json
{
  "success": true,
  "item": {
    "id": "item-id-da-pluggy",
    "connector": {
      "id": "bradesco",
      "name": "Bradesco"
    },
    "status": "UPDATING",
    "executionStatus": "CREATED",
    "createdAt": "2025-11-10T12:00:00Z",
    "updatedAt": "2025-11-10T12:00:00Z"
  },
  "savedItem": {                             // Se userId foi fornecido
    "id": "uuid-do-registro",
    "item_id": "item-id-da-pluggy",
    "user_id": "uuid-do-usuario",
    "segment_id": "uuid-do-segmento",
    "status": "UPDATING",
    "last_sync_at": null
  },
  "sync": {                                  // Se startSync=true
    "imported": 150,
    "total": 200,
    "success": true
  }
}
```

**Comportamento:**
1. Cria o item na Pluggy
2. Se `userId` for fornecido, registra o item na tabela `pluggy_items`
3. Se `startSync` for `true` (padrão), busca e persiste transações dos últimos 30 dias
4. Atualiza `last_sync_at` do item após sincronização bem-sucedida

---

### 4. GET /api/pluggy/transactions

**Descrição:** Busca transações da Pluggy e opcionalmente persiste no banco

**Método:** `GET`

**Query Parameters:**
- `itemId` ou `item_id`: ID do item (conexão) da Pluggy (obrigatório se não houver accountId)
- `accountId` ou `account_id`: ID da conta (opcional)
- `dateFrom` ou `from`: Data inicial (YYYY-MM-DD, padrão: 30 dias atrás)
- `dateTo` ou `to`: Data final (YYYY-MM-DD, padrão: hoje)
- `limit`: Limite por request (máximo 500, padrão: 500)
- `persist`: Se `true`, persiste as transações no banco (padrão: `false`)

**Exemplo:**
```
GET /api/pluggy/transactions?item_id=abc123&from=2025-08-01&to=2025-09-30&limit=500&persist=true
```

**Resposta:**
```json
{
  "success": true,
  "transactions": [
    {
      "id": "transaction-id",
      "accountId": "account-id",
      "date": "2025-09-15",
      "description": "Pagamento de fornecedor",
      "amount": -1500.00,
      "type": "debit",
      "currency": "BRL",
      "balance": 5000.00,
      "category": "expense",
      "status": "POSTED"
    }
  ],
  "total": 150,
  "period": {
    "from": "2025-08-01",
    "to": "2025-09-30"
  },
  "persist": {                              // Se persist=true
    "imported": 150,
    "total": 150,
    "success": true
  }
}
```

**Comportamento:**
- Se `persist=true`, as transações são salvas na tabela `financial_transactions`
- Duplicatas são evitadas usando `pluggy_id` como chave única
- Se `itemId` for fornecido e persistir, atualiza `last_sync_at` do item

---

### 5. POST /api/pluggy/webhook

**Descrição:** Recebe notificações da Pluggy quando há atualizações em items/transações

**Método:** `POST`

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer <SYNC_SECRET_TOKEN>` (opcional, mas recomendado se configurado)

**Body:**
```json
{
  "event": "transactions.updated",          // ou "item.updated" ou "item.error"
  "itemId": "uuid-do-item",                 // ou "item": { "id": "uuid-do-item" }
  "data": { ... }
}
```

**Eventos Suportados:**

1. **transactions.updated** ou **item.updated**
   - Busca transações dos últimos 7 dias do item
   - Persiste novas transações no banco
   - Atualiza `last_sync_at` do item

2. **item.error**
   - Apenas registra o erro no log
   - Não busca transações

**Resposta:**
```json
{
  "success": true,
  "event": "transactions.updated",
  "itemId": "uuid-do-item",
  "imported": 25,
  "totalAvailable": 30,
  "period": "2025-11-03 a 2025-11-10"
}
```

**Segurança:**
- Se `SYNC_SECRET_TOKEN` estiver configurado, valida o token via header `Authorization: Bearer <token>`
- Sempre retorna 200 para evitar retentativas desnecessárias da Pluggy

---

## Estrutura do Banco de Dados

### Tabela: `pluggy_items`

Armazena conexões (items) da Pluggy associadas aos usuários.

```sql
CREATE TABLE pluggy_items (
  id uuid PRIMARY KEY,
  item_id text UNIQUE NOT NULL,        -- ID do item na Pluggy
  user_id uuid NOT NULL,                -- Referência ao usuário
  segment_id uuid,                     -- Referência ao segmento
  connector_id text,
  connector_name text,
  status varchar(50),                  -- UPDATING, UPDATED, LOGIN_ERROR, etc.
  execution_status varchar(50),        -- CREATED, PROCESSING, SUCCESS, ERROR
  error text,                          -- JSON string com detalhes do erro
  metadata jsonb DEFAULT '{}',
  last_sync_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

### Tabela: `financial_transactions`

Armazena transações financeiras importadas da Pluggy.

```sql
CREATE TABLE financial_transactions (
  id uuid PRIMARY KEY,
  pluggy_id text UNIQUE,               -- ID único da transação na Pluggy
  external_id text,                    -- Compatibilidade
  item_id text,                        -- ID do item (conexão) da Pluggy
  account_id text,                     -- ID da conta na Pluggy
  date date NOT NULL,
  description text,
  amount decimal(12,2) NOT NULL,
  type varchar(20),                    -- 'receita' ou 'despesa'
  direction varchar(20),               -- 'receivable' ou 'payable'
  category text,
  status varchar(50),
  institution text,
  balance decimal(12,2),
  segment_id uuid,
  raw jsonb,                          -- Dados brutos da transação
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

---

## Variáveis de Ambiente

```env
# Credenciais Pluggy
PLUGGY_CLIENT_ID=seu-client-id
PLUGGY_CLIENT_SECRET=seu-client-secret
PLUGGY_ENV=development  # ou production

# Opcional: URL base da API Pluggy
PLUGGY_API_BASE=https://api.pluggy.ai

# Opcional: TTL do cache da API Key (em segundos)
PLUGGY_X_API_KEY_CACHE_TTL=600

# Opcional: Token de segurança para webhooks
SYNC_SECRET_TOKEN=seu-token-secreto
```

---

## Fluxo de Uso Recomendado

### 1. Conectar Conta via Widget

```javascript
// 1. Criar connect token
const response = await fetch('/api/pluggy/connect-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    language: 'pt',
    country: 'BR'
  })
});

const { connectToken } = await response.json();

// 2. Usar o token no Pluggy Connect Widget
// (implementação do widget no frontend)
```

### 2. Registrar Item após Conexão

```javascript
// Após o widget retornar o itemId
const response = await fetch('/api/pluggy/items', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    connector: 'bradesco',
    credentials: { /* credenciais */ },
    userId: 'uuid-do-usuario',
    segmentId: 'uuid-do-segmento',
    startSync: true  // Inicia sincronização automática
  })
});
```

### 3. Buscar Transações Manualmente

```javascript
const response = await fetch(
  '/api/pluggy/transactions?item_id=abc123&persist=true',
  { method: 'GET' }
);

const { transactions, persist } = await response.json();
```

### 4. Configurar Webhook

Configure o webhook na Pluggy para apontar para:
```
https://seu-dominio.com/api/pluggy/webhook
```

Com eventos:
- `transactions.updated`
- `item.updated`
- `item.error`

---

## Tratamento de Erros

Todas as rotas retornam erros no formato:

```json
{
  "success": false,
  "error": "Mensagem de erro descritiva"
}
```

Códigos de status HTTP:
- `200`: Sucesso
- `400`: Erro de validação (parâmetros inválidos)
- `401`: Não autorizado (token inválido ou ausente)
- `404`: Recurso não encontrado
- `500`: Erro interno do servidor

---

## Notas Importantes

1. **API Key:** A API Key é obtida automaticamente e cacheada em memória. Não é necessário chamar `/api/pluggy/auth` manualmente na maioria dos casos.

2. **Duplicatas:** As transações são identificadas unicamente por `pluggy_id`. O sistema evita duplicatas automaticamente.

3. **Sincronização:** A sincronização automática busca transações dos últimos 30 dias por padrão. Use parâmetros `dateFrom` e `dateTo` para períodos customizados.

4. **Webhooks:** Sempre retornam 200 para evitar retentativas desnecessárias da Pluggy, mesmo em caso de erro interno.

5. **Segmentação:** As transações podem ser vinculadas a segmentos através do `segmentId` fornecido no item ou obtido do usuário.

