-- Script para atualizar a tabela customers com todos os novos campos

-- Adicionar novos campos para cadastro
ALTER TABLE customers ADD COLUMN profissao TEXT;
ALTER TABLE customers ADD COLUMN pais TEXT;
ALTER TABLE customers ADD COLUMN estado TEXT;
ALTER TABLE customers ADD COLUMN cidade TEXT;
ALTER TABLE customers ADD COLUMN grau_instrucao TEXT;
ALTER TABLE customers ADD COLUMN estado_civil TEXT;
ALTER TABLE customers ADD COLUMN data_nascimento DATE;
ALTER TABLE customers ADD COLUMN sexo TEXT;

-- Adicionar campos para documentos
ALTER TABLE customers ADD COLUMN tipo_documento TEXT;
ALTER TABLE customers ADD COLUMN data_emissao DATE;
ALTER TABLE customers ADD COLUMN numero_documento TEXT;
ALTER TABLE customers ADD COLUMN data_validade DATE;
ALTER TABLE customers ADD COLUMN orgao_emissor TEXT;
ALTER TABLE customers ADD COLUMN documento_image TEXT;

-- Adicionar campos para renda
ALTER TABLE customers ADD COLUMN cnpj_origem_renda TEXT;
ALTER TABLE customers ADD COLUMN data_admissao DATE;
ALTER TABLE customers ADD COLUMN cargo TEXT;
ALTER TABLE customers ADD COLUMN renda_bruta DECIMAL(15,2);
ALTER TABLE customers ADD COLUMN salario_liquido DECIMAL(15,2);
ALTER TABLE customers ADD COLUMN valor_imposto_renda DECIMAL(15,2);
ALTER TABLE customers ADD COLUMN data_comprovacao DATE;
ALTER TABLE customers ADD COLUMN documento_renda_image TEXT;

-- Adicionar campos para endereço
ALTER TABLE customers ADD COLUMN cep TEXT;
ALTER TABLE customers ADD COLUMN rua TEXT;
ALTER TABLE customers ADD COLUMN bairro TEXT;
ALTER TABLE customers ADD COLUMN numero_casa TEXT;
ALTER TABLE customers ADD COLUMN tipo_imovel TEXT;
ALTER TABLE customers ADD COLUMN data_atualizacao_endereco DATE;
ALTER TABLE customers ADD COLUMN endereco_declarado BOOLEAN DEFAULT FALSE;
ALTER TABLE customers ADD COLUMN endereco_comprovado BOOLEAN DEFAULT FALSE;

-- Adicionar campos para contato
ALTER TABLE customers ADD COLUMN telefone_fixo TEXT;
ALTER TABLE customers ADD COLUMN celular TEXT;

-- Adicionar campos para patrimônio
ALTER TABLE customers ADD COLUMN valor_patrimonio DECIMAL(15,2);
ALTER TABLE customers ADD COLUMN nao_possui_patrimonio BOOLEAN DEFAULT FALSE;

-- Adicionar campos para status do cadastro
ALTER TABLE customers ADD COLUMN status_cadastro TEXT DEFAULT 'Pendente';
ALTER TABLE customers ADD COLUMN responsavel_cadastro TEXT;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_customers_document ON customers(document);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status_cadastro);
CREATE INDEX IF NOT EXISTS idx_customers_responsavel ON customers(responsavel_cadastro);

-- Comentários para documentação
COMMENT ON COLUMN customers.profissao IS 'Profissão do cliente';
COMMENT ON COLUMN customers.pais IS 'País do cliente';
COMMENT ON COLUMN customers.estado IS 'Estado do cliente';
COMMENT ON COLUMN customers.cidade IS 'Cidade do cliente';
COMMENT ON COLUMN customers.grau_instrucao IS 'Grau de instrução do cliente';
COMMENT ON COLUMN customers.estado_civil IS 'Estado civil do cliente';
COMMENT ON COLUMN customers.data_nascimento IS 'Data de nascimento do cliente';
COMMENT ON COLUMN customers.sexo IS 'Sexo do cliente';
COMMENT ON COLUMN customers.tipo_documento IS 'Tipo de documento (RG, CNH, etc)';
COMMENT ON COLUMN customers.data_emissao IS 'Data de emissão do documento';
COMMENT ON COLUMN customers.numero_documento IS 'Número do documento';
COMMENT ON COLUMN customers.data_validade IS 'Data de validade do documento';
COMMENT ON COLUMN customers.orgao_emissor IS 'Órgão emissor do documento';
COMMENT ON COLUMN customers.documento_image IS 'URL da imagem do documento';
COMMENT ON COLUMN customers.cnpj_origem_renda IS 'CNPJ da origem da renda';
COMMENT ON COLUMN customers.data_admissao IS 'Data de admissão';
COMMENT ON COLUMN customers.cargo IS 'Cargo do cliente';
COMMENT ON COLUMN customers.renda_bruta IS 'Renda salarial bruta';
COMMENT ON COLUMN customers.salario_liquido IS 'Salário líquido';
COMMENT ON COLUMN customers.valor_imposto_renda IS 'Valor do imposto de renda';
COMMENT ON COLUMN customers.data_comprovacao IS 'Data de comprovação da renda';
COMMENT ON COLUMN customers.documento_renda_image IS 'URL do documento de renda';
COMMENT ON COLUMN customers.cep IS 'CEP do endereço';
COMMENT ON COLUMN customers.rua IS 'Rua do endereço';
COMMENT ON COLUMN customers.bairro IS 'Bairro do endereço';
COMMENT ON COLUMN customers.numero_casa IS 'Número da casa';
COMMENT ON COLUMN customers.tipo_imovel IS 'Tipo do imóvel (Alugado, Próprio, Quitado)';
COMMENT ON COLUMN customers.data_atualizacao_endereco IS 'Data de atualização do endereço';
COMMENT ON COLUMN customers.endereco_declarado IS 'Endereço foi declarado';
COMMENT ON COLUMN customers.endereco_comprovado IS 'Endereço foi comprovado';
COMMENT ON COLUMN customers.telefone_fixo IS 'Telefone fixo';
COMMENT ON COLUMN customers.celular IS 'Celular';
COMMENT ON COLUMN customers.valor_patrimonio IS 'Valor do patrimônio';
COMMENT ON COLUMN customers.nao_possui_patrimonio IS 'Não possui patrimônio';
COMMENT ON COLUMN customers.status_cadastro IS 'Status do cadastro (Pendente, Aprovado, Reprovado)';
COMMENT ON COLUMN customers.responsavel_cadastro IS 'Responsável pelo cadastro'; 