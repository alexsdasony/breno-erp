-- =====================================================
-- MIGRATION COMPLETA - INTEGRAÇÃO PLUGGY
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- =====================================================
-- PASSO 1: Criar tabela financial_transactions
-- =====================================================
CREATE TABLE IF NOT EXISTS public.financial_transactions (
  id SERIAL PRIMARY KEY,
  external_id varchar(100),
  date date NOT NULL,
  description text,
  amount numeric(12,2) NOT NULL,
  type varchar(20) NOT NULL CHECK (type IN ('receita','despesa')),
  institution varchar(100),
  account_id varchar(50) NOT NULL,
  balance numeric(12,2),
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_financial_transactions_external_id
  ON public.financial_transactions(external_id)
  WHERE external_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_financial_transactions_date
  ON public.financial_transactions(date);

CREATE INDEX IF NOT EXISTS idx_financial_transactions_account_id
  ON public.financial_transactions(account_id);

-- Trigger para manter updated_at sincronizado
CREATE OR REPLACE FUNCTION public.update_financial_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_financial_transactions_updated_at
  ON public.financial_transactions;

CREATE TRIGGER trg_financial_transactions_updated_at
  BEFORE UPDATE ON public.financial_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_financial_transactions_updated_at();

-- =====================================================
-- PASSO 2: Adicionar colunas Pluggy à financial_transactions
-- =====================================================
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

-- Comentários nas colunas
COMMENT ON COLUMN public.financial_transactions.pluggy_id IS 'ID único da transação na Pluggy (evita duplicatas)';
COMMENT ON COLUMN public.financial_transactions.item_id IS 'ID do item (conexão) na Pluggy';
COMMENT ON COLUMN public.financial_transactions.direction IS 'Direção da transação: receivable (receita) ou payable (despesa)';
COMMENT ON COLUMN public.financial_transactions.raw IS 'Dados brutos da transação retornados pela API Pluggy';

-- =====================================================
-- PASSO 3: Criar tabela pluggy_items
-- =====================================================
CREATE TABLE IF NOT EXISTS public.pluggy_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id text UNIQUE NOT NULL,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  segment_id uuid REFERENCES segments(id) ON DELETE SET NULL,
  connector_id text,
  connector_name text,
  status varchar(50),
  execution_status varchar(50),
  error text,
  metadata jsonb DEFAULT '{}',
  last_sync_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Índices para pluggy_items
CREATE INDEX IF NOT EXISTS idx_pluggy_items_user_id
  ON public.pluggy_items(user_id);

CREATE INDEX IF NOT EXISTS idx_pluggy_items_segment_id
  ON public.pluggy_items(segment_id);

CREATE INDEX IF NOT EXISTS idx_pluggy_items_status
  ON public.pluggy_items(status);

CREATE INDEX IF NOT EXISTS idx_pluggy_items_item_id
  ON public.pluggy_items(item_id);

-- Trigger para updated_at em pluggy_items
CREATE OR REPLACE FUNCTION public.update_pluggy_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_pluggy_items_updated_at
  ON public.pluggy_items;

CREATE TRIGGER trg_pluggy_items_updated_at
  BEFORE UPDATE ON public.pluggy_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_pluggy_items_updated_at();

-- Comentários
COMMENT ON TABLE public.pluggy_items IS 'Conexões (items) da Pluggy associadas aos usuários';
COMMENT ON COLUMN public.pluggy_items.item_id IS 'ID único do item na Pluggy';
COMMENT ON COLUMN public.pluggy_items.last_sync_at IS 'Data/hora da última sincronização bem-sucedida';

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================

