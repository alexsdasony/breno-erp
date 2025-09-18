-- Verificar dados na tabela payment_methods
SELECT 'payment_methods' as tabela, count(*) as total FROM payment_methods;

-- Verificar dados na tabela financial_documents
SELECT 'financial_documents' as tabela, count(*) as total FROM financial_documents WHERE direction = 'payable';

-- Verificar se há payment_method_id associado
SELECT 
  'financial_documents com payment_method_id' as descricao,
  count(*) as total 
FROM financial_documents 
WHERE direction = 'payable' AND payment_method_id IS NOT NULL;

-- Verificar dados de payment_methods
SELECT id, name, nfe_code FROM payment_methods ORDER BY created_at;

-- Verificar alguns registros de financial_documents
SELECT 
  id, 
  description, 
  payment_method_id, 
  status,
  created_at 
FROM financial_documents 
WHERE direction = 'payable' 
ORDER BY created_at DESC 
LIMIT 5;
