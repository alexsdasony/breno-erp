-- =====================================================
-- SCRIPT DE OTIMIZAÇÃO DO BANCO DE DADOS - BRENO ERP
-- =====================================================
-- Data: $(date)
-- Versão: 1.0
-- Descrição: Otimizações de performance e estrutura do banco

-- =====================================================
-- 1. ANÁLISE INICIAL DE PERFORMANCE
-- =====================================================

-- Verificar estatísticas das tabelas
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE schemaname = 'public' 
ORDER BY tablename, attname;

-- Verificar tamanho das tabelas
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY size_bytes DESC;

-- =====================================================
-- 2. CRIAÇÃO DE ÍNDICES ESTRATÉGICOS
-- =====================================================

-- Índices para tabela customers (consultas por CPF, email, cidade)
CREATE INDEX IF NOT EXISTS idx_customers_cpf ON public.customers(cpf) WHERE cpf IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customers_city_state ON public.customers(city, state);
CREATE INDEX IF NOT EXISTS idx_customers_segment_id ON public.customers(segment_id);
CREATE INDEX IF NOT EXISTS idx_customers_last_purchase_date ON public.customers(last_purchase_date DESC);

-- Índices para tabela products (consultas por código, categoria, estoque)
CREATE INDEX IF NOT EXISTS idx_products_code ON public.products(code) WHERE code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_segment_id ON public.products(segment_id);
CREATE INDEX IF NOT EXISTS idx_products_stock_low ON public.products(stock_quantity) WHERE stock_quantity <= minimum_stock;
CREATE INDEX IF NOT EXISTS idx_products_price_range ON public.products(price) WHERE price > 0;

-- Índices para tabela sales (consultas por data, cliente, status)
CREATE INDEX IF NOT EXISTS idx_sales_date ON public.sales(date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON public.sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_status ON public.sales(status);
CREATE INDEX IF NOT EXISTS idx_sales_segment_id ON public.sales(segment_id);
CREATE INDEX IF NOT EXISTS idx_sales_payment_method ON public.sales(payment_method);
CREATE INDEX IF NOT EXISTS idx_sales_date_status ON public.sales(date DESC, status);

-- Índices para tabela billings (consultas por data de vencimento, status)
CREATE INDEX IF NOT EXISTS idx_billings_due_date ON public.billings(due_date);
CREATE INDEX IF NOT EXISTS idx_billings_status ON public.billings(status);
CREATE INDEX IF NOT EXISTS idx_billings_customer_id ON public.billings(customer_id);
CREATE INDEX IF NOT EXISTS idx_billings_segment_id ON public.billings(segment_id);
CREATE INDEX IF NOT EXISTS idx_billings_overdue ON public.billings(due_date) WHERE due_date < CURRENT_DATE AND status = 'Pendente';

-- Índices para tabela accounts_payable (consultas por fornecedor, data de vencimento)
CREATE INDEX IF NOT EXISTS idx_accounts_payable_supplier ON public.accounts_payable(supplier);
CREATE INDEX IF NOT EXISTS idx_accounts_payable_due_date ON public.accounts_payable(due_date);
CREATE INDEX IF NOT EXISTS idx_accounts_payable_status ON public.accounts_payable(status);
CREATE INDEX IF NOT EXISTS idx_accounts_payable_segment_id ON public.accounts_payable(segment_id);
CREATE INDEX IF NOT EXISTS idx_accounts_payable_overdue ON public.accounts_payable(due_date) WHERE due_date < CURRENT_DATE AND status = 'pending';

-- Índices para tabela transactions (consultas por data, tipo, categoria)
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_segment_id ON public.transactions(segment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date_type ON public.transactions(date DESC, type);

-- Índices para tabela nfe (consultas por número, data, status)
CREATE INDEX IF NOT EXISTS idx_nfe_number ON public.nfe(number);
CREATE INDEX IF NOT EXISTS idx_nfe_date ON public.nfe(date DESC);
CREATE INDEX IF NOT EXISTS idx_nfe_status ON public.nfe(status);
CREATE INDEX IF NOT EXISTS idx_nfe_customer_name ON public.nfe(customer_name);

-- Índices para tabela users (consultas por email, role, status)
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_users_segment_id ON public.users(segment_id);

-- =====================================================
-- 3. MELHORIAS DE ESTRUTURA
-- =====================================================

-- Adicionar constraints NOT NULL onde apropriado
ALTER TABLE public.customers ALTER COLUMN name SET NOT NULL;
ALTER TABLE public.products ALTER COLUMN name SET NOT NULL;
ALTER TABLE public.sales ALTER COLUMN date SET NOT NULL;
ALTER TABLE public.billings ALTER COLUMN due_date SET NOT NULL;
ALTER TABLE public.accounts_payable ALTER COLUMN due_date SET NOT NULL;

-- Adicionar constraints de check para valores válidos
ALTER TABLE public.products ADD CONSTRAINT chk_products_price_positive CHECK (price >= 0);
ALTER TABLE public.products ADD CONSTRAINT chk_products_stock_positive CHECK (stock_quantity >= 0);
ALTER TABLE public.sales ADD CONSTRAINT chk_sales_quantity_positive CHECK (quantity > 0);
ALTER TABLE public.sales ADD CONSTRAINT chk_sales_total_positive CHECK (total >= 0);
ALTER TABLE public.billings ADD CONSTRAINT chk_billings_amount_positive CHECK (amount >= 0);
ALTER TABLE public.accounts_payable ADD CONSTRAINT chk_accounts_payable_amount_positive CHECK (amount >= 0);

-- =====================================================
-- 4. OTIMIZAÇÃO DE CONSULTAS FREQUENTES
-- =====================================================

-- Criar view materializada para dashboard (atualizada diariamente)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_dashboard_summary AS
SELECT 
    COUNT(DISTINCT c.id) as total_customers,
    COUNT(DISTINCT p.id) as total_products,
    SUM(s.total) as total_sales_month,
    COUNT(s.id) as total_sales_count_month,
    SUM(b.amount) as total_billings_month,
    COUNT(b.id) as total_billings_count_month,
    SUM(ap.amount) as total_accounts_payable_month,
    COUNT(ap.id) as total_accounts_payable_count_month
FROM public.customers c
CROSS JOIN public.products p
LEFT JOIN public.sales s ON s.date >= DATE_TRUNC('month', CURRENT_DATE)
LEFT JOIN public.billings b ON b.due_date >= DATE_TRUNC('month', CURRENT_DATE)
LEFT JOIN public.accounts_payable ap ON ap.due_date >= DATE_TRUNC('month', CURRENT_DATE);

-- Criar índices para a view materializada
CREATE INDEX IF NOT EXISTS idx_mv_dashboard_summary_refresh ON mv_dashboard_summary(1);

-- =====================================================
-- 5. FUNÇÕES DE PERFORMANCE
-- =====================================================

-- Função para atualizar estatísticas de clientes
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS void AS $$
BEGIN
    UPDATE public.customers 
    SET 
        total_purchases = COALESCE((
            SELECT SUM(total) 
            FROM public.sales 
            WHERE customer_id = customers.id
        ), 0),
        last_purchase_date = (
            SELECT MAX(date) 
            FROM public.sales 
            WHERE customer_id = customers.id
        )
    WHERE id IN (
        SELECT DISTINCT customer_id 
        FROM public.sales 
        WHERE customer_id IS NOT NULL
    );
END;
$$ LANGUAGE plpgsql;

-- Função para calcular produtos com estoque baixo
CREATE OR REPLACE FUNCTION get_low_stock_products()
RETURNS TABLE(
    product_id uuid,
    product_name varchar,
    current_stock integer,
    minimum_stock integer,
    days_until_stockout integer
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.stock_quantity,
        p.minimum_stock,
        CASE 
            WHEN p.stock_quantity > 0 THEN 
                (p.stock_quantity / NULLIF((
                    SELECT AVG(quantity) 
                    FROM public.sales 
                    WHERE product = p.name 
                    AND date >= CURRENT_DATE - INTERVAL '30 days'
                ), 0))::integer
            ELSE 0
        END as days_until_stockout
    FROM public.products p
    WHERE p.stock_quantity <= p.minimum_stock
    ORDER BY p.stock_quantity ASC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. TRIGGERS PARA MANUTENÇÃO AUTOMÁTICA
-- =====================================================

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas
DO $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT LIKE 'pg_%'
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_updated_at_trigger ON public.%I;
            CREATE TRIGGER update_updated_at_trigger
                BEFORE UPDATE ON public.%I
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        ', table_record.tablename, table_record.tablename);
    END LOOP;
END $$;

-- =====================================================
-- 7. CONFIGURAÇÕES DE PERFORMANCE
-- =====================================================

-- Configurar work_mem para operações de ordenação
-- (Aplicar apenas se necessário e com monitoramento)
-- ALTER SYSTEM SET work_mem = '256MB';

-- Configurar shared_buffers (se aplicável)
-- ALTER SYSTEM SET shared_buffers = '256MB';

-- =====================================================
-- 8. QUERIES DE MONITORAMENTO
-- =====================================================

-- Query para monitorar performance de índices
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;

-- Query para identificar queries lentas
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Query para monitorar tamanho dos índices
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes 
ORDER BY pg_relation_size(indexrelid) DESC;

-- =====================================================
-- 9. SCRIPT DE LIMPEZA E MANUTENÇÃO
-- =====================================================

-- Função para limpeza de dados antigos (opcional)
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Limpar logs antigos (exemplo)
    -- DELETE FROM public.audit_logs WHERE created_at < CURRENT_DATE - INTERVAL '1 year';
    
    -- Atualizar estatísticas
    ANALYZE;
    
    -- Vacuum (se necessário)
    -- VACUUM ANALYZE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FIM DO SCRIPT DE OTIMIZAÇÃO
-- =====================================================

-- Comentário: Execute este script em ambiente de teste primeiro
-- e monitore a performance antes de aplicar em produção 