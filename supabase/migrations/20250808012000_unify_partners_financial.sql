-- =====================================================
-- MIGRAÇÃO: UNIFICAÇÃO DE PARCEIROS E DOCUMENTOS FINANCEIROS
-- =====================================================

-- Requisitos: extensao uuid-ossp já utilizada no projeto

-- =====================================================
-- TABELA: partners (parceiros unificados: clientes/fornecedores/empregados)
-- =====================================================
CREATE TABLE IF NOT EXISTS partners (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  tax_id character varying, -- cpf/cnpj unificado
  email character varying,
  phone character varying,
  address text,
  city character varying,
  state character varying,
  zip_code character varying,
  notes text,
  status character varying DEFAULT 'active' CHECK (status IN ('active','inactive','suspended')),
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  segment_id uuid,
  CONSTRAINT partners_pkey PRIMARY KEY (id),
  CONSTRAINT partners_tax_id_unique UNIQUE (tax_id)
);

-- Índices úteis
CREATE INDEX IF NOT EXISTS idx_partners_name ON partners(name);
CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);
CREATE INDEX IF NOT EXISTS idx_partners_segment_id ON partners(segment_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_partners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_partners_updated_at
  BEFORE UPDATE ON partners
  FOR EACH ROW
  EXECUTE FUNCTION update_partners_updated_at();

-- =====================================================
-- TABELA: partner_roles (papéis do parceiro)
-- =====================================================
CREATE TABLE IF NOT EXISTS partner_roles (
  partner_id uuid NOT NULL,
  role character varying NOT NULL CHECK (role IN ('customer','supplier','employee')),
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT partner_roles_pkey PRIMARY KEY (partner_id, role),
  CONSTRAINT partner_roles_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_partner_roles_role ON partner_roles(role);

-- =====================================================
-- PARCEIROS PADRÃO (INDEFINIDOS)
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM partners p WHERE p.name = 'CLIENTE INDEFINIDO') THEN
    INSERT INTO partners (name, status) VALUES ('CLIENTE INDEFINIDO', 'active');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM partners p WHERE p.name = 'FORNECEDOR INDEFINIDO') THEN
    INSERT INTO partners (name, status) VALUES ('FORNECEDOR INDEFINIDO', 'active');
  END IF;

  -- Garantir roles
  INSERT INTO partner_roles (partner_id, role)
  SELECT p.id, 'customer' FROM partners p WHERE p.name = 'CLIENTE INDEFINIDO'
  ON CONFLICT DO NOTHING;

  INSERT INTO partner_roles (partner_id, role)
  SELECT p.id, 'supplier' FROM partners p WHERE p.name = 'FORNECEDOR INDEFINIDO'
  ON CONFLICT DO NOTHING;
END$$;

-- =====================================================
-- TABELA: financial_documents (AP/AR unificados)
-- =====================================================
CREATE TABLE IF NOT EXISTS financial_documents (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  partner_id uuid,
  direction character varying NOT NULL CHECK (direction IN ('receivable','payable')),
  doc_no character varying,
  issue_date date,
  due_date date,
  amount numeric(15,2) NOT NULL,
  balance numeric(15,2) NOT NULL DEFAULT 0,
  status character varying NOT NULL DEFAULT 'open' CHECK (status IN ('draft','open','partially_paid','paid','canceled')),
  category_id uuid,
  segment_id uuid,
  description text,
  payment_method character varying,
  notes text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT financial_documents_pkey PRIMARY KEY (id),
  CONSTRAINT financial_documents_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE SET NULL,
  CONSTRAINT financial_documents_category_id_fkey FOREIGN KEY (category_id) REFERENCES account_categories(id) ON DELETE SET NULL,
  CONSTRAINT financial_documents_segment_id_fkey FOREIGN KEY (segment_id) REFERENCES segments(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_fin_docs_partner_id ON financial_documents(partner_id);
CREATE INDEX IF NOT EXISTS idx_fin_docs_direction ON financial_documents(direction);
CREATE INDEX IF NOT EXISTS idx_fin_docs_status ON financial_documents(status);
CREATE INDEX IF NOT EXISTS idx_fin_docs_due_date ON financial_documents(due_date);
CREATE INDEX IF NOT EXISTS idx_fin_docs_segment_id ON financial_documents(segment_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_fin_docs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_fin_docs_updated_at
  BEFORE UPDATE ON financial_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_fin_docs_updated_at();

-- =====================================================
-- TABELA: financial_installments (parcelas)
-- =====================================================
CREATE TABLE IF NOT EXISTS financial_installments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  document_id uuid NOT NULL,
  installment_number integer NOT NULL DEFAULT 1,
  due_date date NOT NULL,
  amount numeric(15,2) NOT NULL,
  paid_amount numeric(15,2) NOT NULL DEFAULT 0,
  status character varying NOT NULL DEFAULT 'open' CHECK (status IN ('open','paid','canceled')),
  paid_date date,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT financial_installments_pkey PRIMARY KEY (id),
  CONSTRAINT financial_installments_document_id_fkey FOREIGN KEY (document_id) REFERENCES financial_documents(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_fin_inst_doc_id ON financial_installments(document_id);
CREATE INDEX IF NOT EXISTS idx_fin_inst_due_date ON financial_installments(due_date);

-- =====================================================
-- TABELA: financial_payments (pagamentos/recebimentos)
-- =====================================================
CREATE TABLE IF NOT EXISTS financial_payments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  amount numeric(15,2) NOT NULL,
  method character varying,
  reference character varying,
  notes text,
  segment_id uuid,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT financial_payments_pkey PRIMARY KEY (id),
  CONSTRAINT financial_payments_segment_id_fkey FOREIGN KEY (segment_id) REFERENCES segments(id) ON DELETE SET NULL
);

-- =====================================================
-- TABELA: financial_document_payments (vínculo doc x pagamento)
-- =====================================================
CREATE TABLE IF NOT EXISTS financial_document_payments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  document_id uuid NOT NULL,
  installment_id uuid,
  payment_id uuid NOT NULL,
  amount_applied numeric(15,2) NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT financial_document_payments_pkey PRIMARY KEY (id),
  CONSTRAINT financial_document_payments_document_fkey FOREIGN KEY (document_id) REFERENCES financial_documents(id) ON DELETE CASCADE,
  CONSTRAINT financial_document_payments_installment_fkey FOREIGN KEY (installment_id) REFERENCES financial_installments(id) ON DELETE SET NULL,
  CONSTRAINT financial_document_payments_payment_fkey FOREIGN KEY (payment_id) REFERENCES financial_payments(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_fin_doc_pay_doc_id ON financial_document_payments(document_id);
CREATE INDEX IF NOT EXISTS idx_fin_doc_pay_payment_id ON financial_document_payments(payment_id);

-- =====================================================
-- BACKFILL: partners a partir de customers e suppliers
-- Mantemos os IDs originais para facilitar relacionamentos
-- =====================================================
-- customers -> partners
INSERT INTO partners (id, name, tax_id, email, phone, address, city, state, zip_code, notes, status, created_at, updated_at, segment_id)
SELECT 
  c.id,
  c.name,
  COALESCE(NULLIF(c.cnpj, ''), NULLIF(c.cpf, '')) AS tax_id,
  c.email,
  COALESCE(NULLIF(c.telefone, ''), NULLIF(c.celular, '')) AS phone,
  CONCAT_WS(', ', c.logradouro, c.numero, c.complemento, c.bairro) AS address,
  c.cidade,
  c.estado,
  c.cep,
  c.observacoes,
  CASE WHEN c.status = 'suspenso' THEN 'suspended' WHEN c.status IN ('aprovado','em_analise','pendente','reprovado') THEN 'active' ELSE 'active' END AS status,
  c.created_at,
  c.updated_at,
  c.segment_id
FROM customers c
ON CONFLICT (tax_id) DO NOTHING;

-- suppliers -> partners
INSERT INTO partners (id, name, tax_id, email, phone, address, city, state, zip_code, notes, status, created_at, updated_at, segment_id)
SELECT 
  s.id,
  s.name,
  COALESCE(NULLIF(s.cnpj, ''), NULLIF(s.cpf, '')) AS tax_id,
  s.email,
  s.telefone AS phone,
  s.endereco AS address,
  s.cidade,
  s.estado,
  s.cep,
  s.observacoes,
  CASE 
    WHEN lower(COALESCE(s.status,'')) IN ('active','ativo') THEN 'active'
    WHEN lower(COALESCE(s.status,'')) IN ('inactive','inativo') THEN 'inactive'
    WHEN lower(COALESCE(s.status,'')) IN ('suspended','suspenso') THEN 'suspended'
    ELSE 'active'
  END AS status,
  s.created_at,
  s.updated_at,
  s.segment_id
FROM suppliers s
ON CONFLICT (tax_id) DO NOTHING;

-- Roles
INSERT INTO partner_roles (partner_id, role)
SELECT c.id, 'customer' FROM customers c
ON CONFLICT DO NOTHING;

INSERT INTO partner_roles (partner_id, role)
SELECT s.id, 'supplier' FROM suppliers s
ON CONFLICT DO NOTHING;

-- =====================================================
-- BACKFILL: financial_documents a partir de accounts_payable e billings
-- =====================================================
-- Accounts Payable -> direction = payable
INSERT INTO financial_documents (
  id, partner_id, direction, doc_no, issue_date, due_date, amount, balance, status, category_id, segment_id, description, payment_method, notes, created_at, updated_at
)
SELECT 
  ap.id,
  COALESCE(ap.supplier_id, (SELECT id FROM partners WHERE name = 'FORNECEDOR INDEFINIDO' LIMIT 1)) AS partner_id,
  'payable' AS direction,
  ap.numero_nota_fiscal AS doc_no,
  NULL::date AS issue_date,
  ap.data_vencimento AS due_date,
  ap.valor::numeric(15,2) AS amount,
  CASE WHEN ap.status IN ('paga') THEN 0 ELSE ap.valor::numeric(15,2) END AS balance,
  CASE 
    WHEN ap.status = 'paga' THEN 'paid'
    WHEN ap.status = 'vencida' THEN 'open'
    WHEN ap.status = 'cancelada' THEN 'canceled'
    ELSE 'open'
  END AS status,
  ap.categoria_id AS category_id,
  ap.segment_id,
  ap.descricao AS description,
  ap.forma_pagamento AS payment_method,
  ap.observacoes AS notes,
  ap.created_at,
  ap.updated_at
FROM accounts_payable ap
ON CONFLICT (id) DO NOTHING;

-- Billings (Contas a Receber) -> direction = receivable
INSERT INTO financial_documents (
  id, partner_id, direction, doc_no, issue_date, due_date, amount, balance, status, category_id, segment_id, description, payment_method, notes, created_at, updated_at
)
SELECT 
  b.id,
  COALESCE(b.customer_id, (SELECT id FROM partners WHERE name = 'CLIENTE INDEFINIDO' LIMIT 1)) AS partner_id,
  'receivable' AS direction,
  NULL::character varying AS doc_no,
  NULL::date AS issue_date,
  b.due_date,
  b.amount::numeric(15,2) AS amount,
  CASE WHEN b.payment_date IS NOT NULL OR b.status ILIKE 'paga%' THEN 0 ELSE b.amount::numeric(15,2) END AS balance,
  CASE 
    WHEN b.payment_date IS NOT NULL OR b.status ILIKE 'paga%' THEN 'paid'
    WHEN b.status ILIKE 'cancel%' THEN 'canceled'
    ELSE 'open'
  END AS status,
  NULL::uuid AS category_id,
  b.segment_id,
  b.customer_name AS description,
  NULL::character varying AS payment_method,
  NULL::text AS notes,
  b.created_at,
  b.updated_at
FROM billings b
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- COMENTÁRIOS
-- =====================================================
COMMENT ON TABLE partners IS 'Cadastro unificado de parceiros (clientes, fornecedores, empregados)';
COMMENT ON TABLE partner_roles IS 'Papéis associados ao parceiro (customer, supplier, employee)';
COMMENT ON TABLE financial_documents IS 'Documentos financeiros unificados (AR/AP)';
COMMENT ON TABLE financial_installments IS 'Parcelas de documentos financeiros';
COMMENT ON TABLE financial_payments IS 'Pagamentos/Recebimentos registrados';
COMMENT ON TABLE financial_document_payments IS 'Vínculo entre documentos/parcelas e pagamentos';
