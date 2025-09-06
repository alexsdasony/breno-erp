-- Criar tabela de segmentos
CREATE TABLE IF NOT EXISTS segments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  description text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT segments_pkey PRIMARY KEY (id),
  CONSTRAINT segments_name_unique UNIQUE (name)
);

-- Inserir segmentos padrão
INSERT INTO segments (name, description) VALUES 
('comercio', 'Comércio em geral'),
('industria', 'Indústria'),
('servicos', 'Prestação de serviços'),
('outros', 'Outros segmentos')
ON CONFLICT (name) DO NOTHING;

-- Índices
CREATE INDEX IF NOT EXISTS idx_segments_name ON segments(name);
