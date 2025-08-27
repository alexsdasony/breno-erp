# Prompt: Correção de Incompatibilidades de Tipos

## Ações Críticas

1. **Schema Check**: `view_files` em `supabase/schemas/current-schema.sql` - linha da tabela alvo
2. **Type Audit**: `search_by_regex` por nome da interface - identificar duplicações
3. **Interface Fix**: `update_file` em `src/types/[Entity].ts` - alinhar com schema exato
4. **Remove Duplicates**: `update_file` nos services - deletar interfaces duplicadas, manter só import
5. **Component Update**: `update_file` nos componentes - trocar campos antigos pelos do schema
6. **Form Fix**: `update_file` no FormModal - renomear estados e payload para campos reais
7. **Normalize Check**: `view_files` na função de normalização - garantir mapeamento correto

## Execução
- Schema → Types → Services → Components → Forms
- Sempre usar nomes exatos das colunas do banco
- Eliminar qualquer duplicação de interface
- Centralizar imports em `@/types/`

## Resultado
Tipos alinhados, duplicações eliminadas, CRUD funcional.

---

# Módulos que Precisam de Correção

## ✅ CORRIGIDO: Financial
- **Status**: Concluído
- **Arquivos corrigidos**:
  - `src/types/FinancialDocument.ts`
  - `src/services/financialDocumentsService.ts`
  - `app/(admin)/financial/_components/FinancialDetailsDialog.tsx`
  - `app/(admin)/financial/_components/FinancialFormModal.tsx`
  - `app/(admin)/financial/_hooks/useFinancialDocuments.ts`

## ✅ CORRIGIDO: Products/Inventory
- **Status**: Concluído
- **Tabela**: `products`
- **Tipo**: `src/types/Product.ts`
- **Service**: `src/services/productsService.ts`
- **Componentes**: `app/(admin)/inventory/`
- **Context**: `src/contexts/ProductsContext.tsx`
- **Correções**: Duplicações removidas, tipos alinhados com schema

## ✅ CORRIGIDO: Customers
- **Status**: Concluído
- **Tabela**: `customers`
- **Tipo**: `src/types/Customer.ts`
- **Service**: `src/services/customersService.ts`
- **Componentes**: `app/(admin)/customers/`
- **Context**: `src/contexts/CustomersContext.tsx`
- **Correções**: Duplicações removidas, interface alinhada

## ✅ CORRIGIDO: Sales
- **Status**: Concluído
- **Tabela**: `sales`
- **Tipo**: `src/types/Sale.ts`
- **Service**: `src/services/salesService.ts`
- **Componentes**: `app/(admin)/sales/`
- **Correções**: Importações corrigidas, tipos alinhados

## ✅ CORRIGIDO: Accounts Payable
- **Tabela**: `accounts_payable`
- **Tipo**: `src/types/AccountsPayable.ts`
- **Service**: `src/services/accountsPayableService.ts`
- **Componentes**: `app/(admin)/accounts-payable/`
- **Problemas esperados**: Interface desalinhada com schema

## 🔴 PENDENTE: Billing
- **Tabela**: `billings`
- **Tipo**: `src/types/Billing.ts`
- **Service**: `src/services/billingService.ts`
- **Componentes**: `app/(admin)/billing/`
- **Problemas esperados**: Possível duplicação de tipos

## 🔴 PENDENTE: Chart of Accounts
- **Tabela**: `chart_of_accounts`
- **Tipo**: `src/types/ChartOfAccount.ts`
- **Service**: `src/services/chartOfAccountsService.ts`
- **Componentes**: `app/(admin)/chart-of-accounts/`
- **Problemas esperados**: Interface desalinhada

## 🔴 PENDENTE: Cost Centers
- **Tabela**: `cost_centers`
- **Tipo**: `src/types/CostCenter.ts`
- **Service**: `src/services/costCentersService.ts`
- **Componentes**: `app/(admin)/cost-centers/`
- **Problemas esperados**: Possível duplicação

## 🔴 PENDENTE: NFe
- **Tabela**: `nfe_documents`
- **Tipo**: `src/types/NFe.ts`
- **Service**: `src/services/nfeService.ts`
- **Componentes**: `app/(admin)/nfe/`
- **Problemas esperados**: Interface complexa, possível desalinhamento

## 🔴 PENDENTE: Payment Methods
- **Tabela**: `payment_methods`
- **Tipo**: `src/types/PaymentMethod.ts`
- **Service**: `src/services/paymentMethodsService.ts`
- **Componentes**: `app/(admin)/payment-methods/`
- **Problemas esperados**: Interface simples, baixo risco

## 🔴 PENDENTE: Segments
- **Tabela**: `segments`
- **Tipo**: `src/types/Segment.ts`
- **Service**: `src/services/segmentsService.ts`
- **Componentes**: `app/(admin)/segments/`
- **Problemas esperados**: Interface simples

## 🔴 PENDENTE: Suppliers
- **Tabela**: `suppliers`
- **Tipo**: `src/types/Supplier.ts`
- **Service**: `src/services/suppliersService.ts`
- **Componentes**: `app/(admin)/suppliers/`
- **Context**: `src/contexts/SuppliersContext.tsx`
- **Problemas esperados**: Duplicação entre context e types

## 🔴 PENDENTE: Users
- **Tabela**: `users`
- **Tipo**: `src/types/User.ts`
- **Service**: `src/services/usersService.ts`
- **Componentes**: `app/(admin)/users/`
- **Problemas esperados**: Interface de autenticação, cuidado com campos sensíveis

## 🔴 PENDENTE: Transactions
- **Tabela**: `transactions`
- **Tipo**: `src/types/Transaction.ts`
- **Service**: `src/services/transactionsService.ts`
- **Componentes**: Não identificados
- **Problemas esperados**: Possível conflito com FinancialDocument

---

## Prioridade de Correção

### ✅ CONCLUÍDOS
1. ~~**Financial**~~ - ✅ Concluído
2. ~~**Products/Inventory**~~ - ✅ Concluído
3. ~~**Customers**~~ - ✅ Concluído
4. ~~**Sales**~~ - ✅ Concluído
5. ~~**Suppliers**~~ - ✅ Concluído

### 🔄 EM ANDAMENTO
6. **Transactions** - Core business (próximo)

### Alta Prioridade
6. **Billing** - Financeiro secundário
7. **Cost Centers** - Contabilidade
8. **NFe** - Fiscal
9. **Accounts Payable** - Financeiro

### Média Prioridade
10. **Segments** - Categorização
11. **Payment Methods** - Configuração
12. **Chart of Accounts** - Contabilidade avançada

### Baixa Prioridade
13. **Users** - Administrativo
14. **Transactions** - Verificar se não é duplicata

---

## Comando para Assistente

```
Correção de tipos no módulo [NOME_MODULO]:
1. Verificar schema em supabase/schemas/current-schema.sql
2. Alinhar interface em src/types/[Entity].ts
3. Remover duplicações em services
4. Corrigir componentes e formulários
5. Rodar npx tsc -noEmit e corrigir possiveis problemas com typescript
```