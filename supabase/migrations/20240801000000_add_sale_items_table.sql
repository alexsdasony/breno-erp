-- Adiciona a tabela sale_items que estava faltando no schema atual

-- Verifica se a tabela já existe antes de criar
CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Adiciona índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON public.sale_items USING btree (sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON public.sale_items USING btree (product_id);

-- Configura permissões
ALTER TABLE public.sale_items OWNER TO postgres;
GRANT ALL ON TABLE public.sale_items TO postgres;
GRANT ALL ON TABLE public.sale_items TO anon;
GRANT ALL ON TABLE public.sale_items TO authenticated;
GRANT ALL ON TABLE public.sale_items TO service_role;