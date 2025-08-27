-- Atualiza a tabela sales para remover campos obsoletos que foram substituídos pela tabela sale_items

-- Primeiro, verifica se as colunas existem antes de tentar removê-las
DO $$
BEGIN
    -- Verifica e remove a coluna 'product' se existir
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'sales' 
               AND column_name = 'product') THEN
        ALTER TABLE public.sales DROP COLUMN product;
    END IF;
    
    -- Verifica e remove a coluna 'quantity' se existir
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'sales' 
               AND column_name = 'quantity') THEN
        ALTER TABLE public.sales DROP COLUMN quantity;
    END IF;
    
    -- Verifica e remove a coluna 'total' se existir (substituída por total_amount)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'sales' 
               AND column_name = 'total') THEN
        ALTER TABLE public.sales DROP COLUMN total;
    END IF;
    
    -- Verifica e remove a coluna 'date' se existir (substituída por sale_date)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'sales' 
               AND column_name = 'date') THEN
        ALTER TABLE public.sales DROP COLUMN "date";
    END IF;
END
$$;