-- Add optional foreign key from financial_documents to payment_methods
begin;

alter table if exists public.financial_documents
  add column if not exists payment_method_id uuid null;

-- Add FK constraint with ON DELETE SET NULL to keep weak relationship
alter table if exists public.financial_documents
  add constraint financial_documents_payment_method_id_fkey
  foreign key (payment_method_id)
  references public.payment_methods(id)
  on delete set null;

-- Helpful index for filtering and joins
create index if not exists idx_financial_documents_payment_method_id
  on public.financial_documents(payment_method_id);

commit;
