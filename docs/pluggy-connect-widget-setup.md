# Pluggy Connect Widget - Guia de Implementação

Este documento descreve a implementação do Pluggy Connect Widget no projeto.

## ✅ O que foi implementado

### 1. Rota Backend - POST/GET /api/pluggy/connect-token

**Arquivo:** `app/api/pluggy/connect-token/route.ts`

A rota foi atualizada para fazer chamadas diretas à API Pluggy:

- **POST**: Cria connect token com parâmetros customizados
- **GET**: Cria connect token com parâmetros padrão (útil para testes)

**Fluxo:**
1. Obtém API Key da Pluggy usando `PLUGGY_CLIENT_ID` e `PLUGGY_CLIENT_SECRET`
2. Usa a API Key para criar um Connect Token
3. Retorna o Connect Token para o frontend

**Exemplo de uso:**
```typescript
// GET (simples)
const res = await fetch('/api/pluggy/connect-token');
const { connectToken } = await res.json();

// POST (com parâmetros)
const res = await fetch('/api/pluggy/connect-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    language: 'pt',
    country: 'BR',
    institution: 'bradesco'
  })
});
const { connectToken } = await res.json();
```

---

### 2. Componente Frontend - PluggyConnectButton

**Arquivo:** `src/components/pluggy/PluggyConnectButton.tsx`

Componente React que:
- Carrega o script do Pluggy Connect Widget via CDN
- Obtém o Connect Token do backend
- Inicializa o widget Pluggy
- Salva o item conectado no banco de dados automaticamente

**Características:**
- ✅ Carregamento automático do script Pluggy
- ✅ Tratamento de erros com toast notifications
- ✅ Estado de loading durante conexão
- ✅ Salvamento automático do item no banco após sucesso
- ✅ Callbacks opcionais para `onSuccess` e `onError`

**Uso:**
```tsx
import PluggyConnectButton from '@/components/pluggy/PluggyConnectButton';

<PluggyConnectButton 
  onSuccess={(itemId) => {
    console.log('Conta conectada:', itemId);
    // Recarregar dados, etc.
  }}
  onError={(error) => {
    console.error('Erro:', error);
  }}
/>
```

---

### 3. Integração na Página Financeira

**Arquivo:** `app/(admin)/financial/_components/FinancialView.tsx`

O botão Pluggy foi adicionado no cabeçalho da página financeira, ao lado dos outros botões de ação.

**Comportamento:**
- Quando uma conta é conectada com sucesso, os dados financeiros são recarregados automaticamente
- O item é salvo no banco de dados através da rota `/api/pluggy/items/save`

---

## 🔧 Como funciona

### Fluxo completo:

1. **Usuário clica no botão "Conectar Conta Bancária"**
   - O componente `PluggyConnectButton` é renderizado

2. **Carregamento do Widget**
   - O script do Pluggy Connect é carregado via CDN (`https://cdn.pluggy.ai/connect/v1/pluggy-connect.js`)
   - O script expõe `window.PluggyConnect` globalmente

3. **Obtenção do Connect Token**
   - Frontend faz requisição GET para `/api/pluggy/connect-token`
   - Backend obtém API Key da Pluggy
   - Backend cria Connect Token usando a API Key
   - Connect Token é retornado ao frontend

4. **Inicialização do Widget**
   - `PluggyConnect.init()` é chamado com o Connect Token
   - Widget Pluggy é aberto em modal/iframe
   - Usuário seleciona banco e insere credenciais

5. **Sucesso**
   - Widget retorna `item.id` via callback `onSuccess`
   - Frontend salva o item no banco via `/api/pluggy/items/save`
   - Dados financeiros são recarregados
   - Toast de sucesso é exibido

---

## 📋 Variáveis de Ambiente Necessárias

Certifique-se de ter configurado no `.env.local`:

```env
PLUGGY_CLIENT_ID=seu-client-id
PLUGGY_CLIENT_SECRET=seu-client-secret
PLUGGY_ENV=development  # ou production
```

---

## 🧪 Testando

### 1. Testar a rota diretamente:

```bash
# GET (simples)
curl http://localhost:3000/api/pluggy/connect-token

# POST (com parâmetros)
curl -X POST http://localhost:3000/api/pluggy/connect-token \
  -H "Content-Type: application/json" \
  -d '{"language": "pt", "country": "BR"}'
```

### 2. Testar no frontend:

1. Acesse a página Financeiro (`/financial`)
2. Clique no botão "Conectar Conta Bancária"
3. O widget Pluggy deve abrir
4. Selecione um banco e insira credenciais de teste
5. Após conectar, o item deve ser salvo automaticamente

---

## 🔍 Verificação Rápida

Para verificar se a API está funcionando corretamente, você pode testar diretamente a API Pluggy:

```bash
# 1. Obter API Key
curl -X POST https://api.pluggy.ai/auth \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "SEU_CLIENT_ID",
    "clientSecret": "SEU_CLIENT_SECRET"
  }'

# 2. Usar a API Key para criar Connect Token
curl -X POST https://api.pluggy.ai/connect_token \
  -H "x-api-key: SUA_API_KEY_AQUI" \
  -H "Content-Type: application/json" \
  -d '{"language": "pt"}'
```

Se isso funcionar, a rota `/api/pluggy/connect-token` também deve funcionar.

---

## 📝 Notas Importantes

1. **Script CDN**: O widget Pluggy é carregado via script tag, não via npm package (não existe `@pluggy/connect` no npm)

2. **Segurança**: O Connect Token é gerado no servidor, nunca no cliente. As credenciais da Pluggy (`CLIENT_ID` e `CLIENT_SECRET`) nunca são expostas ao frontend.

3. **Salvamento Automático**: Após conectar uma conta, o item é automaticamente salvo no banco através da rota `/api/pluggy/items/save`. Se houver erro no salvamento, não é crítico - o item já foi criado na Pluggy.

4. **Widget Modal**: O widget Pluggy abre em um modal/iframe próprio. Não é necessário criar um modal customizado.

---

## 🚀 Próximos Passos

Após conectar uma conta:

1. **Sincronizar Transações**: Use a rota `/api/pluggy/transactions?item_id=XXX&persist=true` para buscar e salvar transações

2. **Configurar Webhook**: Configure o webhook na Pluggy para receber atualizações automáticas:
   - URL: `https://seu-dominio.com/api/pluggy/webhook`
   - Eventos: `transactions.updated`, `item.updated`, `item.error`

3. **Listar Items Conectados**: Use `/api/pluggy/items/user?userId=XXX` para listar todas as contas conectadas de um usuário

---

## 📚 Referências

- [Documentação Pluggy](https://docs.pluggy.ai/)
- [Pluggy Connect Widget](https://docs.pluggy.ai/docs/connect-widget)
- [API Pluggy - Connect Token](https://docs.pluggy.ai/reference/create-connect-token)

