# Breno ERP

Sistema ERP completo desenvolvido com React + Vite e Supabase Edge Functions.

## 🏗️ Arquitetura

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Supabase Edge Functions (Deno)
- **Database**: Supabase PostgreSQL
- **Deploy**: Vercel (Frontend) + Supabase (Backend/DB)

## 🚀 Funcionalidades

- ✅ Dashboard com métricas
- ✅ Gestão financeira completa
- ✅ Controle de estoque
- ✅ Gestão de vendas
- ✅ Cadastro de clientes
- ✅ Sistema de cobranças
- ✅ Contas a pagar
- ✅ Emissão de NFe
- ✅ Centros de custo
- ✅ Segmentação
- ✅ Integrações
- ✅ Relatórios
- ✅ Importação de dados
- ✅ Autenticação e perfis

## 🛠️ Tecnologias

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Supabase Edge Functions (Deno)
- **Database**: Supabase PostgreSQL
- **Autenticação**: Custom JWT
- **Deploy**: Vercel + Supabase

## 📦 Instalação

```bash
# Clone o repositório
git clone <repository-url>
cd breno-erp

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp env.example .env.local
```

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local` com:

```env
VITE_API_URL=https://qerubjitetqwfqqydhzv.supabase.co/functions/v1
VITE_SUPABASE_URL=https://qerubjitetqwfqqydhzv.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase

1. Configure o projeto no Supabase
2. Execute as migrações: `npx supabase db push`
3. Deploy das Edge Functions: `npx supabase functions deploy --all`

## 🚀 Deploy

### Frontend (Vercel)

1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Backend (Supabase)

```bash
cd supabase
npx supabase functions deploy --all
```

## 📚 Estrutura do Projeto

```
breno-erp/
├── src/
│   ├── components/     # Componentes React
│   ├── modules/        # Módulos do ERP
│   ├── services/       # Serviços de API
│   └── utils/          # Utilitários
├── supabase/
│   ├── functions/      # Edge Functions
│   ├── migrations/     # Migrações do banco
│   └── config.toml     # Configuração Supabase
└── public/             # Arquivos estáticos
```

## 🔧 Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 📊 Banco de Dados

O sistema utiliza as seguintes tabelas principais:

- `users` - Usuários do sistema
- `segments` - Segmentos de negócio
- `customers` - Clientes
- `products` - Produtos
- `transactions` - Transações financeiras
- `sales` - Vendas
- `billings` - Cobranças
- `accounts_payable` - Contas a pagar
- `cost_centers` - Centros de custo
- `nfe` - Notas fiscais eletrônicas

## 🔐 Autenticação

Sistema de autenticação customizado usando:
- Tabela `users` personalizada
- JWT tokens
- Edge Function para login

## 📈 Status

✅ **Produção**: Sistema completo funcionando
✅ **Edge Functions**: Todas as APIs migradas
✅ **Frontend**: Deployado na Vercel
✅ **Database**: Supabase PostgreSQL

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.
