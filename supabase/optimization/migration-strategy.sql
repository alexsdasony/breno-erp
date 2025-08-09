-- =====================================================
-- ESTRATÉGIA DE MIGRAÇÃO E ROLLBACK - BRENO ERP
-- =====================================================
-- Data: $(date)
-- Versão: 1.0
-- Descrição: Scripts de migração segura com rollback

-- =====================================================
-- 1. SCRIPT DE BACKUP ANTES DA MIGRAÇÃO
-- =====================================================

-- Criar backup das configurações atuais
CREATE TABLE IF NOT EXISTS backup_indexes AS
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public';

-- Backup das constraints existentes
CREATE TABLE IF NOT EXISTS backup_constraints AS
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public';

-- Backup das estatísticas
CREATE TABLE IF NOT EXISTS backup_stats AS
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE schemaname = 'public';

-- =====================================================
-- 2. SCRIPT DE MIGRAÇÃO PRINCIPAL
-- =====================================================

-- Função para executar migração com controle de transação
CREATE OR REPLACE FUNCTION execute_migration_safely()
RETURNS text AS $$
DECLARE
    migration_step text;
    error_message text;
    start_time timestamp;
    end_time timestamp;
BEGIN
    start_time := clock_timestamp();
    
    -- Log do início da migração
    RAISE NOTICE 'Iniciando migração de otimização do banco de dados...';
    
    -- Passo 1: Criar índices em modo CONCURRENT (não bloqueia)
    BEGIN
        RAISE NOTICE 'Passo 1: Criando índices estratégicos...';
        
        -- Índices para customers
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_cpf 
        ON public.customers(cpf) WHERE cpf IS NOT NULL;
        
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_email 
        ON public.customers(email) WHERE email IS NOT NULL;
        
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_city_state 
        ON public.customers(city, state);
        
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_segment_id 
        ON public.customers(segment_id);
        
        -- Índices para products
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_code 
        ON public.products(code) WHERE code IS NOT NULL;
        
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category 
        ON public.products(category);
        
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_segment_id 
        ON public.products(segment_id);
        
        -- Índices para sales
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_date 
        ON public.sales(date DESC);
        
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_customer_id 
        ON public.sales(customer_id);
        
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_status 
        ON public.sales(status);
        
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_segment_id 
        ON public.sales(segment_id);
        
        -- Índices para billings
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_billings_due_date 
        ON public.billings(due_date);
        
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_billings_status 
        ON public.billings(status);
        
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_billings_customer_id 
        ON public.billings(customer_id);
        
        -- Índices para accounts_payable
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_accounts_payable_supplier 
        ON public.accounts_payable(supplier);
        
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_accounts_payable_due_date 
        ON public.accounts_payable(due_date);
        
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_accounts_payable_status 
        ON public.accounts_payable(status);
        
        RAISE NOTICE 'Passo 1 concluído: Índices criados com sucesso';
        
    EXCEPTION WHEN OTHERS THEN
        error_message := 'Erro no Passo 1 (Criação de índices): ' || SQLERRM;
        RAISE EXCEPTION '%', error_message;
    END;
    
    -- Passo 2: Adicionar constraints de validação
    BEGIN
        RAISE NOTICE 'Passo 2: Adicionando constraints de validação...';
        
        -- Constraints para products
        ALTER TABLE public.products 
        ADD CONSTRAINT IF NOT EXISTS chk_products_price_positive 
        CHECK (price >= 0);
        
        ALTER TABLE public.products 
        ADD CONSTRAINT IF NOT EXISTS chk_products_stock_positive 
        CHECK (stock_quantity >= 0);
        
        -- Constraints para sales
        ALTER TABLE public.sales 
        ADD CONSTRAINT IF NOT EXISTS chk_sales_quantity_positive 
        CHECK (quantity > 0);
        
        ALTER TABLE public.sales 
        ADD CONSTRAINT IF NOT EXISTS chk_sales_total_positive 
        CHECK (total >= 0);
        
        -- Constraints para billings
        ALTER TABLE public.billings 
        ADD CONSTRAINT IF NOT EXISTS chk_billings_amount_positive 
        CHECK (amount >= 0);
        
        -- Constraints para accounts_payable
        ALTER TABLE public.accounts_payable 
        ADD CONSTRAINT IF NOT EXISTS chk_accounts_payable_amount_positive 
        CHECK (amount >= 0);
        
        RAISE NOTICE 'Passo 2 concluído: Constraints adicionadas com sucesso';
        
    EXCEPTION WHEN OTHERS THEN
        error_message := 'Erro no Passo 2 (Constraints): ' || SQLERRM;
        RAISE EXCEPTION '%', error_message;
    END;
    
    -- Passo 3: Criar funções de performance
    BEGIN
        RAISE NOTICE 'Passo 3: Criando funções de performance...';
        
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
        
        -- Função para produtos com estoque baixo
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
        
        RAISE NOTICE 'Passo 3 concluído: Funções criadas com sucesso';
        
    EXCEPTION WHEN OTHERS THEN
        error_message := 'Erro no Passo 3 (Funções): ' || SQLERRM;
        RAISE EXCEPTION '%', error_message;
    END;
    
    -- Passo 4: Criar view materializada
    BEGIN
        RAISE NOTICE 'Passo 4: Criando view materializada...';
        
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
        
        RAISE NOTICE 'Passo 4 concluído: View materializada criada com sucesso';
        
    EXCEPTION WHEN OTHERS THEN
        error_message := 'Erro no Passo 4 (View materializada): ' || SQLERRM;
        RAISE EXCEPTION '%', error_message;
    END;
    
    -- Passo 5: Atualizar estatísticas
    BEGIN
        RAISE NOTICE 'Passo 5: Atualizando estatísticas...';
        
        ANALYZE public.customers;
        ANALYZE public.products;
        ANALYZE public.sales;
        ANALYZE public.billings;
        ANALYZE public.accounts_payable;
        ANALYZE public.transactions;
        
        RAISE NOTICE 'Passo 5 concluído: Estatísticas atualizadas';
        
    EXCEPTION WHEN OTHERS THEN
        error_message := 'Erro no Passo 5 (Estatísticas): ' || SQLERRM;
        RAISE EXCEPTION '%', error_message;
    END;
    
    end_time := clock_timestamp();
    
    RETURN 'Migração concluída com sucesso em ' || 
           EXTRACT(EPOCH FROM (end_time - start_time)) || ' segundos';
           
EXCEPTION WHEN OTHERS THEN
    -- Log do erro
    RAISE NOTICE 'Erro durante a migração: %', SQLERRM;
    RETURN 'Erro na migração: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. SCRIPT DE ROLLBACK
-- =====================================================

-- Função para executar rollback
CREATE OR REPLACE FUNCTION execute_rollback()
RETURNS text AS $$
DECLARE
    rollback_step text;
    error_message text;
    start_time timestamp;
    end_time timestamp;
BEGIN
    start_time := clock_timestamp();
    
    RAISE NOTICE 'Iniciando rollback da migração...';
    
    -- Passo 1: Remover view materializada
    BEGIN
        RAISE NOTICE 'Passo 1: Removendo view materializada...';
        DROP MATERIALIZED VIEW IF EXISTS mv_dashboard_summary;
        RAISE NOTICE 'Passo 1 concluído: View materializada removida';
    EXCEPTION WHEN OTHERS THEN
        error_message := 'Erro no Passo 1 (View materializada): ' || SQLERRM;
        RAISE EXCEPTION '%', error_message;
    END;
    
    -- Passo 2: Remover funções
    BEGIN
        RAISE NOTICE 'Passo 2: Removendo funções...';
        DROP FUNCTION IF EXISTS update_customer_stats();
        DROP FUNCTION IF EXISTS get_low_stock_products();
        RAISE NOTICE 'Passo 2 concluído: Funções removidas';
    EXCEPTION WHEN OTHERS THEN
        error_message := 'Erro no Passo 2 (Funções): ' || SQLERRM;
        RAISE EXCEPTION '%', error_message;
    END;
    
    -- Passo 3: Remover constraints
    BEGIN
        RAISE NOTICE 'Passo 3: Removendo constraints...';
        
        ALTER TABLE public.products DROP CONSTRAINT IF EXISTS chk_products_price_positive;
        ALTER TABLE public.products DROP CONSTRAINT IF EXISTS chk_products_stock_positive;
        ALTER TABLE public.sales DROP CONSTRAINT IF EXISTS chk_sales_quantity_positive;
        ALTER TABLE public.sales DROP CONSTRAINT IF EXISTS chk_sales_total_positive;
        ALTER TABLE public.billings DROP CONSTRAINT IF EXISTS chk_billings_amount_positive;
        ALTER TABLE public.accounts_payable DROP CONSTRAINT IF EXISTS chk_accounts_payable_amount_positive;
        
        RAISE NOTICE 'Passo 3 concluído: Constraints removidas';
    EXCEPTION WHEN OTHERS THEN
        error_message := 'Erro no Passo 3 (Constraints): ' || SQLERRM;
        RAISE EXCEPTION '%', error_message;
    END;
    
    -- Passo 4: Remover índices
    BEGIN
        RAISE NOTICE 'Passo 4: Removendo índices...';
        
        DROP INDEX IF EXISTS idx_customers_cpf;
        DROP INDEX IF EXISTS idx_customers_email;
        DROP INDEX IF EXISTS idx_customers_city_state;
        DROP INDEX IF EXISTS idx_customers_segment_id;
        DROP INDEX IF EXISTS idx_products_code;
        DROP INDEX IF EXISTS idx_products_category;
        DROP INDEX IF EXISTS idx_products_segment_id;
        DROP INDEX IF EXISTS idx_sales_date;
        DROP INDEX IF EXISTS idx_sales_customer_id;
        DROP INDEX IF EXISTS idx_sales_status;
        DROP INDEX IF EXISTS idx_sales_segment_id;
        DROP INDEX IF EXISTS idx_billings_due_date;
        DROP INDEX IF EXISTS idx_billings_status;
        DROP INDEX IF EXISTS idx_billings_customer_id;
        DROP INDEX IF EXISTS idx_accounts_payable_supplier;
        DROP INDEX IF EXISTS idx_accounts_payable_due_date;
        DROP INDEX IF EXISTS idx_accounts_payable_status;
        
        RAISE NOTICE 'Passo 4 concluído: Índices removidos';
    EXCEPTION WHEN OTHERS THEN
        error_message := 'Erro no Passo 4 (Índices): ' || SQLERRM;
        RAISE EXCEPTION '%', error_message;
    END;
    
    end_time := clock_timestamp();
    
    RETURN 'Rollback concluído com sucesso em ' || 
           EXTRACT(EPOCH FROM (end_time - start_time)) || ' segundos';
           
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Erro durante o rollback: %', SQLERRM;
    RETURN 'Erro no rollback: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. SCRIPT DE VERIFICAÇÃO PÓS-MIGRAÇÃO
-- =====================================================

-- Função para verificar se a migração foi bem-sucedida
CREATE OR REPLACE FUNCTION verify_migration()
RETURNS TABLE(
    check_item text,
    status text,
    details text
) AS $$
BEGIN
    -- Verificar se os índices foram criados
    RETURN QUERY
    SELECT 
        'Índices criados'::text as check_item,
        CASE 
            WHEN COUNT(*) >= 15 THEN 'OK'::text
            ELSE 'FALHA'::text
        END as status,
        COUNT(*)::text || ' índices encontrados' as details
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND indexname LIKE 'idx_%';
    
    -- Verificar se as constraints foram adicionadas
    RETURN QUERY
    SELECT 
        'Constraints adicionadas'::text as check_item,
        CASE 
            WHEN COUNT(*) >= 6 THEN 'OK'::text
            ELSE 'FALHA'::text
        END as status,
        COUNT(*)::text || ' constraints encontradas' as details
    FROM information_schema.table_constraints 
    WHERE table_schema = 'public' 
    AND constraint_name LIKE 'chk_%';
    
    -- Verificar se as funções foram criadas
    RETURN QUERY
    SELECT 
        'Funções criadas'::text as check_item,
        CASE 
            WHEN COUNT(*) >= 2 THEN 'OK'::text
            ELSE 'FALHA'::text
        END as status,
        COUNT(*)::text || ' funções encontradas' as details
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' 
    AND p.proname IN ('update_customer_stats', 'get_low_stock_products');
    
    -- Verificar se a view materializada foi criada
    RETURN QUERY
    SELECT 
        'View materializada criada'::text as check_item,
        CASE 
            WHEN COUNT(*) = 1 THEN 'OK'::text
            ELSE 'FALHA'::text
        END as status,
        CASE 
            WHEN COUNT(*) = 1 THEN 'View encontrada'::text
            ELSE 'View não encontrada'::text
        END as details
    FROM pg_matviews 
    WHERE schemaname = 'public' 
    AND matviewname = 'mv_dashboard_summary';
    
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. COMANDOS DE EXECUÇÃO
-- =====================================================

-- Para executar a migração:
-- SELECT execute_migration_safely();

-- Para verificar se a migração foi bem-sucedida:
-- SELECT * FROM verify_migration();

-- Para executar rollback (se necessário):
-- SELECT execute_rollback();

-- =====================================================
-- 6. SCRIPT DE LIMPEZA DOS BACKUPS
-- =====================================================

-- Função para limpar backups após confirmação
CREATE OR REPLACE FUNCTION cleanup_backups()
RETURNS text AS $$
BEGIN
    DROP TABLE IF EXISTS backup_indexes;
    DROP TABLE IF EXISTS backup_constraints;
    DROP TABLE IF EXISTS backup_stats;
    
    RETURN 'Backups removidos com sucesso';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FIM DO SCRIPT DE MIGRAÇÃO
-- =====================================================

-- Comentário: Execute a migração em ambiente de teste primeiro
-- e confirme que tudo está funcionando antes de aplicar em produção 