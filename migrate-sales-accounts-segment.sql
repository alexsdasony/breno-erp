-- Migração para adicionar segment_id nas tabelas sales e accounts_payable

-- 1. Adicionar campo segment_id em sales
ALTER TABLE sales 
ADD COLUMN segment_id INTEGER;

-- 2. Adicionar foreign key em sales
ALTER TABLE sales 
ADD CONSTRAINT fk_sales_segment_id 
FOREIGN KEY (segment_id) REFERENCES segments(id);

-- 3. Adicionar campo segment_id em accounts_payable
ALTER TABLE accounts_payable 
ADD COLUMN segment_id INTEGER;

-- 4. Adicionar foreign key em accounts_payable
ALTER TABLE accounts_payable 
ADD CONSTRAINT fk_accounts_payable_segment_id 
FOREIGN KEY (segment_id) REFERENCES segments(id); 