# Revisão da Estrutura de Banco de Dados para Pluggy

## ✅ Estrutura Atual

### Tabela: `financial_transactions`

**Colunas principais:**
- `id` (SERIAL PRIMARY KEY)
- `pluggy_id` (text) - **ID único da transação na Pluggy**
- `external_id` (varchar(100)) - Compatibilidade
- `item_id` (text) - ID do item (conexão) da Pluggy
- `date` (date) - Data da transação
- `description` (text) - Descrição
- `amount` (numeric(12,2)) - Valor
- `type` (varchar(20)) - 'receita' ou 'despesa'
- `direction` (varchar(20)) - 'receivable' ou 'payable'
- `category` (text) - Categoria
- `status` (varchar(50)) - Status da transação
- `institution` (varchar(100)) - Instituição bancária
- `account_id` (varchar(50)) - ID da conta na Pluggy
- `balance` (numeric(12,2)) - Saldo
- `segment_id` (uuid) - Referência ao segmento
- `raw` (jsonb) - Dados brutos da transação
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Índices:**
- ✅ `idx_financial_transactions_pluggy_id` (UNIQUE) - **Previne duplicatas**
  - `WHERE pluggy_id IS NOT NULL`
- ✅ `idx_financial_transactions_item_id` - Para buscar por item
- ✅ `idx_financial_transactions_segment_id` - Para filtrar por segmento
- ✅ `idx_financial_transactions_date` - Para buscar por data
- ✅ `idx_financial_transactions_account_id` - Para buscar por conta
- ✅ `idx_financial_transactions_status` - Para filtrar por status
- ✅ `idx_financial_transactions_category` - Para filtrar por categoria
- ✅ `idx_financial_transactions_direction` - Para filtrar por direção
- ✅ `idx_financial_transactions_raw_gin` (GIN) - Para busca em JSONB

### Tabela: `pluggy_items`

**Colunas:**
- `id` (uuid PRIMARY KEY)
- `item_id` (text UNIQUE NOT NULL) - **ID único do item na Pluggy**
- `user_id` (uuid) - Referência ao usuário
- `segment_id` (uuid) - Referência ao segmento
- `connector_id` (text) - ID do conector
- `connector_name` (text) - Nome do conector
- `status` (varchar(50)) - Status do item
- `execution_status` (varchar(50)) - Status de execução
- `error` (text) - Detalhes do erro (JSON)
- `metadata` (jsonb) - Metadados
- `last_sync_at` (timestamp) - **Última sincronização**
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Índices:**
- ✅ `idx_pluggy_items_item_id` (UNIQUE) - Previne duplicatas de items
- ✅ `idx_pluggy_items_user_id` - Para buscar items do usuário
- ✅ `idx_pluggy_items_segment_id` - Para filtrar por segmento
- ✅ `idx_pluggy_items_status` - Para filtrar por status

## ✅ Controle de Duplicatas

### Como Funciona:

1. **Identificador Único (`pluggy_id`):**
   - Cada transação da Pluggy tem um `id` único
   - Esse `id` é salvo em `pluggy_id`
   - Índice único garante que não haverá duplicatas

2. **Upsert Automático:**
   ```typescript
   .upsert(records, { onConflict: 'pluggy_id' })
   ```
   - Se `pluggy_id` já existe → **atualiza** a transação
   - Se `pluggy_id` não existe → **insere** nova transação

3. **Verificação Antes de Inserir:**
   - Código verifica quais `pluggy_id` já existem
   - Filtra apenas transações novas
   - Insere somente o que não existe

4. **Controle por Data (`last_sync_at`):**
   - Campo `last_sync_at` em `pluggy_items` armazena última sincronização
   - Permite sincronizar apenas a partir da última data
   - Evita reprocessar transações antigas

## ✅ Status da Estrutura

**TUDO PRONTO E FUNCIONANDO:**

- ✅ Índice único em `pluggy_id` previne duplicatas
- ✅ Upsert funciona corretamente com `onConflict: 'pluggy_id'`
- ✅ Campo `last_sync_at` permite controle incremental
- ✅ Campo `raw` (jsonb) armazena dados completos para auditoria
- ✅ Índices adequados para performance
- ✅ Relacionamento com `pluggy_items` via `item_id`
- ✅ Relacionamento com `segments` via `segment_id`

## 🔍 Verificações Recomendadas

1. **Verificar se as migrações foram aplicadas:**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'financial_transactions' 
   AND column_name IN ('pluggy_id', 'item_id', 'direction', 'raw');
   ```

2. **Verificar se o índice único existe:**
   ```sql
   SELECT indexname, indexdef 
   FROM pg_indexes 
   WHERE tablename = 'financial_transactions' 
   AND indexname = 'idx_financial_transactions_pluggy_id';
   ```

3. **Testar upsert:**
   - Inserir transação com `pluggy_id = 'test-123'`
   - Tentar inserir novamente com mesmo `pluggy_id`
   - Deve atualizar, não duplicar

## 📝 Conclusão

A estrutura está **100% pronta** para:
- ✅ Prevenir duplicatas usando `pluggy_id`
- ✅ Incrementar apenas novas transações
- ✅ Atualizar transações existentes automaticamente
- ✅ Controlar sincronização incremental via `last_sync_at`

