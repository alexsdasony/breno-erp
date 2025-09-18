-- Verificar se há dados na tabela payment_methods
SELECT 'payment_methods' as tabela, count(*) as total FROM payment_methods;

-- Verificar registros sem payment_method_id
SELECT 
  'financial_documents sem payment_method_id' as descricao,
  count(*) as total 
FROM financial_documents 
WHERE direction = 'payable' AND payment_method_id IS NULL;

-- Associar registros existentes a uma forma de pagamento padrão
-- Primeiro, vamos pegar o ID do primeiro payment_method
WITH default_payment_method AS (
  SELECT id FROM payment_methods WHERE name = 'Boleto' LIMIT 1
)
UPDATE financial_documents 
SET payment_method_id = (SELECT id FROM default_payment_method)
WHERE direction = 'payable' 
  AND payment_method_id IS NULL;

-- Verificar se a atualização funcionou
SELECT 
  'financial_documents com payment_method_id após update' as descricao,
  count(*) as total 
FROM financial_documents 
WHERE direction = 'payable' AND payment_method_id IS NOT NULL;
