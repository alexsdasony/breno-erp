-- Extend cost_centers with new fields: description, budget, status, manager_id
-- Safe to run multiple times? Use IF NOT EXISTS where possible.

BEGIN;

-- description: optional text
ALTER TABLE public.cost_centers
  ADD COLUMN IF NOT EXISTS description text NULL;

-- budget: numeric(12,2) with default 0
ALTER TABLE public.cost_centers
  ADD COLUMN IF NOT EXISTS budget numeric(12, 2) NOT NULL DEFAULT 0;

-- status: varchar with check constraint and default 'active'
ALTER TABLE public.cost_centers
  ADD COLUMN IF NOT EXISTS status varchar(50) NOT NULL DEFAULT 'active';

-- Add CHECK constraint for status if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'cost_centers_status_check'
  ) THEN
    ALTER TABLE public.cost_centers
      ADD CONSTRAINT cost_centers_status_check CHECK ((status = ANY (ARRAY['active'::varchar, 'inactive'::varchar])));
  END IF;
END$$;

-- manager_id: FK to users(id)
ALTER TABLE public.cost_centers
  ADD COLUMN IF NOT EXISTS manager_id uuid NULL;

-- Add FK constraint for manager_id if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'cost_centers_manager_id_fkey'
  ) THEN
    ALTER TABLE public.cost_centers
      ADD CONSTRAINT cost_centers_manager_id_fkey FOREIGN KEY (manager_id)
      REFERENCES public.users(id) ON DELETE SET NULL;
  END IF;
END$$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cost_centers_status ON public.cost_centers USING btree (status);
CREATE INDEX IF NOT EXISTS idx_cost_centers_manager_id ON public.cost_centers USING btree (manager_id);

COMMIT;
