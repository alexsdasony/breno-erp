-- Campos de recorrência para previsão financeira automática
-- Contas a pagar (tabela accounts_payable)
ALTER TABLE public.accounts_payable
  ADD COLUMN IF NOT EXISTS is_recurring boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS recurrence_type varchar(20) CHECK (recurrence_type IS NULL OR recurrence_type IN ('monthly', 'weekly', 'yearly', 'custom')),
  ADD COLUMN IF NOT EXISTS recurrence_interval int DEFAULT 1,
  ADD COLUMN IF NOT EXISTS recurrence_end_date date;

COMMENT ON COLUMN public.accounts_payable.is_recurring IS 'Se true, o sistema gera automaticamente novos registros pela periodicidade';
COMMENT ON COLUMN public.accounts_payable.recurrence_type IS 'monthly, weekly, yearly, custom';
COMMENT ON COLUMN public.accounts_payable.recurrence_interval IS 'Intervalo (ex: a cada 2 meses quando recurrence_type=monthly)';
COMMENT ON COLUMN public.accounts_payable.recurrence_end_date IS 'Data limite para geração de parcelas recorrentes';

-- Documentos financeiros (contas a receber e a pagar unificados)
ALTER TABLE public.financial_documents
  ADD COLUMN IF NOT EXISTS is_recurring boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS recurrence_type varchar(20) CHECK (recurrence_type IS NULL OR recurrence_type IN ('monthly', 'weekly', 'yearly', 'custom')),
  ADD COLUMN IF NOT EXISTS recurrence_interval int DEFAULT 1,
  ADD COLUMN IF NOT EXISTS recurrence_end_date date;

COMMENT ON COLUMN public.financial_documents.is_recurring IS 'Se true, gera automaticamente novos documentos pela periodicidade';
COMMENT ON COLUMN public.financial_documents.recurrence_type IS 'monthly, weekly, yearly, custom';
COMMENT ON COLUMN public.financial_documents.recurrence_interval IS 'Intervalo (ex: a cada 2 meses)';
COMMENT ON COLUMN public.financial_documents.recurrence_end_date IS 'Data limite para geração de recorrentes';
