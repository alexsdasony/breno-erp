-- =====================================================
-- TABELA: pluggy_items
-- Armazena conexões (items) da Pluggy associadas aos usuários
-- =====================================================

CREATE TABLE IF NOT EXISTS public.pluggy_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id text UNIQUE NOT NULL, -- ID do item na Pluggy
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  segment_id uuid REFERENCES segments(id) ON DELETE SET NULL,
  connector_id text,
  connector_name text,
  status varchar(50), -- UPDATING, UPDATED, LOGIN_ERROR, etc.
  execution_status varchar(50), -- CREATED, PROCESSING, SUCCESS, ERROR
  error text, -- JSON string com detalhes do erro (se houver)
  metadata jsonb DEFAULT '{}',
  last_sync_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_pluggy_items_user_id
  ON public.pluggy_items(user_id);

CREATE INDEX IF NOT EXISTS idx_pluggy_items_segment_id
  ON public.pluggy_items(segment_id);

CREATE INDEX IF NOT EXISTS idx_pluggy_items_status
  ON public.pluggy_items(status);

CREATE INDEX IF NOT EXISTS idx_pluggy_items_item_id
  ON public.pluggy_items(item_id);

-- Trigger para updated_at
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


