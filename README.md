# Breno ERP

Sistema ERP completo desenvolvido com **Next.js 15**, **React 18**, **Tailwind CSS** e **Supabase** como backend.

## 🏗️ Arquitetura

### Frontend
- **Framework**: Next.js 15 com App Router
- **UI**: React 18 + Tailwind CSS + Radix UI
- **Estado**: Context API + Hooks customizados
- **Roteamento**: Next.js App Router (file-based routing)
- **Autenticação**: JWT com sessionStorage

### Backend
- **Banco de Dados**: Supabase (PostgreSQL)
- **API**: Supabase Edge Functions (Deno)
- **Autenticação**: JWT customizado
- **Proxy**: Next.js rewrites para desenvolvimento

## 📁 Estrutura do Projeto

```
breno-erp/
├── app/                          # Next.js App Router
│   ├── (admin)/                # Grupo de rotas autenticadas
│   │   ├── dashboard/           # Dashboard principal
│   │   ├── financial/          # Módulo financeiro
│   │   ├── sales/              # Módulo de vendas
│   │   ├── customers/          # Módulo de clientes
│   │   ├── inventory/          # Módulo de produtos
│   │   ├── billing/            # Módulo de cobrança
│   │   ├── accounts-payable/   # Contas a pagar
│   │   ├── cost-centers/       # Centros de custo
│   │   ├── segments/           # Segmentos
│   │   ├── nfe/                # Notas fiscais
│   │   ├── reports/            # Relatórios
│   │   ├── profile/            # Perfil do usuário
│   │   └── layout.js           # Layout do dashboard
│   ├── login/                  # Página de login
│   ├── register/               # Página de registro
│   ├── forgot-password/        # Recuperação de senha
│   ├── reset-password/         # Reset de senha
│   ├── layout.js               # Layout raiz
│   ├── providers.js            # Providers (Context)
│   └── globals.css             # Estilos globais
├── src/
│   ├── components/             # Componentes reutilizáveis
│   │   ├── ui/                 # Componentes base (Radix UI)
│   │   └── layouts/            # Layouts específicos
│   ├── modules/                # Módulos do sistema
│   │   ├── DashboardModule.jsx
│   │   ├── FinancialModule.jsx
│   │   ├── SalesModule.jsx
│   │   ├── CustomersModule.jsx
│   │   ├── InventoryModule.jsx
│   │   ├── BillingModule.jsx
│   │   ├── AccountsPayableModule.jsx
│   │   ├── CostCentersModule.jsx
│   │   ├── SegmentsModule.jsx
│   │   ├── NFeModule.jsx
│   │   ├── ReportsModule.jsx
│   │   ├── ProfileModule.jsx
│   │   └── IntegrationsModule.jsx
│   ├── hooks/                  # Hooks customizados
│   │   ├── useAuth.jsx         # Autenticação
│   │   ├── useAppData.jsx      # Dados globais
│   │   └── useCrud.jsx         # Operações CRUD
│   ├── services/               # Serviços
│   │   ├── api.js              # Cliente HTTP
│   │   └── supabase.js         # Cliente Supabase
│   ├── config/                 # Configurações
│   │   ├── constants.js        # Constantes
│   │   ├── menuConfig.js       # Configuração do menu
│   │   └── routeConfig.js      # Mapeamento de rotas
│   └── pages/                  # Páginas (legado)
├── supabase/                   # Backend (Supabase)
│   ├── functions/              # Edge Functions
│   │   ├── auth/               # Autenticação
│   │   ├── users/              # Usuários
│   │   ├── segments/           # Segmentos
│   │   ├── customers/          # Clientes
│   │   ├── products/           # Produtos
│   │   ├── sales/              # Vendas
│   │   ├── transactions/       # Transações
│   │   ├── billings/           # Cobranças
│   │   ├── accounts-payable/   # Contas a pagar
│   │   ├── cost-centers/       # Centros de custo
│   │   ├── nfe/                # Notas fiscais
│   │   ├── metrics/            # Métricas
│   │   └── integrations/       # Integrações
│   ├── migrations/             # Migrações do banco
│   ├── seed-data.js            # Dados iniciais
│   └── config.toml             # Configuração Supabase
└── tests/                      # Testes E2E
    └── e2e/                    # Testes Playwright
```

## 🚀 Configuração

### 1. Instalação
```bash
npm install
```

### 2. Variáveis de Ambiente
Copie `env.example` para `.env.local`:
```bash
cp env.example .env.local
```

**Variáveis obrigatórias:**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://qerubjitetqwfqqydhzv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# API
NEXT_PUBLIC_API_URL=https://qerubjitetqwfqqydhzv.supabase.co/functions/v1

# JWT
JWT_SECRET=f3696dd52f7674b95e4606c46a6e69065b65600544b4129ba7b09538476f06fa...
```

### 3. Banco de Dados
Execute as migrações do Supabase:
```bash
cd supabase
npx supabase db push
```

### 4. Dados Iniciais
Execute o seed para criar dados de teste:
```bash
cd supabase
npm run seed
```

### 5. Edge Functions
Deploy das Edge Functions:
```bash
cd supabase
npx supabase functions deploy
```

## 🏃‍♂️ Execução

### Desenvolvimento
```bash
npm run dev
```
Acesse: http://localhost:3000

### Produção
```bash
npm run build
npm start
```

## 🧪 Testes

### Testes E2E
```bash
# Executar todos os testes
npm run test:e2e

# Executar com interface
npm run test:e2e:ui

# Executar com browser visível
npm run test:e2e:headed

# Executar em modo debug
npm run test:e2e:debug
```

## 📊 Módulos do Sistema

### 1. **Dashboard**
- Métricas gerais
- Gráficos de performance
- Resumo financeiro

### 2. **Financeiro**
- Transações
- Relatórios financeiros
- Fluxo de caixa

### 3. **Vendas**
- Gestão de vendas
- Histórico de vendas
- Relatórios de vendas

### 4. **Clientes**
- Cadastro de clientes
- Histórico de compras
- Gestão de contatos

### 5. **Produtos**
- Controle de estoque
- Preços
- Categorias

### 6. **Cobrança**
- Faturas
- Controle de pagamentos
- Relatórios de cobrança

### 7. **Contas a Pagar**
- Fornecedores
- Contas a pagar
- Controle de pagamentos

### 8. **Centros de Custo**
- Gestão de centros de custo
- Alocação de custos

### 9. **Segmentos**
- Gestão de segmentos
- Filtros por segmento

### 10. **Notas Fiscais**
- Gestão de NFes
- Integração com Receita

### 11. **Relatórios**
- Relatórios customizados
- Exportação de dados

### 12. **Integrações**
- APIs externas
- Webhooks

## 🔐 Autenticação

O sistema usa autenticação JWT customizada:

- **Login**: Email/senha
- **Persistência**: sessionStorage
- **Proteção**: Middleware de autenticação
- **Redirecionamento**: Automático para login

## 🗄️ Banco de Dados

### Tabelas Principais
- `users` - Usuários do sistema
- `segments` - Segmentos empresariais
- `customers` - Clientes
- `products` - Produtos
- `sales` - Vendas
- `transactions` - Transações financeiras
- `billings` - Cobranças
- `accounts_payable` - Contas a pagar
- `cost_centers` - Centros de custo
- `nfe_list` - Notas fiscais

### Políticas de Segurança
- RLS (Row Level Security) ativo
- Políticas por segmento
- Controle de acesso por usuário

## 🔧 Desenvolvimento

### Scripts Disponíveis
```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Linting
npm run test:e2e     # Testes E2E
```

### Tecnologias Utilizadas
- **Frontend**: Next.js 15, React 18, Tailwind CSS, Radix UI
- **Backend**: Supabase Edge Functions (Deno)
- **Banco**: PostgreSQL (Supabase)
- **Testes**: Playwright
- **Deploy**: Vercel

## 📝 Licença

Projeto privado - Breno ERP
