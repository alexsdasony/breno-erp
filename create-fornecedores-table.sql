-- =====================================================
-- CRIAÇÃO DA TABELA FORNECEDORES
-- =====================================================
-- Execute este script no SQL Editor do Supabase

-- Habilitar extensão uuid-ossp se não estiver habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tabela fornecedores
CREATE TABLE IF NOT EXISTS fornecedores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    ramo_atividade VARCHAR(150),
    tipo_contribuinte VARCHAR(20) CHECK (tipo_contribuinte IN ('PJ', 'PF', 'MEI', 'Outros')),
    cpf_cnpj VARCHAR(20) UNIQUE NOT NULL,
    inscricao_estadual VARCHAR(30),
    inscricao_municipal VARCHAR(30),
    uf CHAR(2),
    cidade VARCHAR(100),
    cep CHAR(8),
    endereco VARCHAR(255),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    pessoa_contato VARCHAR(100),
    telefone_fixo VARCHAR(20),
    telefone_celular VARCHAR(20),
    email VARCHAR(150),
    site VARCHAR(150),
    banco_nome VARCHAR(100),
    banco_codigo CHAR(3),
    agencia_numero VARCHAR(10),
    agencia_digito CHAR(1),
    conta_numero VARCHAR(20),
    conta_digito CHAR(1),
    pix_chave VARCHAR(150),
    condicao_pagamento VARCHAR(50),
    status VARCHAR(10) DEFAULT 'ATIVO' CHECK (status IN ('ATIVO', 'INATIVO')),
    segment_id UUID REFERENCES segments(id),
    data_cadastro DATE DEFAULT CURRENT_DATE,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_fornecedores_razao_social ON fornecedores(razao_social);
CREATE INDEX IF NOT EXISTS idx_fornecedores_cpf_cnpj ON fornecedores(cpf_cnpj);
CREATE INDEX IF NOT EXISTS idx_fornecedores_email ON fornecedores(email);
CREATE INDEX IF NOT EXISTS idx_fornecedores_status ON fornecedores(status);
CREATE INDEX IF NOT EXISTS idx_fornecedores_segment_id ON fornecedores(segment_id);

-- Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_fornecedores_updated_at 
    BEFORE UPDATE ON fornecedores 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Usuários autenticados podem ver fornecedores" ON fornecedores
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir fornecedores" ON fornecedores
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar fornecedores" ON fornecedores
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar fornecedores" ON fornecedores
    FOR DELETE USING (auth.role() = 'authenticated');

-- Inserir dados de exemplo
INSERT INTO fornecedores (
    razao_social, nome_fantasia, ramo_atividade, tipo_contribuinte, cpf_cnpj,
    inscricao_estadual, inscricao_municipal, uf, cidade, cep, endereco, numero,
    complemento, bairro, pessoa_contato, telefone_fixo, telefone_celular, email,
    site, banco_nome, banco_codigo, agencia_numero, agencia_digito, conta_numero,
    conta_digito, pix_chave, condicao_pagamento, status, observacoes
) VALUES 
(
    'Empresa ABC Ltda',
    'ABC Ltda',
    'Tecnologia',
    'PJ',
    '12.345.678/0001-90',
    '123456789',
    '987654321',
    'SP',
    'São Paulo',
    '01234-567',
    'Rua das Flores, 123',
    '123',
    'Sala 101',
    'Centro',
    'João Silva',
    '(11) 1234-5678',
    '(11) 98765-4321',
    'contato@abc.com.br',
    'www.abc.com.br',
    'Banco do Brasil',
    '001',
    '1234',
    '5',
    '12345-6',
    '7',
    'abc@abc.com.br',
    '30 dias',
    'ATIVO',
    'Fornecedor de tecnologia'
),
(
    'Comércio XYZ S/A',
    'XYZ Comércio',
    'Comércio',
    'PJ',
    '98.765.432/0001-10',
    '987654321',
    '123456789',
    'RJ',
    'Rio de Janeiro',
    '20000-000',
    'Av. Brasil, 456',
    '456',
    'Andar 2',
    'Centro',
    'Maria Santos',
    '(21) 2345-6789',
    '(21) 87654-3210',
    'contato@xyz.com.br',
    'www.xyz.com.br',
    'Itaú',
    '341',
    '5678',
    '9',
    '98765-4',
    '3',
    'xyz@xyz.com.br',
    '15 dias',
    'ATIVO',
    'Fornecedor de produtos'
),
(
    'João da Silva',
    'João Silva',
    'Consultoria',
    'PF',
    '123.456.789-00',
    NULL,
    NULL,
    'MG',
    'Belo Horizonte',
    '30000-000',
    'Rua das Palmeiras, 789',
    '789',
    'Apto 303',
    'Savassi',
    'João Silva',
    '(31) 3456-7890',
    '(31) 76543-2109',
    'joao.silva@email.com',
    NULL,
    'Bradesco',
    '237',
    '9012',
    '3',
    '54321-8',
    '9',
    'joao.silva@email.com',
    'À vista',
    'ATIVO',
    'Consultor independente'
);

-- Verificar se os dados foram inseridos
SELECT 
    razao_social, 
    nome_fantasia, 
    cpf_cnpj, 
    email, 
    cidade, 
    status 
FROM fornecedores 
ORDER BY razao_social;

-- =====================================================
-- FIM DA CRIAÇÃO DA TABELA FORNECEDORES
-- =====================================================
