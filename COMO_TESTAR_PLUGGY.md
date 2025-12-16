# 🧪 Como Testar a Integração Pluggy

## 📋 Situação Atual

Você tem **3 contas conectadas na Pluggy**:
- Banco do Brasil Empresas
- Bradesco Empresas  
- Inter Empresas

Mas essas contas **não estão salvas no banco do ERP**.

---

## ✅ TESTE 1: Verificar Status Completo

Execute o script de teste:

```bash
node scripts/test-pluggy.js
```

Isso mostra:
- ✅ Se autenticação está OK
- ✅ Quantos itens estão no banco
- ✅ Status de cada item na Pluggy
- ✅ Quantas transações estão disponíveis
- ✅ Quantas transações estão no banco
- ✅ Se webhook está configurado

---

## ✅ TESTE 2: Testar Interface no ERP

### 2.1. Conectar Nova Conta (Teste Completo)

1. Acesse o ERP → Menu **Financeiro**
2. Clique em **"Conectar Conta Bancária"**
3. Selecione um banco (ex: Banco do Brasil)
4. Preencha as credenciais
5. Aguarde a conexão

**O que deve acontecer:**
- ✅ Widget Pluggy abre
- ✅ Você preenche credenciais
- ✅ Conexão é estabelecida
- ✅ Item é salvo automaticamente no banco
- ✅ Toast de sucesso aparece

### 2.2. Verificar se Item Foi Salvo

Após conectar, execute:

```bash
node scripts/test-pluggy.js
```

Deve mostrar o item recém-conectado.

---

## ✅ TESTE 3: Testar Sincronização Manual

### 3.1. Sincronizar Transações

```bash
npm run pluggy:cron
```

Ou execute diretamente:

```bash
node scripts/pluggy-sync-cron.js
```

**O que faz:**
- Busca transações dos últimos 30 dias
- Salva no banco de dados
- Evita duplicatas

### 3.2. Verificar Transações no ERP

1. Acesse Menu **Financeiro**
2. Verifique se as transações aparecem na tabela
3. Filtre por segmento/banco se necessário

---

## ✅ TESTE 4: Testar Webhook (Sincronização Automática)

### 4.1. Configurar Webhook

1. Acesse: https://dashboard.pluggy.ai
2. Settings → Webhooks → Add Webhook
3. URL: `https://www.rdsinvestimentos.com/api/pluggy/webhook`
4. Evento: `item/updated` ou `transactions/updated`
5. Salve

### 4.2. Testar Webhook Manualmente

Envie um teste para o endpoint:

```bash
curl -X POST https://www.rdsinvestimentos.com/api/pluggy/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "transactions/updated",
    "itemId": "SEU_ITEM_ID_AQUI"
  }'
```

**O que deve acontecer:**
- ✅ Webhook recebe a requisição
- ✅ Busca transações do item
- ✅ Salva no banco
- ✅ Retorna sucesso

---

## ✅ TESTE 5: Verificar Dados no Banco

### 5.1. Ver Itens Conectados

```sql
SELECT 
  item_id,
  connector_name,
  status,
  execution_status,
  last_sync_at,
  created_at
FROM pluggy_items
ORDER BY created_at DESC;
```

### 5.2. Ver Transações Sincronizadas

```sql
SELECT 
  COUNT(*) as total,
  MIN(date) as primeira,
  MAX(date) as ultima,
  SUM(amount) as total_valor
FROM financial_transactions
WHERE item_id IS NOT NULL;
```

### 5.3. Ver Transações por Banco

```sql
SELECT 
  pi.connector_name,
  COUNT(ft.id) as transacoes,
  SUM(ft.amount) as total
FROM financial_transactions ft
JOIN pluggy_items pi ON ft.item_id = pi.item_id
GROUP BY pi.connector_name;
```

---

## 🎯 CHECKLIST DE TESTES

### Interface (Frontend)
- [ ] Botão "Conectar Conta Bancária" aparece
- [ ] Widget Pluggy abre corretamente
- [ ] Conexão é estabelecida com sucesso
- [ ] Toast de sucesso aparece
- [ ] Item é salvo no banco

### Sincronização
- [ ] Transações são buscadas da Pluggy
- [ ] Transações são salvas no banco
- [ ] Duplicatas são evitadas
- [ ] Transações aparecem no menu Financeiro

### Webhook
- [ ] Webhook está configurado
- [ ] Webhook recebe notificações
- [ ] Sincronização automática funciona

---

## 🔍 COMANDOS ÚTEIS

### Ver status completo
```bash
node scripts/test-pluggy.js
```

### Sincronizar manualmente
```bash
npm run pluggy:cron
```

### Verificar logs do servidor
```bash
# No Render, vá em Logs
# Ou localmente, veja o console do servidor Next.js
```

---

## 💡 DICAS

1. **Sempre reconecte as contas** pelo ERP para salvar os itens no banco
2. **Configure o webhook** para sincronização automática
3. **Execute o teste** após cada mudança para verificar
4. **Verifique os logs** se algo não funcionar

---

## 🚨 PROBLEMAS COMUNS

### "Nenhum item encontrado no banco"
→ Reconecte as contas pelo menu Financeiro

### "Transações não aparecem"
→ Execute sincronização manual: `npm run pluggy:cron`

### "Webhook não funciona"
→ Configure via dashboard da Pluggy (mais confiável)

### "Erro 401/403"
→ Verifique credenciais no Render

---

**Execute `node scripts/test-pluggy.js` sempre que quiser verificar o status completo!**


