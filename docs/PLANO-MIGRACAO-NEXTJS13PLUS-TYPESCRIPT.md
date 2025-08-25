# Plano de Migração para Next.js 13+ com TypeScript

Este documento consolida o plano de reestruturação e padronização do projeto para o padrão Next.js 13+ (App Router) com tipagem forte em TypeScript, organização por rotas e remoção gradual de `src/modules/` a cada módulo migrado.

## Objetivos
- **Tipagem forte** em todo o frontend (hooks, services, componentes e contextos onde aplicável).
- **App Router**: mover módulos para `src/app/(admin)/<rota>/` com `_hooks` e `_components` por rota.
- **Padronização de hooks**: paginação (`page`, `hasMore`, `loadMore`), CRUD (`load`, `create`, `update`, `remove`), toasts e tratamento de erros.
- **Mapeamento consistente** camelCase → snake_case nos services/`apiService` (já padronizado).
- **Limpeza**: apagar código legado por módulo após migração, até remover `src/modules/` por completo.

## Escopo
- Pastas analisadas: `src/components/`, `src/config/`, `src/contexts/`, `src/hooks/`, `src/lib/`, `src/services/`, `src/modules/`.
- Backend: Supabase Edge Functions já corrigidas para CORS e alinhadas ao mapeamento snake_case.

## Estratégia de Tipagem (TypeScript)
- Criar diretório `src/types/` com **um arquivo por entidade** e um barrel `index.ts` para facilitar imports via `@/types`.
- Padrão por entidade:
  - Tipo de domínio (camelCase) para uso no frontend.
  - Tipo de payload (snake_case) para requests/responses do backend.
  - Tipos utilitários globais (paginação, respostas padronizadas, timestamps).

### Estrutura sugerida em `src/types/`
- Entidades principais:
  - `Segment.ts`
  - `Partner.ts`
  - `Customer.ts`
  - `Product.ts`
  - `Sale.ts` e `SaleItem.ts`
  - `Billing.ts`
  - `NFe.ts`
  - `AccountPayable.ts`
  - `CostCenter.ts`
  - `Transaction.ts`
  - `User.ts`
  - `Integration.ts`
  - `Metrics.ts`
- Utilitários:
  - `common.ts` (PaginationParams, PaginatedResponse, Timestamped, ID)
  - `index.ts` (barrel para exports)

### Padrões a manter
- Mapeamento camelCase → snake_case no `apiService` e nos services dedicados.
- `parseFloat`/`parseInt` para numéricos conforme necessário.
- Respeitar os tipos e fallback (`|| null`, `|| 0`) definidos nas entidades quando aplicável.

## Progresso
- ✅ Segments migrado: `src/services/segmentsService.ts`, `app/(admin)/segments/_hooks/useSegments.ts`, integração com `apiService` concluída.
- ✅ NFe migrado: `src/services/nfeService.ts`, `app/(admin)/nfe/_hooks/useNFe.ts`, `app/(admin)/nfe/_components/NFeView.tsx`, `app/(admin)/nfe/page.js` atualizado.
- ✅ Limpeza final concluída: removido `src/modules/` e eliminadas referências a `@/modules/*` em todo o código.

## Sequência de Migração por Módulo
A cada módulo:
1) Criar `_hooks` e `_components` dentro da rota em `app/(admin)/<rota>/` usando TypeScript.
2) Integrar o `page` da rota com o novo hook.
3) Converter services `.js` → `.ts` do módulo (se ainda não foram).
4) Atualizar imports.
5) Remover arquivos legados em `src/modules/<Modulo>/` e hooks antigos em `src/hooks/` que ficarem obsoletos.

Ordem proposta (do mais crítico ao menos crítico):
1. **Segments** — migrado ✅; remover ponte de `src/modules/Segments/` (se houver) na etapa de limpeza final.
2. **Customers (inclui Partners)** — mover para `app/(admin)/customers/`; criar `_hooks/usePartners.ts`; Suppliers reutiliza.
3. **Products (Inventory)** — `app/(admin)/inventory/`; `_hooks/useProducts.ts`.
4. **Sales** — `app/(admin)/sales/`; `_hooks/useSales.ts`.
5. **Billings** — `app/(admin)/billing/`; `_hooks/useBillings.ts`.
6. **NFe** — migrado ✅ para `app/(admin)/nfe/` com hook/serviço/componentes em TS.
7. **Accounts Payable** — `app/(admin)/accounts-payable/`; reutilizar hooks/serviços financeiros quando aplicável.
8. **Cost Centers** — `app/(admin)/cost-centers/`; `_hooks/useCostCenters.ts`.
9. **Chart of Accounts** — `app/(admin)/chart-of-accounts/`; `_hooks/useChartOfAccounts.ts`.
10. **Financial** — `app/(admin)/financial/`; `_hooks/useFinancialDocuments.ts`.
11. **Integrations** — `app/(admin)/integrations/`.
12. **Dashboard** — confirmar `_components` e consolidar em `app/(admin)/dashboard/`.
13. **Profile** — `app/(admin)/profile/`.
14. **Reports** — `app/(admin)/reports/`.
15. **Limpeza final** — atualizar todos os imports para `app/(admin)/...`, remover `src/modules/` e hooks genéricos obsoletos em `src/hooks/`.

## Migração de Services para TS
- Converter `src/services/*Service.js` para `.ts` módulo a módulo:
  - Ex.: `billingService.ts`, `productsService.ts`, `salesService.ts`, `segmentsService.ts`, `nfeService.ts`, etc.
- Serviços finos sobre `apiService` mantendo as respostas normalizadas (ex.: `res.billings || res.data || []`).

## Migração de Hooks
- Hooks ficam por rota, dentro de `_hooks/`, em TS (`.ts`/`.tsx`).
- Estados e retornos tipados. Manter `useCallback`/dependências corretas para evitar lints.

## Componentes e Lib
- Componentes em `.tsx` com props tipadas.
- `src/lib/supabase.js` e `src/lib/utils.js` → `.ts`.

## Limpeza por Módulo
- Ao finalizar cada módulo:
  - Remover a pasta correspondente em `src/modules/<Modulo>/` (incluindo bridges `index.jsx`).
  - Remover hooks legados em `src/hooks/` associados ao módulo.
  - Ajustar imports para os novos caminhos em `app/(admin)/...`.

## Riscos e Mitigações
- Divergência camelCase/snake_case: manter mapeamento no `apiService`/services e testes básicos de CRUD em cada módulo migrado.
- Lints de hooks: usar `useCallback` e dependências corretas.
- Tipagem estrita: começar pelas entidades mais usadas (Segments, Partners/Customers, Products) para acelerar convergência.

## Checklist por Módulo (exemplo)
- [ ] Criar `_hooks` em TS com paginação e CRUD
- [ ] Criar `_components` em TSX
- [ ] Converter service `.js` → `.ts`
- [ ] Integrar `page.tsx` da rota
- [ ] Atualizar imports
- [ ] Remover código legado em `src/modules/<Modulo>/`
- [ ] Remover hooks legados em `src/hooks/`

## Observações Finais
- O backend (Supabase Edge Functions) já está pronto e com CORS corrigido para PUT/DELETE.
- O `apiService` (`src/services/api.ts`) centraliza requisições e já aplica o mapeamento camelCase → snake_case.
- Após a migração completa, o diretório `src/modules/` será removido definitivamente conforme o plano.

