-- =====================================================
-- QUERIES OTIMIZADAS E BENCHMARKS - BRENO ERP
-- =====================================================
-- Data: $(date)
-- Versão: 1.0
-- Descrição: Queries otimizadas com análise de performance

-- =====================================================
-- 1. QUERIES DE DASHBOARD OTIMIZADAS
-- =====================================================

-- Dashboard - Resumo geral (OTIMIZADA)
-- Tempo esperado: < 100ms
EXPLAIN (ANALYZE, BUFFERS) 
SELECT 
    (SELECT COUNT(*) FROM public.customers) as total_customers,
    (SELECT COUNT(*) FROM public.products) as total_products,
    (SELECT COALESCE(SUM(total), 0) FROM public.sales WHERE date >= CURRENT_DATE - INTERVAL '30 days') as sales_month,
    (SELECT COALESCE(SUM(amount), 0) FROM public.billings WHERE due_date >= CURRENT_DATE - INTERVAL '30 days') as billings_month,
    (SELECT COALESCE(SUM(amount), 0) FROM public.accounts_payable WHERE due_date >= CURRENT_DATE - INTERVAL '30 days') as payables_month;

-- Dashboard - Vendas por período (OTIMIZADA)
-- Tempo esperado: < 50ms
EXPLAIN (ANALYZE, BUFFERS)
SELECT 
    DATE_TRUNC('day', date) as sale_date,
    COUNT(*) as total_sales,
    SUM(total) as total_amount,
    AVG(total) as avg_amount
FROM public.sales 
WHERE date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE_TRUNC('day', date)
ORDER BY sale_date DESC;

-- Dashboard - Top clientes (OTIMIZADA)
-- Tempo esperado: < 80ms
EXPLAIN (ANALYZE, BUFFERS)
SELECT 
    c.name,
    c.email,
    COUNT(s.id) as total_purchases,
    SUM(s.total) as total_spent,
    MAX(s.date) as last_purchase
FROM public.customers c
INNER JOIN public.sales s ON c.id = s.customer_id
WHERE s.date >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY c.id, c.name, c.email
ORDER BY total_spent DESC
LIMIT 10;

-- =====================================================
-- 2. QUERIES DE RELATÓRIOS OTIMIZADAS
-- =====================================================

-- Relatório de vendas por produto (OTIMIZADA)
-- Tempo esperado: < 120ms
EXPLAIN (ANALYZE, BUFFERS)
SELECT 
    p.name as product_name,
    p.category,
    COUNT(s.id) as times_sold,
    SUM(s.quantity) as total_quantity,
    SUM(s.total) as total_revenue,
    AVG(s.total / s.quantity) as avg_price
FROM public.products p
LEFT JOIN public.sales s ON p.name = s.product
WHERE s.date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY p.id, p.name, p.category
ORDER BY total_revenue DESC;

-- Relatório de contas a receber (OTIMIZADA)
-- Tempo esperado: < 60ms
EXPLAIN (ANALYZE, BUFFERS)
SELECT 
    c.name as customer_name,
    c.email,
    COUNT(b.id) as total_billings,
    SUM(b.amount) as total_amount,
    SUM(CASE WHEN b.due_date < CURRENT_DATE AND b.status = 'Pendente' THEN b.amount ELSE 0 END) as overdue_amount,
    COUNT(CASE WHEN b.due_date < CURRENT_DATE AND b.status = 'Pendente' THEN 1 END) as overdue_count
FROM public.customers c
INNER JOIN public.billings b ON c.id = b.customer_id
WHERE b.due_date >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY c.id, c.name, c.email
ORDER BY overdue_amount DESC;

-- Relatório de contas a pagar (OTIMIZADA)
-- Tempo esperado: < 50ms
EXPLAIN (ANALYZE, BUFFERS)
SELECT 
    supplier,
    COUNT(*) as total_bills,
    SUM(amount) as total_amount,
    SUM(CASE WHEN due_date < CURRENT_DATE AND status = 'pending' THEN amount ELSE 0 END) as overdue_amount,
    AVG(amount) as avg_amount
FROM public.accounts_payable
WHERE due_date >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY supplier
ORDER BY overdue_amount DESC;

-- =====================================================
-- 3. QUERIES DE INVENTÁRIO OTIMIZADAS
-- =====================================================

-- Produtos com estoque baixo (OTIMIZADA)
-- Tempo esperado: < 30ms
EXPLAIN (ANALYZE, BUFFERS)
SELECT 
    name,
    code,
    stock_quantity,
    minimum_stock,
    price,
    category,
    CASE 
        WHEN stock_quantity = 0 THEN 'Sem estoque'
        WHEN stock_quantity <= minimum_stock THEN 'Estoque baixo'
        ELSE 'Estoque OK'
    END as stock_status
FROM public.products
WHERE stock_quantity <= minimum_stock
ORDER BY stock_quantity ASC;

-- Movimentação de estoque (OTIMIZADA)
-- Tempo esperado: < 100ms
EXPLAIN (ANALYZE, BUFFERS)
SELECT 
    p.name as product_name,
    p.code,
    COUNT(s.id) as sales_count,
    SUM(s.quantity) as total_sold,
    p.stock_quantity as current_stock,
    p.minimum_stock,
    ROUND(
        (p.stock_quantity::numeric / NULLIF(SUM(s.quantity), 0)) * 30, 2
    ) as days_until_stockout
FROM public.products p
LEFT JOIN public.sales s ON p.name = s.product 
    AND s.date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY p.id, p.name, p.code, p.stock_quantity, p.minimum_stock
HAVING SUM(s.quantity) > 0
ORDER BY days_until_stockout ASC;

-- =====================================================
-- 4. QUERIES DE ANÁLISE FINANCEIRA
-- =====================================================

-- Fluxo de caixa (OTIMIZADA)
-- Tempo esperado: < 150ms
EXPLAIN (ANALYZE, BUFFERS)
WITH cash_flow AS (
    SELECT 
        DATE_TRUNC('day', date) as flow_date,
        'receita' as type,
        SUM(total) as amount
    FROM public.sales 
    WHERE date >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY DATE_TRUNC('day', date)
    
    UNION ALL
    
    SELECT 
        DATE_TRUNC('day', due_date) as flow_date,
        'despesa' as type,
        SUM(amount) as amount
    FROM public.accounts_payable 
    WHERE due_date >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY DATE_TRUNC('day', due_date)
)
SELECT 
    flow_date,
    SUM(CASE WHEN type = 'receita' THEN amount ELSE 0 END) as receitas,
    SUM(CASE WHEN type = 'despesa' THEN amount ELSE 0 END) as despesas,
    SUM(CASE WHEN type = 'receita' THEN amount ELSE -amount END) as saldo
FROM cash_flow
GROUP BY flow_date
ORDER BY flow_date DESC;

-- Análise de lucratividade por produto (OTIMIZADA)
-- Tempo esperado: < 200ms
EXPLAIN (ANALYZE, BUFFERS)
SELECT 
    p.name as product_name,
    p.category,
    COUNT(s.id) as sales_count,
    SUM(s.quantity) as total_quantity,
    SUM(s.total) as total_revenue,
    SUM(s.quantity * p.cost_price) as total_cost,
    SUM(s.total - (s.quantity * p.cost_price)) as total_profit,
    ROUND(
        ((SUM(s.total - (s.quantity * p.cost_price)) / SUM(s.total)) * 100), 2
    ) as profit_margin_percent
FROM public.products p
INNER JOIN public.sales s ON p.name = s.product
WHERE s.date >= CURRENT_DATE - INTERVAL '30 days'
    AND p.cost_price > 0
GROUP BY p.id, p.name, p.category
ORDER BY total_profit DESC;

-- =====================================================
-- 5. QUERIES DE MONITORAMENTO DE PERFORMANCE
-- =====================================================

-- Monitorar uso de índices
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Identificar queries lentas
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows,
    shared_blks_hit,
    shared_blks_read
FROM pg_stat_statements 
WHERE query LIKE '%public.%'
ORDER BY mean_time DESC 
LIMIT 10;

-- Monitorar tamanho das tabelas
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- =====================================================
-- 6. BENCHMARKS DE PERFORMANCE
-- =====================================================

-- Benchmark 1: Consulta de clientes por cidade
-- Versão NÃO otimizada (para comparação)
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT name, email, phone, total_purchases
FROM public.customers
WHERE city = 'São Paulo'
ORDER BY total_purchases DESC;

-- Benchmark 2: Consulta de vendas por período
-- Versão NÃO otimizada (para comparação)
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT 
    c.name as customer_name,
    s.product,
    s.quantity,
    s.total,
    s.date
FROM public.sales s
JOIN public.customers c ON s.customer_id = c.id
WHERE s.date BETWEEN '2024-01-01' AND '2024-12-31'
ORDER BY s.date DESC;

-- Benchmark 3: Consulta de produtos com estoque baixo
-- Versão NÃO otimizada (para comparação)
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT name, stock_quantity, minimum_stock
FROM public.products
WHERE stock_quantity <= minimum_stock
ORDER BY stock_quantity ASC;

-- =====================================================
-- 7. QUERIES DE MANUTENÇÃO
-- =====================================================

-- Atualizar estatísticas das tabelas
ANALYZE public.customers;
ANALYZE public.products;
ANALYZE public.sales;
ANALYZE public.billings;
ANALYZE public.accounts_payable;
ANALYZE public.transactions;

-- Verificar fragmentação de tabelas
SELECT 
    schemaname,
    tablename,
    n_tup_ins,
    n_tup_upd,
    n_tup_del,
    n_live_tup,
    n_dead_tup,
    ROUND(n_dead_tup::numeric / NULLIF(n_live_tup + n_dead_tup, 0) * 100, 2) as dead_tup_percent
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY dead_tup_percent DESC;

-- =====================================================
-- 8. QUERIES DE CACHE E VIEWS MATERIALIZADAS
-- =====================================================

-- Atualizar view materializada do dashboard
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_summary;

-- Verificar uso de cache
SELECT 
    sum(heap_blks_read) as heap_read,
    sum(heap_blks_hit) as heap_hit,
    round(sum(heap_blks_hit) * 100.0 / (sum(heap_blks_hit) + sum(heap_blks_read)), 2) as cache_hit_ratio
FROM pg_statio_user_tables;

-- =====================================================
-- FIM DAS QUERIES OTIMIZADAS
-- =====================================================

-- Comentário: Execute estas queries com EXPLAIN ANALYZE para medir performance
-- Compare os tempos antes e depois das otimizações 