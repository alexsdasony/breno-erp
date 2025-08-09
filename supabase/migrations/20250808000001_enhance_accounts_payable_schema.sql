-- =====================================================
-- MIGRAÇÃO: NORMALIZAÇÃO E EXPANSÃO DO SCHEMA DE CONTAS A PAGAR
-- =====================================================

-- =====================================================
-- CRIAR TABELA DE FORNECEDORES (SUPPLIERS)
-- =====================================================

CREATE TABLE IF NOT EXISTS suppliers (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  cnpj character varying,
  cpf character varying,
  email character varying,
  telefone character varying,
  endereco text,
  cidade character varying,
  estado character varying,
  cep character varying,
  observacoes text,
  status character varying DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'suspenso')),
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  segment_id uuid,
  
  CONSTRAINT suppliers_pkey PRIMARY KEY (id),
  CONSTRAINT suppliers_cnpj_unique UNIQUE (cnpj),
  CONSTRAINT suppliers_cpf_unique UNIQUE (cpf),
  CONSTRAINT suppliers_segment_id_fkey FOREIGN KEY (segment_id) REFERENCES segments(id) ON DELETE SET NULL
);

-- =====================================================
-- CRIAR TABELA DE CATEGORIAS DE CONTAS A PAGAR
-- =====================================================

CREATE TABLE IF NOT EXISTS account_categories (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  description text,
  color character varying DEFAULT '#3B82F6',
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  segment_id uuid,
  
  CONSTRAINT account_categories_pkey PRIMARY KEY (id),
  CONSTRAINT account_categories_segment_id_fkey FOREIGN KEY (segment_id) REFERENCES segments(id) ON DELETE SET NULL
);

-- =====================================================
-- EXPANDIR TABELA ACCOUNTS_PAYABLE
-- =====================================================

-- Fazer backup da tabela atual
CREATE TABLE IF NOT EXISTS accounts_payable_backup AS SELECT * FROM accounts_payable;

-- Drop da tabela atual
DROP TABLE IF EXISTS accounts_payable CASCADE;

-- Criar nova tabela accounts_payable com campos expandidos
CREATE TABLE accounts_payable (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  
  -- Referência ao fornecedor (normalizado)
  supplier_id uuid,
  
  -- Dados da conta
  numero_nota_fiscal character varying,
  descricao text NOT NULL,
  valor numeric(15,2) NOT NULL,
  data_vencimento date NOT NULL,
  data_pagamento date,
  
  -- Status e controle
  status character varying DEFAULT 'pendente' CHECK (status IN ('pendente', 'paga', 'vencida', 'cancelada')),
  
  -- Categorização
  categoria_id uuid,
  
  -- Forma de pagamento
  forma_pagamento character varying DEFAULT 'boleto' CHECK (forma_pagamento IN ('boleto', 'pix', 'transferencia', 'dinheiro', 'cartao', 'cheque')),
  
  -- Informações adicionais
  observacoes text,
  responsavel_pagamento character varying,
  numero_parcela integer DEFAULT 1,
  total_parcelas integer DEFAULT 1,
  
  -- Campos de auditoria
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  segment_id uuid,
  
  -- Constraints
  CONSTRAINT accounts_payable_pkey PRIMARY KEY (id),
  CONSTRAINT accounts_payable_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
  CONSTRAINT accounts_payable_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES account_categories(id) ON DELETE SET NULL,
  CONSTRAINT accounts_payable_segment_id_fkey FOREIGN KEY (segment_id) REFERENCES segments(id) ON DELETE SET NULL
);

-- =====================================================
-- CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX idx_accounts_payable_supplier_id ON accounts_payable(supplier_id);
CREATE INDEX idx_accounts_payable_status ON accounts_payable(status);
CREATE INDEX idx_accounts_payable_data_vencimento ON accounts_payable(data_vencimento);
CREATE INDEX idx_accounts_payable_data_pagamento ON accounts_payable(data_pagamento);
CREATE INDEX idx_accounts_payable_categoria_id ON accounts_payable(categoria_id);
CREATE INDEX idx_accounts_payable_segment_id ON accounts_payable(segment_id);
CREATE INDEX idx_accounts_payable_created_at ON accounts_payable(created_at);

-- =====================================================
-- CRIAR TRIGGER PARA ATUALIZAR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_accounts_payable_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_accounts_payable_updated_at
  BEFORE UPDATE ON accounts_payable
  FOR EACH ROW
  EXECUTE FUNCTION update_accounts_payable_updated_at();

-- =====================================================
-- INSERIR CATEGORIAS PADRÃO
-- =====================================================

INSERT INTO account_categories (name, description, color) VALUES
('Serviços', 'Contas relacionadas a serviços prestados', '#3B82F6'),
('Produtos', 'Contas relacionadas a produtos adquiridos', '#10B981'),
('Impostos', 'Contas relacionadas a impostos e taxas', '#F59E0B'),
('Aluguel', 'Contas relacionadas a aluguel de imóveis', '#8B5CF6'),
('Energia', 'Contas de energia elétrica', '#EF4444'),
('Água', 'Contas de água e esgoto', '#06B6D4'),
('Internet/Telefone', 'Contas de internet e telefone', '#84CC16'),
('Manutenção', 'Contas de manutenção e reparos', '#F97316'),
('Outros', 'Outras categorias de contas', '#6B7280')
ON CONFLICT DO NOTHING;

-- =====================================================
-- MIGRAR DADOS EXISTENTES
-- =====================================================

-- Inserir fornecedores baseados nos dados existentes
INSERT INTO suppliers (name, segment_id)
SELECT DISTINCT supplier, segment_id 
FROM accounts_payable_backup 
WHERE supplier IS NOT NULL
ON CONFLICT DO NOTHING;

-- Restaurar dados com mapeamento para nova estrutura
INSERT INTO accounts_payable (
  id, supplier_id, descricao, valor, data_vencimento, status, 
  created_at, updated_at, segment_id
)
SELECT 
  apb.id,
  s.id as supplier_id,
  COALESCE(apb.description, 'Conta a pagar') as descricao,
  apb.amount as valor,
  apb.due_date as data_vencimento,
  CASE 
    WHEN apb.status = 'paid' THEN 'paga'
    WHEN apb.status = 'overdue' THEN 'vencida'
    ELSE 'pendente'
  END as status,
  apb.created_at,
  apb.updated_at,
  apb.segment_id
FROM accounts_payable_backup apb
LEFT JOIN suppliers s ON s.name = apb.supplier AND s.segment_id = apb.segment_id
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE suppliers IS 'Tabela de fornecedores para contas a pagar';
COMMENT ON TABLE account_categories IS 'Categorias para classificar contas a pagar';
COMMENT ON TABLE accounts_payable IS 'Tabela de contas a pagar com estrutura normalizada';

COMMENT ON COLUMN accounts_payable.status IS 'Status da conta: pendente, paga, vencida, cancelada';
COMMENT ON COLUMN accounts_payable.forma_pagamento IS 'Forma de pagamento: boleto, pix, transferencia, dinheiro, cartao, cheque';
COMMENT ON COLUMN accounts_payable.numero_parcela IS 'Número da parcela atual';
COMMENT ON COLUMN accounts_payable.total_parcelas IS 'Total de parcelas da conta';
