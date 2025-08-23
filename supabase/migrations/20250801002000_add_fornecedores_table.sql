-- =====================================================
-- MIGRAÇÃO: ADICIONAR TABELA DE FORNECEDORES
-- =====================================================

-- =====================================================
-- TABELA DE FORNECEDORES
-- =====================================================
CREATE TABLE IF NOT EXISTS fornecedores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identificação
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    ramo_atividade VARCHAR(150),
    tipo_contribuinte VARCHAR(20) CHECK (tipo_contribuinte IN ('PJ', 'PF', 'MEI', 'Outros')),
    cpf_cnpj VARCHAR(20) UNIQUE NOT NULL,
    inscricao_estadual VARCHAR(30),
    inscricao_municipal VARCHAR(30),

    -- Endereço
    uf CHAR(2),
    cidade VARCHAR(100),
    cep CHAR(8),
    endereco VARCHAR(255),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),

    -- Contato
    pessoa_contato VARCHAR(100),
    telefone_fixo VARCHAR(20),
    telefone_celular VARCHAR(20),
    email VARCHAR(150),
    site VARCHAR(150),

    -- Dados Bancários
    banco_nome VARCHAR(100),
    banco_codigo CHAR(3),
    agencia_numero VARCHAR(10),
    agencia_digito CHAR(1),
    conta_numero VARCHAR(20),
    conta_digito CHAR(1),
    pix_chave VARCHAR(150),
    condicao_pagamento VARCHAR(50),

    -- Controle
    status VARCHAR(10) DEFAULT 'ATIVO' CHECK (status IN ('ATIVO', 'INATIVO')),
    segment_id UUID REFERENCES segments(id),
    data_cadastro DATE DEFAULT CURRENT_DATE,
    observacoes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_fornecedores_cpf_cnpj ON fornecedores(cpf_cnpj);
CREATE INDEX IF NOT EXISTS idx_fornecedores_razao_social ON fornecedores(razao_social);
CREATE INDEX IF NOT EXISTS idx_fornecedores_email ON fornecedores(email);
CREATE INDEX IF NOT EXISTS idx_fornecedores_status ON fornecedores(status);
CREATE INDEX IF NOT EXISTS idx_fornecedores_segment_id ON fornecedores(segment_id);

-- =====================================================
-- TRIGGER PARA ATUALIZAR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_fornecedores_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_fornecedores_updated_at 
    BEFORE UPDATE ON fornecedores 
    FOR EACH ROW 
    EXECUTE FUNCTION update_fornecedores_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;

-- Política para service role (permitir tudo)
CREATE POLICY "Enable all for service role" ON fornecedores 
    FOR ALL USING (auth.role() = 'service_role');

-- Política para usuários autenticados (permitir leitura)
CREATE POLICY "Enable read for authenticated users" ON fornecedores 
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para usuários autenticados (permitir inserção)
CREATE POLICY "Enable insert for authenticated users" ON fornecedores 
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para usuários autenticados (permitir atualização)
CREATE POLICY "Enable update for authenticated users" ON fornecedores 
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para usuários autenticados (permitir exclusão)
CREATE POLICY "Enable delete for authenticated users" ON fornecedores 
    FOR DELETE USING (auth.role() = 'authenticated');

-- =====================================================
-- DADOS DE EXEMPLO
-- =====================================================
INSERT INTO fornecedores (
    razao_social, 
    nome_fantasia, 
    ramo_atividade, 
    tipo_contribuinte, 
    cpf_cnpj, 
    inscricao_estadual,
    uf, 
    cidade, 
    cep, 
    endereco, 
    numero, 
    bairro,
    pessoa_contato,
    telefone_fixo,
    telefone_celular,
    email,
    status,
    observacoes
) VALUES 
(
    'Fornecedor Exemplo LTDA',
    'Fornecedor Exemplo',
    'Comércio de Materiais',
    'PJ',
    '12.345.678/0001-90',
    '123456789',
    'SP',
    'São Paulo',
    '01234567',
    'Rua das Flores',
    '123',
    'Centro',
    'João Silva',
    '(11) 3333-4444',
    '(11) 99999-8888',
    'contato@fornecedor.com',
    'ATIVO',
    'Fornecedor de confiança'
),
(
    'Distribuidora ABC LTDA',
    'Distribuidora ABC',
    'Distribuição de Produtos',
    'PJ',
    '98.765.432/0001-10',
    '987654321',
    'RJ',
    'Rio de Janeiro',
    '20000000',
    'Av. Principal',
    '456',
    'Copacabana',
    'Maria Santos',
    '(21) 2222-3333',
    '(21) 88888-7777',
    'contato@distribuidora.com',
    'ATIVO',
    'Distribuidora especializada'
),
(
    'Indústria XYZ LTDA',
    'Indústria XYZ',
    'Indústria de Produtos',
    'PJ',
    '11.222.333/0001-44',
    '112223334',
    'MG',
    'Belo Horizonte',
    '30000000',
    'Rua Industrial',
    '789',
    'Industrial',
    'Pedro Costa',
    '(31) 4444-5555',
    '(31) 77777-6666',
    'contato@industria.com',
    'ATIVO',
    'Indústria de qualidade'
)
ON CONFLICT (cpf_cnpj) DO NOTHING;

-- =====================================================
-- FIM DA MIGRAÇÃO
-- =====================================================
