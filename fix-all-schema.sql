-- Script completo para corrigir todas as divergências de schema
-- Baseado nos erros encontrados durante a migração

-- ========================================
-- AJUSTES NA TABELA PRODUCTS
-- ========================================
ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS code VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS segment_id UUID;
ALTER TABLE products ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- ========================================
-- AJUSTES NA TABELA TRANSACTIONS
-- ========================================
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS segment_id UUID;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- ========================================
-- AJUSTES NA TABELA SALES
-- ========================================
ALTER TABLE sales ADD COLUMN IF NOT EXISTS product VARCHAR(255);
ALTER TABLE sales ADD COLUMN IF NOT EXISTS quantity INTEGER;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS segment_id UUID;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS sale_date DATE;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10,2);
ALTER TABLE sales ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE sales ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- ========================================
-- AJUSTES NA TABELA BILLINGS
-- ========================================
ALTER TABLE billings ADD COLUMN IF NOT EXISTS segment_id UUID;
ALTER TABLE billings ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE billings ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- ========================================
-- AJUSTES NA TABELA INTEGRATIONS
-- ========================================
ALTER TABLE integrations ADD COLUMN IF NOT EXISTS api_key VARCHAR(255);
ALTER TABLE integrations ADD COLUMN IF NOT EXISTS enabled BOOLEAN DEFAULT true;
ALTER TABLE integrations ADD COLUMN IF NOT EXISTS segment_id UUID;
ALTER TABLE integrations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE integrations ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- ========================================
-- AJUSTES NA TABELA COST_CENTERS
-- ========================================
ALTER TABLE cost_centers ADD COLUMN IF NOT EXISTS segment_id UUID;
ALTER TABLE cost_centers ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE cost_centers ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- ========================================
-- AJUSTES NA TABELA CUSTOMERS
-- ========================================
ALTER TABLE customers ADD COLUMN IF NOT EXISTS segment_id UUID;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- ========================================
-- AJUSTES NA TABELA CHART_OF_ACCOUNTS
-- ========================================
ALTER TABLE chart_of_accounts ADD COLUMN IF NOT EXISTS segment_id UUID;
ALTER TABLE chart_of_accounts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE chart_of_accounts ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- ========================================
-- AJUSTES NA TABELA NFES
-- ========================================
ALTER TABLE nfes ADD COLUMN IF NOT EXISTS segment_id UUID;
ALTER TABLE nfes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE nfes ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- ========================================
-- AJUSTES NA TABELA ACCOUNTS_PAYABLE
-- ========================================
ALTER TABLE accounts_payable ADD COLUMN IF NOT EXISTS segment_id UUID;
ALTER TABLE accounts_payable ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE accounts_payable ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- ========================================
-- VERIFICAR ALTERAÇÕES
-- ========================================
SELECT 'Schema completamente ajustado!' as resultado;
