-- Migration: Create or replace chart_of_accounts with base data
-- Safe to re-run: uses IF EXISTS/IF NOT EXISTS guards

-- 1) Ensure UUID extension exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2) Helper function for updated_at (idempotent)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- 3) Drop old table if exists (cascades dependent FKs)
DROP TABLE IF EXISTS public.chart_of_accounts CASCADE;

-- 4) Recreate table aligned with app/edge function
CREATE TABLE public.chart_of_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'asset', 'liability', 'equity', 'revenue', 'expense'
  parent_id UUID REFERENCES public.chart_of_accounts(id),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5) Trigger to keep updated_at current (idempotent create)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_chart_of_accounts_updated_at'
  ) THEN
    CREATE TRIGGER update_chart_of_accounts_updated_at
    BEFORE UPDATE ON public.chart_of_accounts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;

-- 6) Enable RLS and basic policies
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'chart_of_accounts' AND policyname = 'Enable all for service role'
  ) THEN
    CREATE POLICY "Enable all for service role" ON public.chart_of_accounts FOR ALL USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'chart_of_accounts' AND policyname = 'Enable read for authenticated users'
  ) THEN
    CREATE POLICY "Enable read for authenticated users" ON public.chart_of_accounts FOR SELECT USING (auth.role() = 'authenticated');
  END IF;
END$$;

-- 7) Seed base accounts (only if table is empty)
INSERT INTO public.chart_of_accounts (code, name, type)
SELECT v.code, v.name, v.type
FROM (
  VALUES
    ('1', 'Ativo', 'asset'),
    ('1.1', 'Ativo Circulante', 'asset'),
    ('1.1.1', 'Caixa', 'asset'),
    ('2', 'Passivo', 'liability'),
    ('3', 'Patrimônio Líquido', 'equity'),
    ('4', 'Receitas', 'revenue'),
    ('5', 'Despesas', 'expense')
) AS v(code, name, type)
WHERE NOT EXISTS (SELECT 1 FROM public.chart_of_accounts);
