-- Função RPC para executar SQL dinamicamente
-- Execute este SQL no Supabase SQL Editor

CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
  RETURN 'SQL executado com sucesso';
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'Erro: ' || SQLERRM;
END;
$$;

-- Agora execute o script para criar a tabela fornecedores
SELECT exec_sql('
  DROP TABLE IF EXISTS fornecedores CASCADE;

  CREATE TABLE fornecedores (
      id SERIAL PRIMARY KEY,
      razao_social VARCHAR(255) NOT NULL,
      nome_fantasia VARCHAR(255),
      ramo_atividade VARCHAR(150),
      tipo_contribuinte VARCHAR(20) CHECK (tipo_contribuinte IN (''PJ'', ''PF'', ''MEI'', ''Outros'')),
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
      status VARCHAR(10) DEFAULT ''ATIVO'' CHECK (status IN (''ATIVO'', ''INATIVO'')),
      data_cadastro DATE DEFAULT CURRENT_DATE,
      observacoes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  CREATE INDEX idx_fornecedores_cpf_cnpj ON fornecedores(cpf_cnpj);
  CREATE INDEX idx_fornecedores_razao_social ON fornecedores(razao_social);
  CREATE INDEX idx_fornecedores_email ON fornecedores(email);
  CREATE INDEX idx_fornecedores_status ON fornecedores(status);
  CREATE INDEX idx_fornecedores_uf ON fornecedores(uf);
  CREATE INDEX idx_fornecedores_cidade ON fornecedores(cidade);

  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
  END;
  $$ language ''plpgsql'';

  CREATE TRIGGER update_fornecedores_updated_at 
      BEFORE UPDATE ON fornecedores 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
');

-- Inserir dados de exemplo
INSERT INTO fornecedores (
    razao_social, nome_fantasia, ramo_atividade, tipo_contribuinte, cpf_cnpj, 
    inscricao_estadual, uf, cidade, cep, endereco, numero, bairro,
    pessoa_contato, telefone_fixo, telefone_celular, email,
    banco_nome, banco_codigo, agencia_numero, conta_numero, condicao_pagamento, observacoes
) VALUES 
('TECNOLOGIA AVANÇADA LTDA', 'TecAv', 'Tecnologia da Informação', 'PJ', '12.345.678/0001-90',
 '123456789', 'SP', 'São Paulo', '01234-567', 'Rua das Tecnologias', '100', 'Centro',
 'João Silva', '(11) 3333-4444', '(11) 99999-8888', 'contato@tecav.com.br',
 'Banco do Brasil', '001', '1234', '12345-6', '30 dias', 'Fornecedor de sistemas e equipamentos'),

('MATERIAIS CONSTRUÇÃO LTDA', 'MatCon', 'Construção Civil', 'PJ', '98.765.432/0001-10',
 '987654321', 'RJ', 'Rio de Janeiro', '20000-000', 'Av. da Construção', '500', 'Copacabana',
 'Maria Santos', '(21) 2222-3333', '(21) 88888-7777', 'vendas@matcon.com.br',
 'Itaú', '341', '5678', '98765-4', '15 dias', 'Fornecedor de materiais de construção');

-- Verificar se foi criado
SELECT 'Tabela fornecedores criada com sucesso!' as resultado;


