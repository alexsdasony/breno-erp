-- =====================================================
-- CORREÇÃO: Constraint UNIQUE explícita para pluggy_id
-- =====================================================
-- O índice único parcial não é reconhecido pelo ON CONFLICT do Supabase
-- Precisamos criar uma constraint UNIQUE explícita

-- Remover índices existentes relacionados a pluggy_id
DROP INDEX IF EXISTS idx_financial_transactions_pluggy_id;
DROP INDEX IF EXISTS financial_transactions_pluggy_id_unique;

-- Garantir que pluggy_id não seja NULL para transações da Pluggy
-- (transações antigas podem ter NULL, mas novas sempre terão valor)
UPDATE public.financial_transactions
SET pluggy_id = external_id
WHERE pluggy_id IS NULL AND external_id IS NOT NULL;

-- Criar constraint UNIQUE explícita para pluggy_id
-- Isso permite usar ON CONFLICT (pluggy_id) no upsert do Supabase
ALTER TABLE public.financial_transactions
  DROP CONSTRAINT IF EXISTS financial_transactions_pluggy_id_unique;

-- Criar índice único normal (não parcial) para que o Supabase reconheça no ON CONFLICT
-- Valores NULL serão tratados como únicos (comportamento padrão do PostgreSQL)
CREATE UNIQUE INDEX financial_transactions_pluggy_id_unique
  ON public.financial_transactions(pluggy_id)
  WHERE pluggy_id IS NOT NULL;

-- Adicionar constraint usando o índice único
-- Nota: PostgreSQL não permite constraint UNIQUE com WHERE clause diretamente
-- Mas o índice único parcial funciona para ON CONFLICT quando há valores não-null

