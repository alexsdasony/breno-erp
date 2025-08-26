-- payment_methods table
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name varchar(100) NOT NULL,
  nfe_code varchar(10) NULL,
  created_at timestamp DEFAULT now() NULL,
  updated_at timestamp DEFAULT now() NULL
);

-- Trigger to keep updated_at fresh
CREATE TRIGGER update_payment_methods_updated_at
BEFORE UPDATE ON public.payment_methods
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Permissions
ALTER TABLE public.payment_methods OWNER TO postgres;
GRANT ALL ON TABLE public.payment_methods TO postgres;
GRANT ALL ON TABLE public.payment_methods TO anon;
GRANT ALL ON TABLE public.payment_methods TO authenticated;
GRANT ALL ON TABLE public.payment_methods TO service_role;

-- Seed initial data (id auto)
INSERT INTO public.payment_methods (name, nfe_code)
VALUES 
  ('DINHEIRO', NULL),
  ('CARTAO CREDITO', NULL),
  ('CARTAO DEBITO', NULL),
  ('TED', NULL),
  ('BOLETO BANCARIO', NULL),
  ('PIX', NULL)
ON CONFLICT DO NOTHING;
