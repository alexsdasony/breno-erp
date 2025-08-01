-- =====================================================
-- MIGRAÇÃO FINAL BRENO ERP - ESTRUTURA REAL
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABELA DE USUÁRIOS (ESTRUTURA REAL)
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    status TEXT DEFAULT 'ativo',
    segment_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABELA DE SEGMENTOS (ESTRUTURA REAL)
-- =====================================================
CREATE TABLE segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABELA DE CENTROS DE CUSTO (ESTRUTURA REAL)
-- =====================================================
CREATE TABLE cost_centers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABELA DE CLIENTES (ESTRUTURA REAL COMPLETA)
-- =====================================================
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    cpf VARCHAR(20),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(2),
    total_purchases DECIMAL(12,2) DEFAULT 0,
    last_purchase_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABELA DE PRODUTOS (ESTRUTURA REAL COMPLETA)
-- =====================================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 0,
    price DECIMAL(12,2) NOT NULL,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABELA DE VENDAS (ESTRUTURA REAL COMPLETA)
-- =====================================================
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id),
    customer_name VARCHAR(255),
    product VARCHAR(255),
    quantity INTEGER NOT NULL,
    total DECIMAL(12,2) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Pendente',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABELA DE TRANSAÇÕES (ESTRUTURA REAL COMPLETA)
-- =====================================================
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(20) NOT NULL,
    description TEXT,
    amount DECIMAL(12,2) NOT NULL,
    date DATE NOT NULL,
    category VARCHAR(100),
    cost_center VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABELA DE FATURAMENTO (ESTRUTURA REAL COMPLETA)
-- =====================================================
CREATE TABLE billings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id),
    customer_name VARCHAR(255),
    amount DECIMAL(12,2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Pendente',
    payment_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABELA DE CONTAS A PAGAR (ESTRUTURA REAL COMPLETA)
-- =====================================================
CREATE TABLE accounts_payable (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(12,2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABELA DE NFES (ESTRUTURA REAL COMPLETA)
-- =====================================================
CREATE TABLE nfe_list (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    number VARCHAR(20) NOT NULL UNIQUE,
    customer_name VARCHAR(255),
    date DATE NOT NULL,
    total DECIMAL(12,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Emitida',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABELA DE NFES ALTERNATIVA (ESTRUTURA REAL)
-- =====================================================
CREATE TABLE nfe (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    number TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    date DATE NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'Emitida' CHECK(status IN ('Emitida', 'Cancelada')),
    segment_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABELA DE INTEGRAÇÕES (ESTRUTURA REAL COMPLETA)
-- =====================================================
CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_name VARCHAR(100) NOT NULL,
    api_key TEXT,
    enabled BOOLEAN DEFAULT FALSE,
    config JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE (ESTRUTURA REAL)
-- =====================================================

-- Índices para customers
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_cpf ON customers(cpf);

-- Índices para sales
CREATE INDEX idx_sales_customer_id ON sales(customer_id);
CREATE INDEX idx_sales_date ON sales(date);

-- Índices para transactions
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);

-- Índices para billings
CREATE INDEX idx_billings_customer_id ON billings(customer_id);
CREATE INDEX idx_billings_due_date ON billings(due_date);
CREATE INDEX idx_billings_status ON billings(status);

-- Índices para accounts_payable
CREATE INDEX idx_accounts_payable_due_date ON accounts_payable(due_date);
CREATE INDEX idx_accounts_payable_status ON accounts_payable(status);

-- Índices para nfe_list
CREATE INDEX idx_nfe_list_date ON nfe_list(date);
CREATE INDEX idx_nfe_list_status ON nfe_list(status);

-- =====================================================
-- FUNÇÕES E TRIGGERS
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_segments_updated_at BEFORE UPDATE ON segments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cost_centers_updated_at BEFORE UPDATE ON cost_centers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_billings_updated_at BEFORE UPDATE ON billings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accounts_payable_updated_at BEFORE UPDATE ON accounts_payable FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nfe_list_updated_at BEFORE UPDATE ON nfe_list FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nfe_updated_at BEFORE UPDATE ON nfe FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DADOS INICIAIS (ESTRUTURA REAL)
-- =====================================================

-- Inserir segmentos padrão
INSERT INTO segments (name, description) VALUES 
('Varejo', 'Clientes varejistas'),
('Atacado', 'Clientes atacadistas'),
('Pessoa Física', 'Clientes pessoa física');

-- Inserir centros de custo padrão
INSERT INTO cost_centers (name) VALUES 
('Administrativo'),
('Comercial'),
('Produção'),
('Financeiro'),
('Operacional');

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billings ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts_payable ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfe_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfe ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (permitir tudo para service role)
CREATE POLICY "Enable all for service role" ON users FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all for service role" ON segments FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all for service role" ON cost_centers FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all for service role" ON customers FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all for service role" ON products FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all for service role" ON sales FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all for service role" ON transactions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all for service role" ON billings FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all for service role" ON accounts_payable FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all for service role" ON nfe_list FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all for service role" ON nfe FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all for service role" ON integrations FOR ALL USING (auth.role() = 'service_role');

-- Políticas para usuários autenticados (anon key)
CREATE POLICY "Enable read for authenticated users" ON users FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read for authenticated users" ON segments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read for authenticated users" ON cost_centers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read for authenticated users" ON customers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read for authenticated users" ON products FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read for authenticated users" ON sales FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read for authenticated users" ON transactions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read for authenticated users" ON billings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read for authenticated users" ON accounts_payable FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read for authenticated users" ON nfe_list FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read for authenticated users" ON nfe FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read for authenticated users" ON integrations FOR SELECT USING (auth.role() = 'authenticated');
