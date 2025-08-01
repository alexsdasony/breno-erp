-- =====================================================
-- MIGRAÇÃO COMPLETA PARA SUPABASE - BRENO ERP
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABELA DE USUÁRIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    status VARCHAR(20) DEFAULT 'active',
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABELA DE SEGMENTOS
-- =====================================================
CREATE TABLE IF NOT EXISTS segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABELA DE CENTROS DE CUSTO
-- =====================================================
CREATE TABLE IF NOT EXISTS cost_centers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABELA DE PLANO DE CONTAS
-- =====================================================
CREATE TABLE IF NOT EXISTS chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'asset', 'liability', 'equity', 'revenue', 'expense'
    parent_id UUID REFERENCES chart_of_accounts(id),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABELA DE RELACIONAMENTO CENTRO DE CUSTO - CONTA
-- =====================================================
CREATE TABLE IF NOT EXISTS cost_center_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cost_center_id UUID NOT NULL REFERENCES cost_centers(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES chart_of_accounts(id) ON DELETE CASCADE,
    percentage DECIMAL(5,2) DEFAULT 100.00,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(cost_center_id, account_id)
);

-- =====================================================
-- TABELA DE CLIENTES
-- =====================================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    cpf_cnpj VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    segment_id UUID REFERENCES segments(id),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABELA DE PRODUTOS
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100) UNIQUE,
    price DECIMAL(10,2) NOT NULL,
    cost DECIMAL(10,2),
    stock_quantity INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 0,
    unit VARCHAR(50) DEFAULT 'un',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABELA DE VENDAS
-- =====================================================
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- =====================================================
-- TABELA DE ITENS DE VENDA
-- =====================================================
CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABELA DE FATURAMENTO
-- =====================================================
CREATE TABLE IF NOT EXISTS billings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id),
    billing_date DATE NOT NULL,
    due_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    payment_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABELA DE CONTAS A PAGAR
-- =====================================================
CREATE TABLE IF NOT EXISTS accounts_payable (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_name VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    payment_date DATE,
    status VARCHAR(50) DEFAULT 'pending',
    cost_center_id UUID REFERENCES cost_centers(id),
    account_id UUID REFERENCES chart_of_accounts(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABELA DE NOTAS FISCAIS
-- =====================================================
CREATE TABLE IF NOT EXISTS nfes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    number VARCHAR(50) UNIQUE NOT NULL,
    series VARCHAR(20),
    issue_date DATE NOT NULL,
    customer_id UUID REFERENCES customers(id),
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'issued',
    xml_content TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABELA DE TRANSAÇÕES FINANCEIRAS
-- =====================================================
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'income' ou 'expense'
    category VARCHAR(100),
    account_id UUID REFERENCES chart_of_accounts(id),
    cost_center_id UUID REFERENCES cost_centers(id),
    customer_id UUID REFERENCES customers(id),
    supplier_name VARCHAR(255),
    payment_method VARCHAR(50),
    reference VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABELA DE INTEGRAÇÕES
-- =====================================================
CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL,
    config JSONB,
    active BOOLEAN DEFAULT true,
    last_sync TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABELA DE RECEITA (CONSULTA EXTERNA)
-- =====================================================
CREATE TABLE IF NOT EXISTS receita_consultas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cpf_cnpj VARCHAR(20) NOT NULL,
    tipo VARCHAR(10) NOT NULL, -- 'cpf' ou 'cnpj'
    resultado JSONB,
    consultado_em TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Índices para customers
CREATE INDEX IF NOT EXISTS idx_customers_cpf_cnpj ON customers(cpf_cnpj);
CREATE INDEX IF NOT EXISTS idx_customers_segment_id ON customers(segment_id);
CREATE INDEX IF NOT EXISTS idx_customers_active ON customers(active);

-- Índices para products
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock_quantity);

-- Índices para sales
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);

-- Índices para transactions
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_cost_center_id ON transactions(cost_center_id);

-- Índices para billings
CREATE INDEX IF NOT EXISTS idx_billings_customer_id ON billings(customer_id);
CREATE INDEX IF NOT EXISTS idx_billings_due_date ON billings(due_date);
CREATE INDEX IF NOT EXISTS idx_billings_status ON billings(status);

-- Índices para accounts_payable
CREATE INDEX IF NOT EXISTS idx_accounts_payable_due_date ON accounts_payable(due_date);
CREATE INDEX IF NOT EXISTS idx_accounts_payable_status ON accounts_payable(status);
CREATE INDEX IF NOT EXISTS idx_accounts_payable_cost_center_id ON accounts_payable(cost_center_id);

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
CREATE TRIGGER update_chart_of_accounts_updated_at BEFORE UPDATE ON chart_of_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cost_center_accounts_updated_at BEFORE UPDATE ON cost_center_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_billings_updated_at BEFORE UPDATE ON billings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accounts_payable_updated_at BEFORE UPDATE ON accounts_payable FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nfes_updated_at BEFORE UPDATE ON nfes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Inserir segmentos padrão
INSERT INTO segments (name, description) VALUES 
('Varejo', 'Clientes varejistas'),
('Atacado', 'Clientes atacadistas'),
('Pessoa Física', 'Clientes pessoa física'),
('Pessoa Jurídica', 'Clientes pessoa jurídica')
ON CONFLICT DO NOTHING;

-- Inserir centros de custo padrão
INSERT INTO cost_centers (name, description) VALUES 
('Administrativo', 'Custos administrativos'),
('Comercial', 'Custos comerciais'),
('Produção', 'Custos de produção'),
('Financeiro', 'Custos financeiros')
ON CONFLICT DO NOTHING;

-- Inserir plano de contas básico
INSERT INTO chart_of_accounts (code, name, type) VALUES 
('1', 'Ativo', 'asset'),
('1.1', 'Ativo Circulante', 'asset'),
('1.1.1', 'Caixa', 'asset'),
('1.1.2', 'Bancos', 'asset'),
('1.1.3', 'Contas a Receber', 'asset'),
('1.1.4', 'Estoques', 'asset'),
('2', 'Passivo', 'liability'),
('2.1', 'Passivo Circulante', 'liability'),
('2.1.1', 'Fornecedores', 'liability'),
('2.1.2', 'Contas a Pagar', 'liability'),
('3', 'Patrimônio Líquido', 'equity'),
('3.1', 'Capital Social', 'equity'),
('4', 'Receitas', 'revenue'),
('4.1', 'Receita de Vendas', 'revenue'),
('5', 'Despesas', 'expense'),
('5.1', 'Despesas Administrativas', 'expense'),
('5.2', 'Despesas Comerciais', 'expense'),
('5.3', 'Despesas Financeiras', 'expense')
ON CONFLICT DO NOTHING;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_center_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE billings ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts_payable ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE receita_consultas ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (permitir tudo para service role)
CREATE POLICY "Enable all for service role" ON users FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all for service role" ON segments FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all for service role" ON cost_centers FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all for service role" ON chart_of_accounts FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all for service role" ON cost_center_accounts FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all for service role" ON customers FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all for service role" ON products FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all for service role" ON sales FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all for service role" ON sale_items FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all for service role" ON billings FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all for service role" ON accounts_payable FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all for service role" ON nfes FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all for service role" ON transactions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all for service role" ON integrations FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all for service role" ON receita_consultas FOR ALL USING (auth.role() = 'service_role');

-- Políticas para usuários autenticados (anon key)
CREATE POLICY "Enable read for authenticated users" ON users FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read for authenticated users" ON segments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read for authenticated users" ON cost_centers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read for authenticated users" ON chart_of_accounts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read for authenticated users" ON cost_center_accounts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read for authenticated users" ON customers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read for authenticated users" ON products FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read for authenticated users" ON sales FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read for authenticated users" ON sale_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read for authenticated users" ON billings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read for authenticated users" ON accounts_payable FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read for authenticated users" ON nfes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read for authenticated users" ON transactions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read for authenticated users" ON integrations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read for authenticated users" ON receita_consultas FOR SELECT USING (auth.role() = 'authenticated');

-- =====================================================
-- FIM DA MIGRAÇÃO
-- ===================================================== 