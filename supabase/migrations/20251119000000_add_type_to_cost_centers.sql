-- Adicionar campo type (tipo) na tabela cost_centers
-- Este campo indica se o centro de custo é 'despesa' ou 'receita'

BEGIN;

-- Adicionar coluna type se não existir
ALTER TABLE public.cost_centers
  ADD COLUMN IF NOT EXISTS type varchar(20) NULL;

-- Adicionar CHECK constraint para type se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'cost_centers_type_check'
  ) THEN
    ALTER TABLE public.cost_centers
      ADD CONSTRAINT cost_centers_type_check CHECK ((type = ANY (ARRAY['despesa'::varchar, 'receita'::varchar])));
  END IF;
END$$;

-- Criar índice para performance (opcional, mas útil para filtros)
CREATE INDEX IF NOT EXISTS idx_cost_centers_type ON public.cost_centers USING btree (type);

-- Comentário na coluna
COMMENT ON COLUMN public.cost_centers.type IS 'Tipo do centro de custo: despesa ou receita';

COMMIT;

