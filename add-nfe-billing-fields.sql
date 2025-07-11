-- Adicionar campos necessários para integração NF-e -> Cobranças (PostgreSQL)
ALTER TABLE billings ADD COLUMN IF NOT EXISTS nfe_id INTEGER;
ALTER TABLE billings ADD COLUMN IF NOT EXISTS description TEXT;

-- Adicionar foreign key para nfe_id
ALTER TABLE billings ADD CONSTRAINT IF NOT EXISTS fk_billings_nfe_id 
FOREIGN KEY (nfe_id) REFERENCES nfe(id);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_billings_nfe_id ON billings(nfe_id); 