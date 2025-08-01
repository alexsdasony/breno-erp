# 📊 ANÁLISE COMPARATIVA: SCHEMA ATUAL vs SUPABASE

## 🔍 **RESUMO EXECUTIVO**

Após análise profunda do banco SQLite atual, identifiquei **DIVERGÊNCIAS CRÍTICAS** entre o schema atual e o que foi criado no Supabase. O schema atual é **MUITO MAIS SIMPLES** e tem uma estrutura diferente da que assumimos.

## ⚠️ **PROBLEMAS IDENTIFICADOS**

### 1. **ESTRUTURA DE VENDAS - DIFERENÇA CRÍTICA**

**SQLite Atual:**
```sql
CREATE TABLE sales (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER,
    customer_name VARCHAR(255),  -- ❌ Nome do cliente duplicado
    product VARCHAR(255),        -- ❌ Produto como string, não FK
    quantity INTEGER NOT NULL,
    total DECIMAL(12,2) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Pendente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);
```

**Supabase Criado:**
```sql
CREATE TABLE sales (
    id UUID PRIMARY KEY,
    customer_id UUID REFERENCES customers(id),
    sale_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    final_amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    status VARCHAR(50) DEFAULT 'completed',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sale_items (
    id UUID PRIMARY KEY,
    sale_id UUID REFERENCES sales(id),
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**❌ PROBLEMA:** O sistema atual tem vendas simples (1 produto por venda), mas criamos estrutura complexa com sale_items.

### 2. **CAMPOS FALTANDO EM CUSTOMERS**

**SQLite Atual:**
```sql
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cpf VARCHAR(20),           -- ❌ Campo 'cpf', não 'cpf_cnpj'
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(2),          -- ❌ Apenas 2 caracteres
    total_purchases DECIMAL(12,2) DEFAULT 0,  -- ❌ Campo adicional
    last_purchase_date DATE,   -- ❌ Campo adicional
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Supabase Criado:**
```sql
CREATE TABLE customers (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    cpf_cnpj VARCHAR(20),      -- ❌ Campo diferente
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),         -- ❌ Tamanho diferente
    zip_code VARCHAR(20),      -- ❌ Campo adicional
    segment_id UUID REFERENCES segments(id),  -- ❌ Campo adicional
    active BOOLEAN DEFAULT true,              -- ❌ Campo adicional
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. **CAMPOS FALTANDO EM PRODUCTS**

**SQLite Atual:**
```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    stock INTEGER DEFAULT 0,        -- ❌ Campo 'stock', não 'stock_quantity'
    min_stock INTEGER DEFAULT 0,
    price DECIMAL(12,2) NOT NULL,
    category VARCHAR(100),          -- ❌ Campo 'category', não 'description'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Supabase Criado:**
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,               -- ❌ Campo diferente
    sku VARCHAR(100) UNIQUE,        -- ❌ Campo adicional
    price DECIMAL(10,2) NOT NULL,
    cost DECIMAL(10,2),             -- ❌ Campo adicional
    stock_quantity INTEGER DEFAULT 0,  -- ❌ Nome diferente
    min_stock INTEGER DEFAULT 0,
    unit VARCHAR(50) DEFAULT 'un',     -- ❌ Campo adicional
    active BOOLEAN DEFAULT true,       -- ❌ Campo adicional
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4. **ESTRUTURA DE TRANSACTIONS DIFERENTE**

**SQLite Atual:**
```sql
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL,      -- 'receita' ou 'despesa'
    description TEXT,
    amount DECIMAL(12,2) NOT NULL,
    date DATE NOT NULL,
    category VARCHAR(100),
    cost_center VARCHAR(100),       -- ❌ String, não FK
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Supabase Criado:**
```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    type VARCHAR(20) NOT NULL,      -- 'income' ou 'expense'
    category VARCHAR(100),
    account_id UUID REFERENCES chart_of_accounts(id),  -- ❌ FK adicional
    cost_center_id UUID REFERENCES cost_centers(id),   -- ❌ FK, não string
    customer_id UUID REFERENCES customers(id),         -- ❌ FK adicional
    supplier_name VARCHAR(255),                        -- ❌ Campo adicional
    payment_method VARCHAR(50),                        -- ❌ Campo adicional
    reference VARCHAR(100),                            -- ❌ Campo adicional
    notes TEXT,                                        -- ❌ Campo adicional
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 5. **TABELAS AUSENTES NO SQLITE**

**❌ TABELAS QUE NÃO EXISTEM NO SQLITE ATUAL:**
- `chart_of_accounts` - Plano de contas
- `cost_center_accounts` - Relacionamento centro de custo x conta
- `sale_items` - Itens de venda (separado)
- `receita_consultas` - Consultas à receita

### 6. **TABELAS DUPLICADAS/INCONSISTENTES**

**SQLite tem:**
- `nfe_list` - Tabela de NFes
- `nfe` - Outra tabela de NFes (duplicada)

**Supabase criou:**
- `nfes` - Uma única tabela

## 🔧 **RECOMENDAÇÕES PARA CORREÇÃO**

### **OPÇÃO 1: ADAPTAR SUPABASE AO SCHEMA ATUAL (RECOMENDADO)**

1. **Simplificar tabela sales** - Remover sale_items, usar estrutura atual
2. **Ajustar campos de customers** - Usar nomes e tipos atuais
3. **Ajustar campos de products** - Usar nomes e tipos atuais
4. **Simplificar transactions** - Remover FKs complexas
5. **Remover tabelas desnecessárias** - chart_of_accounts, cost_center_accounts
6. **Unificar tabelas NFe** - Usar uma única estrutura

### **OPÇÃO 2: MIGRAR DADOS EXISTENTES**

1. **Criar script de migração** para adaptar dados atuais
2. **Mapear campos** entre estruturas diferentes
3. **Criar dados padrão** para campos novos obrigatórios

## 📋 **PLANO DE AÇÃO IMEDIATO**

1. **Criar novo schema corrigido** baseado na estrutura atual
2. **Aplicar nova migração** no Supabase
3. **Atualizar configurações** do backend e frontend
4. **Testar funcionalidade** com estrutura real

## ⚡ **PRÓXIMOS PASSOS**

Vou criar um novo schema que seja **FIEL** à estrutura atual do seu sistema, evitando retrabalho e garantindo compatibilidade total. 