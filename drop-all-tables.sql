-- Script para dropar todas as tabelas do sistema Breno ERP
-- Execute este script com cuidado, pois irá remover todos os dados

-- Desabilitar verificações de chave estrangeira temporariamente
SET session_replication_role = replica;

-- Dropar tabelas em ordem (primeiro as que dependem de outras)
DROP TABLE IF EXISTS sale_items CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS billings CASCADE;
DROP TABLE IF EXISTS nfes CASCADE;
DROP TABLE IF EXISTS accounts_payable CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS cost_center_accounts CASCADE;
DROP TABLE IF EXISTS receita_consultas CASCADE;

-- Dropar tabelas principais
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS cost_centers CASCADE;
DROP TABLE IF EXISTS segments CASCADE;
DROP TABLE IF EXISTS chart_of_accounts CASCADE;
DROP TABLE IF EXISTS integrations CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Reabilitar verificações de chave estrangeira
SET session_replication_role = DEFAULT;

-- Verificar se todas as tabelas foram removidas
SELECT 
    schemaname,
    tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN (
        'accounts_payable',
        'billings',
        'chart_of_accounts',
        'cost_center_accounts',
        'cost_centers',
        'customers',
        'integrations',
        'nfes',
        'products',
        'receita_consultas',
        'sale_items',
        'sales',
        'segments',
        'transactions',
        'users'
    );

-- Mensagem de confirmação
DO $$
BEGIN
    RAISE NOTICE 'Todas as tabelas foram removidas com sucesso!';
END $$; 