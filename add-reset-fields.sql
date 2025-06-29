-- Adicionar campos para reset de senha na tabela users
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_code VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_code_expiry TIMESTAMP;

-- Adicionar comentários para documentação
COMMENT ON COLUMN users.phone IS 'Número de telefone para reset de senha via WhatsApp';
COMMENT ON COLUMN users.reset_code IS 'Código de verificação para reset de senha';
COMMENT ON COLUMN users.reset_code_expiry IS 'Data/hora de expiração do código de reset';

-- Verificar se os campos foram adicionados
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('phone', 'reset_code', 'reset_code_expiry')
ORDER BY column_name; 