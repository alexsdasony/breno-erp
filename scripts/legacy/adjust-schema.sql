-- Script para ajustar schema local para compatibilidade com dados remotos

-- ========================================
-- AJUSTES NA TABELA PRODUCTS
-- ========================================
ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS code VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier VARCHAR(255);
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
-- VERIFICAR ALTERAÇÕES
-- ========================================
SELECT 'Schema ajustado com sucesso!' as resultado;
