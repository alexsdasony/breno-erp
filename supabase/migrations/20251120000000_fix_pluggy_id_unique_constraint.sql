-- =====================================================
-- CORREÇÃO: Constraint UNIQUE explícita para pluggy_id
-- =====================================================
-- O índice único parcial não é reconhecido pelo ON CONFLICT
-- Precisamos criar uma constraint UNIQUE explícita

-- Remover o índice único parcial existente (se existir)
DROP INDEX IF EXISTS idx_financial_transactions_pluggy_id;

-- Criar constraint UNIQUE explícita para pluggy_id
-- Isso permite usar ON CONFLICT (pluggy_id) no upsert
ALTER TABLE public.financial_transactions
  DROP CONSTRAINT IF EXISTS financial_transactions_pluggy_id_unique;

ALTER TABLE public.financial_transactions
  ADD CONSTRAINT financial_transactions_pluggy_id_unique
  UNIQUE (pluggy_id);

-- Criar índice adicional para performance (não único, apenas para busca)
CREATE INDEX IF NOT EXISTS idx_financial_transactions_pluggy_id_idx
  ON public.financial_transactions(pluggy_id)
  WHERE pluggy_id IS NOT NULL;

