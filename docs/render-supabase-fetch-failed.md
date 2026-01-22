# TypeError: fetch failed — Render + Supabase

## Problema

Ao fazer login ou usar o sistema no **ambiente remoto (Render)**, as rotas de API que usam o Supabase (ex.: `/api/suppliers`) falham com:

```
TypeError: fetch failed
  at node:internal/deps/undici/undici:...
```

Isso ocorre quando o **fetch** do Node (undici) não consegue conectar ao Supabase (REST API). A causa real costuma vir em `error.cause` (ex.: `ECONNRESET`, `ECONNREFUSED`, `ENETUNREACH`, `ETIMEDOUT`).

---

## O que foi feito no código

1. **`src/lib/supabaseAdmin.ts`**
   - Fetch customizado com **timeout de 25s** e **1 retry** (delay 2s) em erros de rede.
   - Log de `error.cause` nos erros de fetch para diagnóstico.

2. **`/api/suppliers` e demais rotas que usam Supabase**
   - Log melhorado com `error.cause` quando o Supabase retorna erro.

3. **`GET /api/debug/supabase-env`**
   - Verifica se `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` estão definidas.
   - Faz um **fetch de teste** ao Supabase e retorna `connectivity: { ok, errorCause, ... }`.
   - Use no Render para confirmar variáveis e conectividade.

---

## Checklist — Render + Supabase

### 1. Variáveis de ambiente no Render

No serviço do Render → **Environment**:

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Sim | URL do projeto (ex.: `https://xxx.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Sim | Chave **service_role** (Settings → API no Supabase) |

- Sem espaços ou quebras de linha no valor.
- Após alterar: **Manual Deploy** (não só Restart) e aguardar 2–5 min.

### 2. Rede no Supabase

Supabase Dashboard → **Project Settings** → **Database** → **Network**:

- Se **Restrict connections** estiver ativo, os IPs do Render precisam estar na lista.
- O Render **não** fornece IPs fixos; o usual é **Allow all** (ou desativar restrição) para o projeto.

### 3. Testar no ambiente remoto

Após o deploy:

```
https://<seu-dominio-render>.onrender.com/api/debug/supabase-env
```

ou, se tiver domínio customizado:

```
https://www.seudominio.com/api/debug/supabase-env
```

Verifique:

- `environment.hasUrl` e `environment.hasKey` = `true`
- `connectivity.ok` = `true`
- Se `connectivity.ok` = `false`, use `connectivity.errorCause` e `connectivity.errorCode` para ver a causa (ex.: `ECONNRESET`, `ECONNREFUSED`).

### 4. Logs no Render

Nos **Logs** do serviço, procure:

- `🔍 SupabaseAdmin - Verificando variáveis` → confirma que o módulo carregou.
- `❌ Supabase fetch failed` / `❌ cause (diagnóstico rede)` → mostram a causa do fetch.

### 5. Reinício / redeploy

Sempre que mudar variáveis de ambiente:

1. **Manual Deploy** → **Deploy latest commit**.
2. Aguardar o deploy terminar.
3. Testar de novo `/api/debug/supabase-env` e o login.

---

## Causas comuns do `fetch failed`

| Cause / sintoma | O que fazer |
|-----------------|-------------|
| `ECONNREFUSED` | URL errada ou Supabase inacessível; confira `NEXT_PUBLIC_SUPABASE_URL` e rede. |
| `ECONNRESET` | Conexão fechada pelo servidor; pode ser rede/firewall; tente **Allow all** no Supabase. |
| `ENETUNREACH` | Rede inacessível (ex.: IPv6); em último caso, testar outra versão do Node. |
| `ETIMEDOUT` | Timeout; o fetch customizado usa 25s + 1 retry; cold start do Render pode atrasar a primeira requisição. |
| Variáveis ausentes | `NEXT_PUBLIC_SUPABASE_URL` ou `SUPABASE_SERVICE_ROLE_KEY` não definidas no Render; conferir Environment e redeploy. |

---

## Resumo rápido

1. Definir `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` no Render.
2. Supabase → Database → Network: **Allow all** (ou incluir IPs se usar restrição).
3. **Manual Deploy** após mudar env.
4. Abrir `/api/debug/supabase-env` e checar `connectivity.ok` e `errorCause`.
5. Usar os logs do Render (`❌ cause`) se ainda falhar.
