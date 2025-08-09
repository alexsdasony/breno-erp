## Instruções para testes E2E (Playwright) — Breno ERP

### Preferências e princípios
- Sempre use seletores por ID. Não usar classe/innerText para localizar elementos.
- Todo elemento interativo (clicado, preenchido, lido, verificado) deve ter um ID único no DOM.
- Validação de criação: após criar, conferir a primeira linha da tabela (lista ordenada por created_at desc) e ler seu atributo `id`.
- Validar toasts: o teste deve falhar imediatamente se houver toast de erro (variant destructive).
- Executar os testes apenas no Chrome nativo (projeto chromium com channel: 'chrome').

### Plataforma
- Runner: Playwright
- Projeto/browser: chromium com channel 'chrome'
- Dev server: `npm run dev` (o config já copia `env.example` → `.env.local` quando necessário)
- Execução: `npx playwright test --project=chromium --headed`

### Convenção de IDs
- Menu: `#menu-<modulo>` (ex.: `#menu-financial`, `#menu-customers`, `#menu-suppliers`).
- Ações: `#<modulo>-new-button`, `#<modulo>-submit-button`, `#<modulo>-cancel-button`.
- Inputs/selects: `#<modulo>-<campo>-input`, `#<modulo>-<campo>-select`.
- Tabela: `#<modulo>-table`.
- Linhas: `#<modulo>-row-<id>` (ex.: `#customers-row-<partner.id>`).
- Toasts: `toast-<variant>-<id>`, com `toast-title-<id>` e `toast-description-<id>`.

### Fluxo padrão (CRUD caminho feliz)
1) Login com IDs: `#login-email`, `#login-password`, `#login-submit-button`.
2) Navegar para `#menu-<modulo>` e aguardar rota `/**/<modulo>`.
3) Listar: garantir visibilidade de `#<modulo>-table`.
4) Criar:
   - Abrir `#<modulo>-new-button`, preencher campos mínimos válidos, submeter com `#<modulo>-submit-button`.
   - Aguardar toast; se erro (destructive) → falhar; sucesso → seguir.
   - Conferir primeira linha do `tbody`: deve ter `id` e conter o texto criado.
5) Atualizar:
   - Abrir edição do item criado, alterar um campo chave, submeter e validar toast.
   - Conferir linha `#<modulo>-row-<id>` com o valor atualizado.
6) Deletar:
   - Excluir item, validar toast, e ausência da linha `#<modulo>-row-<id>`.

### Módulos cobertos e localização dos testes
- Financeiro: `tests/e2e/financial-happy.spec.js` (passando)
- Clientes: `tests/e2e/customers-happy.spec.js`
- Fornecedores: `tests/e2e/suppliers-happy.spec.js`

### Próximos módulos a testar (CRUD caminho feliz)
- Products (Estoque)
  - Criar produto (nome, preço, segmento), conferir topo `#products-row-<id>`.
  - Editar preço, validar.
  - Excluir, validar remoção.
  - IDs: `#products-new-button`, `#products-name-input`, `#products-price-input`, `#products-segment-select`, `#products-submit-button`, `#products-table`, `#products-row-<id>`.

- Sales (Vendas)
  - Criar venda (cliente + item), conferir `#sales-row-<id>`.
  - Editar (quantidade/notas), validar.
  - Excluir, validar.
  - IDs: `#sales-new-button`, `#sales-customer-select`, `#sales-item-product-select`, `#sales-item-qty-input`, `#sales-submit-button`, `#sales-table`, `#sales-row-<id>`.

- Billings (Cobranças)
  - Criar cobrança (valor, vencimento, cliente), conferir `#billings-row-<id>`.
  - Editar status/valor, validar.
  - Excluir, validar.
  - IDs: `#billings-new-button`, `#billings-amount-input`, `#billings-due-date-input`, `#billings-customer-select`, `#billings-submit-button`, `#billings-table`, `#billings-row-<id>`.

- Cost Centers (Centros de Custo)
  - Criar (nome + segmento), conferir `#costCenters-row-<id>`.
  - Editar, validar.
  - Excluir, validar.
  - IDs: `#costCenters-new-button`, `#costCenters-name-input`, `#costCenters-segment-select`, `#costCenters-submit-button`, `#costCenters-table`, `#costCenters-row-<id>`.

- Accounts Payable (Contas a Pagar)
  - Criar (descrição, valor, vencimento, status), conferir `#accountsPayable-row-<id>`.
  - Editar status, validar.
  - Excluir, validar.
  - IDs: `#accountsPayable-new-button`, `#accountsPayable-description-input`, `#accountsPayable-amount-input`, `#accountsPayable-due-date-input`, `#accountsPayable-status-select`, `#accountsPayable-submit-button`, `#accountsPayable-table`, `#accountsPayable-row-<id>`.

- NFe
  - Criar NF-e (número, cliente, total), conferir `#nfe-row-<id>`.
  - Editar (status), validar.
  - Excluir, validar.
  - IDs: `#nfe-new-button`, `#nfe-number-input`, `#nfe-customer-select`, `#nfe-total-input`, `#nfe-submit-button`, `#nfe-table`, `#nfe-row-<id>`.

- Segments (Segmentos)
  - Criar (nome), conferir `#segments-row-<id>` no topo.
  - Editar e excluir.
  - IDs: `#segments-new-button`, `#segmentName`, `#segmentDescription`, `#segments-submit-button`, `#segments-table`, `#segments-row-<id>`.

### Observações
- Ordene listas por `created_at desc` no backend ou frontend para garantir o item recém-criado no topo.
- Em relacionamentos obrigatórios, sempre prover selects com IDs previsíveis.
- Ao criar novos componentes/módulos, já incluir os IDs seguindo a convenção acima.


