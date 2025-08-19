# LEIS DO REPOSITÓRIO — BRENO ERP (Padrão Next.js App Router)

Este documento é a constituição do projeto. Mudou aqui, mudou o mundo. Qualquer PR que viole estas leis deve ser rejeitado.

## 1) Roteamento & Grupos
- **App Router** obrigatório: tudo em `app/`.
- **Route Groups** (pastas entre parênteses) servem para organização, layout e guards sem afetar a URL.
  - Grupo oficial da área logada: **`(admin)`**.
  - Exemplos:
    - `app/(admin)/suppliers/page.tsx` → rota `/suppliers`
    - `app/(admin)/products/page.tsx` → rota `/products`
- Não criar grupos por estética. Criar grupo **apenas** quando houver layout/guard/infra comum.
- **Login/registro** ficam fora de `(admin)` (ex.: `app/login/page.tsx`).

## 2) Layouts & Autenticação
- O grupo `(admin)` contém `layout.(ts|js)x` com guard de autenticação.
- Preferência: **Server Component** para validação de sessão (sem flicker). Se usar client guard, nunca renderizar conteúdo protegido antes de validar.
- Páginas públicas (login/register/forgot) **não** herdam o layout de `(admin)`.

## 3) Estrutura de Diretórios (organização por domínio)
app/
(admin)/
suppliers/page.tsx
customers/page.tsx
products/page.tsx
segments/page.tsx
login/page.tsx
register/page.tsx
src/
modules/
Suppliers/
Module.(tsx|jsx)
components/
SupplierForm.(tsx|jsx)
SupplierTable.(tsx|jsx)
hooks/
usePartners.(tsx|jsx)
services/ (opcional se houver particularidades além do service compartilhado)
Customers/
Module.(tsx|jsx)
components/
hooks/
usePartners.(tsx|jsx) ← compartilhado com Suppliers (se for compartilhado, mover para src/modules/Partners/)
Products/
Module.(tsx|jsx)
components/
hooks/
useProducts.(tsx|jsx)
Segments/
Module.(tsx|jsx)
components/
hooks/
useSegments.(tsx|jsx)
services/
api.(ts|js) ← base HTTP (headers, baseURL)
partnersService.(ts|js) ← CRUD parceiros (role=customer|supplier)
productsService.(ts|js)
segmentsService.(ts|js)
hooks/
useAppData.(ts|js)x ← MAGRO: user, activeSegmentId, feature flags, eventos globais
useAuth.(ts|js)x ← se separado de AppData
components/
ui/ ← componentes realmente globais (Button, Modal, Input, Toast)
layouts/
ErpLayout.(tsx|jsx)
lib/ ← utilidades puras (formatters, helpers)
utils/ ← funções auxiliares não-React
supabase/
functions/ ← Edge Functions (contratos de API)
schemas/ ← schema SQL / migrações

markdown
Copiar
Editar

## 4) Hooks & Services
- Nenhum componente chama `api` direto. Sempre via **service** do domínio, consumido pelo **hook** do domínio.
- Hooks de domínio expõem `list/create/update/delete` e estados (loading/erro), encapsulando toast quando fizer sentido.
- `useAppData` não é hub de CRUD. Ele só guarda **estado global** (usuário, segmento ativo) e eventos/flags globais.

## 5) Config & Variáveis
- **Base URL**: `process.env.NEXT_PUBLIC_API_BASE_URL` com fallback para `/functions/v1` do Supabase.
- **Nada** de hardcode de URL em componente. Só em `src/services/api`.
- Types/JSdoc opcionais para documentar contratos de service, mas **sem** libs de schema/validação obrigatórias.

## 6) Clean Code & Dead Code
- Proibido manter versões antigas/duplicadas após migração (`*Refactored`, `useCrud`, etc.).
- Antes de merge:
  - Rodar análise de imports e remover arquivos não referenciados.
  - Confirmar que nenhum componente importa `api` direto.
  - Confirmar que toasts usam `components/ui/use-toast`.

## 7) Contratos de API (Edge Functions)
- Contrato estável:
  - List: `{ items: [...] }` (ou `{ partners: [...] }` se já consolidado)
  - Create/Update: `{ item: {...} }` (ou `{ partner: {...} }`)
  - Delete: `{ success: true }`
- Rotas com `/:id` detectadas por **regex** no pathname (nunca por heurística de tamanho de string).

## 8) Critérios de Aceite (por domínio)
- Create → aparece na lista (sem reload manual).
- Update → valores persistem e UI reflete.
- Delete → item some + toast (variant `destructive`).
- Nenhum import de `useCrud`/legado.
- Páginas do domínio acessíveis em `/suppliers`, `/customers`, `/products`, `/segments` sob `(admin)`.

## 9) Padrões de UI/UX
- Componentes globais em `components/ui/*` (inputs, modals, toasts) — reutilizáveis e sem lógica de domínio.
- Módulo controla sua UI local (forms, tabelas) dentro de `modules/<Domínio>/components/`.

---

**PS:** Se tiver dúvida, este arquivo manda mais do que preferência pessoal. Divergiu daqui? Abre PR explicando por que e como. 