-- =====================================================
-- ATUALIZAÇÃO: financial_transactions para Pluggy
-- =====================================================

-- Adicionar colunas faltantes
ALTER TABLE public.financial_transactions
  ADD COLUMN IF NOT EXISTS pluggy_id text,
  ADD COLUMN IF NOT EXISTS item_id text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS status varchar(50),
  ADD COLUMN IF NOT EXISTS segment_id uuid REFERENCES segments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS raw jsonb,
  ADD COLUMN IF NOT EXISTS direction varchar(20) CHECK (direction IN ('receivable', 'payable'));

-- Criar índice único para pluggy_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_financial_transactions_pluggy_id
  ON public.financial_transactions(pluggy_id)
  WHERE pluggy_id IS NOT NULL;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_financial_transactions_item_id
  ON public.financial_transactions(item_id);

CREATE INDEX IF NOT EXISTS idx_financial_transactions_segment_id
  ON public.financial_transactions(segment_id);

CREATE INDEX IF NOT EXISTS idx_financial_transactions_status
  ON public.financial_transactions(status);

CREATE INDEX IF NOT EXISTS idx_financial_transactions_category
  ON public.financial_transactions(category);

CREATE INDEX IF NOT EXISTS idx_financial_transactions_direction
  ON public.financial_transactions(direction);

-- Criar índice GIN para busca em JSONB
CREATE INDEX IF NOT EXISTS idx_financial_transactions_raw_gin
  ON public.financial_transactions USING gin(raw);

-- Migrar external_id para pluggy_id se necessário
-- (manter ambos por compatibilidade, mas pluggy_id será o principal)
UPDATE public.financial_transactions
SET pluggy_id = external_id
WHERE pluggy_id IS NULL AND external_id IS NOT NULL;

-- Comentários nas colunas
COMMENT ON COLUMN public.financial_transactions.pluggy_id IS 'ID único da transação na Pluggy (evita duplicatas)';
COMMENT ON COLUMN public.financial_transactions.item_id IS 'ID do item (conexão) na Pluggy';
COMMENT ON COLUMN public.financial_transactions.direction IS 'Direção da transação: receivable (receita) ou payable (despesa)';
COMMENT ON COLUMN public.financial_transactions.raw IS 'Dados brutos da transação retornados pela API Pluggy';


