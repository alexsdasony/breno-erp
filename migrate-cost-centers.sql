-- Migração para adicionar segment_id à tabela cost_centers
-- Execute este script para sincronizar a estrutura da tabela

-- 1. Adicionar o campo segment_id
ALTER TABLE cost_centers 
ADD COLUMN segment_id INTEGER;

-- 2. Adicionar a foreign key constraint
ALTER TABLE cost_centers 
ADD CONSTRAINT fk_cost_centers_segment_id 
FOREIGN KEY (segment_id) REFERENCES segments(id);

-- 3. Verificar a estrutura atualizada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'cost_centers' 
ORDER BY ordinal_position;

-- 4. Verificar se a migração foi bem-sucedida
SELECT COUNT(*) as total_cost_centers FROM cost_centers; 