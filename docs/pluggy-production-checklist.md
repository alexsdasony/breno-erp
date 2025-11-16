# ✅ Checklist Pré-Produção - Integração Pluggy

## 📋 Checklist Completo

### 1. Variáveis de Ambiente

- [ ] `PLUGGY_CLIENT_ID` - Client ID da Pluggy (obrigatório)
- [ ] `PLUGGY_CLIENT_SECRET` - Client Secret da Pluggy (obrigatório)
- [ ] `PLUGGY_ENV` - Ambiente: `sandbox` ou `production` (opcional, padrão: production)
- [ ] `SYNC_SECRET_TOKEN` - Token para proteger webhook (recomendado)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - URL do Supabase
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Chave de serviço do Supabase

**Como verificar:**
```bash
node scripts/validate-pluggy-production.ts
```

### 2. Estrutura do Banco de Dados

- [ ] Tabela `financial_transactions` existe
- [ ] Coluna `pluggy_id` existe e tem índice único
- [ ] Colunas necessárias: `item_id`, `direction`, `raw`, `status`, `category`
- [ ] Tabela `pluggy_items` existe
- [ ] Índices criados corretamente

**Como verificar:**
```sql
-- Verificar estrutura
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'financial_transactions' 
AND column_name IN ('pluggy_id', 'item_id', 'direction', 'raw');

-- Verificar índice único
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'financial_transactions' 
AND indexname = 'idx_financial_transactions_pluggy_id';
```

### 3. Rotas da API

- [ ] `POST /api/pluggy/auth` - Obtém API Key
- [ ] `POST /api/pluggy/connect-token` - Cria Connect Token
- [ ] `GET /api/pluggy/connect-token` - Cria Connect Token (GET para testes)
- [ ] `POST /api/pluggy/items` - Cria item e sincroniza
- [ ] `POST /api/pluggy/items/save` - Salva item no banco
- [ ] `GET /api/pluggy/transactions` - Busca transações
- [ ] `POST /api/pluggy/webhook` - Recebe webhooks da Pluggy

**Como testar:**
```bash
# Testar connect-token
curl -X GET http://localhost:3000/api/pluggy/connect-token

# Deve retornar:
# {
#   "success": true,
#   "connectToken": "eyJhbGci..."
# }
```

### 4. Widget Pluggy Connect

- [ ] Script CDN carregando: `https://cdn.pluggy.ai/pluggy-connect.js`
- [ ] Componente `PluggyConnectButton` existe
- [ ] Widget abre corretamente ao clicar no botão
- [ ] Callbacks `onSuccess` e `onError` funcionam
- [ ] Item é salvo no banco após conexão

**Como testar:**
1. Acesse `/financial`
2. Clique em "Conectar Conta Bancária"
3. Widget deve abrir
4. Complete a conexão
5. Verifique se item foi salvo no banco

### 5. Sincronização de Transações

- [ ] Transações são importadas corretamente
- [ ] Duplicatas são prevenidas (usando `pluggy_id`)
- [ ] Apenas novas transações são inseridas
- [ ] Transações existentes são atualizadas

**Como testar:**
```bash
# Sincronizar transações de um item
curl -X GET "http://localhost:3000/api/pluggy/transactions?item_id=ITEM_ID&persist=true"
```

### 6. Webhook (Opcional mas Recomendado)

- [ ] URL do webhook configurada na Pluggy Dashboard
- [ ] `SYNC_SECRET_TOKEN` configurado
- [ ] Webhook recebe eventos `transactions.updated` e `item.updated`
- [ ] Transações são sincronizadas automaticamente via webhook

**Como configurar:**
1. Acesse Pluggy Dashboard
2. Configure webhook URL: `https://seu-dominio.com/api/pluggy/webhook`
3. Adicione header: `Authorization: Bearer SEU_SYNC_SECRET_TOKEN`
4. Selecione eventos: `transactions.updated`, `item.updated`, `item.error`

### 7. Segurança

- [ ] `PLUGGY_CLIENT_SECRET` não está exposto no frontend
- [ ] `SYNC_SECRET_TOKEN` configurado para webhook
- [ ] Rotas protegidas quando necessário
- [ ] Validação de `userId` nas rotas

### 8. Tratamento de Erros

- [ ] Erros de autenticação são tratados
- [ ] Erros de conexão são tratados
- [ ] Expiração de token é tratada
- [ ] Usuário é notificado de erros

### 9. Logs e Monitoramento

- [ ] Logs de sucesso estão sendo gerados
- [ ] Logs de erro estão sendo gerados
- [ ] Métricas de sincronização disponíveis

### 10. Testes Finais

- [ ] Conectar uma conta bancária (teste completo)
- [ ] Sincronizar transações manualmente
- [ ] Verificar se duplicatas não são criadas
- [ ] Testar reconexão após expiração

## 🚀 Script de Validação Automática

Execute o script de validação:

```bash
# Instalar dependências se necessário
npm install tsx dotenv

# Executar validação
npx tsx scripts/validate-pluggy-production.ts
```

## 📝 Notas Importantes

1. **Ambiente Sandbox vs Production:**
   - Use `sandbox` para testes
   - Use `production` para ambiente real
   - Configure `PLUGGY_ENV` adequadamente

2. **Webhook em Produção:**
   - URL deve ser acessível publicamente
   - Use HTTPS
   - Configure `SYNC_SECRET_TOKEN` para segurança

3. **Rate Limits:**
   - Pluggy tem limites de requisições
   - Implemente retry logic se necessário
   - Monitore uso da API

4. **Expiração de Tokens:**
   - Connect Tokens expiram rapidamente
   - API Keys são válidas por mais tempo
   - Implemente refresh quando necessário

## ✅ Pronto para Produção?

Após completar todos os itens acima e executar o script de validação sem erros críticos, você está pronto para produção!

