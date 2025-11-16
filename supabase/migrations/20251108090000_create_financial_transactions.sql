-- =====================================================
-- TABELA: financial_transactions
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


