-- DROP SCHEMA public;

CREATE SCHEMA public AUTHORIZATION pg_database_owner;
-- public.accounts_payable_backup definition

-- Drop table

-- DROP TABLE public.accounts_payable_backup;

CREATE TABLE public.accounts_payable_backup ( id uuid NULL, supplier varchar(255) NULL, description text NULL, amount numeric(12, 2) NULL, due_date date NULL, status varchar(50) NULL, created_at timestamp NULL, updated_at timestamp NULL, segment_id uuid NULL);

-- Permissions

ALTER TABLE public.accounts_payable_backup OWNER TO postgres;
GRANT ALL ON TABLE public.accounts_payable_backup TO postgres;
GRANT ALL ON TABLE public.accounts_payable_backup TO anon;
GRANT ALL ON TABLE public.accounts_payable_backup TO authenticated;
GRANT ALL ON TABLE public.accounts_payable_backup TO service_role;


-- public.billings definition

-- Drop table

-- DROP TABLE public.billings;

CREATE TABLE public.billings ( id uuid DEFAULT uuid_generate_v4() NOT NULL, customer_id uuid NULL, customer_name varchar(255) NULL, amount numeric(12, 2) NOT NULL, due_date date NOT NULL, status varchar(50) DEFAULT 'Pendente'::character varying NULL, payment_date date NULL, created_at timestamp DEFAULT now() NULL, updated_at timestamp DEFAULT now() NULL, segment_id uuid NULL, CONSTRAINT billings_pkey PRIMARY KEY (id));
CREATE INDEX idx_billings_customer_id ON public.billings USING btree (customer_id);
CREATE INDEX idx_billings_due_date ON public.billings USING btree (due_date);
CREATE INDEX idx_billings_segment_id ON public.billings USING btree (segment_id);
CREATE INDEX idx_billings_status ON public.billings USING btree (status);

-- Table Triggers

create trigger update_billings_updated_at before
update
    on
    public.billings for each row execute function update_updated_at_column();

-- Permissions

ALTER TABLE public.billings OWNER TO postgres;
GRANT ALL ON TABLE public.billings TO postgres;
GRANT ALL ON TABLE public.billings TO anon;
GRANT ALL ON TABLE public.billings TO authenticated;
GRANT ALL ON TABLE public.billings TO service_role;


-- public.cost_centers definition

-- Drop table

-- DROP TABLE public.cost_centers;

CREATE TABLE public.cost_centers ( id uuid DEFAULT uuid_generate_v4() NOT NULL, "name" varchar(255) NOT NULL, created_at timestamp DEFAULT now() NULL, updated_at timestamp DEFAULT now() NULL, segment_id uuid NULL, CONSTRAINT cost_centers_pkey PRIMARY KEY (id));
CREATE INDEX idx_cost_centers_segment_id ON public.cost_centers USING btree (segment_id);

-- Table Triggers

create trigger update_cost_centers_updated_at before
update
    on
    public.cost_centers for each row execute function update_updated_at_column();

-- Permissions

ALTER TABLE public.cost_centers OWNER TO postgres;
GRANT ALL ON TABLE public.cost_centers TO postgres;
GRANT ALL ON TABLE public.cost_centers TO anon;
GRANT ALL ON TABLE public.cost_centers TO authenticated;
GRANT ALL ON TABLE public.cost_centers TO service_role;


-- public.customers_backup definition

-- Drop table

-- DROP TABLE public.customers_backup;

CREATE TABLE public.customers_backup ( id uuid NULL, "name" varchar(255) NULL, cpf varchar(20) NULL, email varchar(255) NULL, phone varchar(20) NULL, address text NULL, city varchar(100) NULL, state varchar(2) NULL, total_purchases numeric(12, 2) NULL, last_purchase_date date NULL, created_at timestamp NULL, updated_at timestamp NULL, segment_id uuid NULL);

-- Permissions

ALTER TABLE public.customers_backup OWNER TO postgres;
GRANT ALL ON TABLE public.customers_backup TO postgres;
GRANT ALL ON TABLE public.customers_backup TO anon;
GRANT ALL ON TABLE public.customers_backup TO authenticated;
GRANT ALL ON TABLE public.customers_backup TO service_role;


-- public.integrations definition

-- Drop table

-- DROP TABLE public.integrations;

CREATE TABLE public.integrations ( id uuid DEFAULT uuid_generate_v4() NOT NULL, service_name varchar(100) NOT NULL, api_key text NULL, enabled bool DEFAULT false NULL, config jsonb NULL, created_at timestamp DEFAULT now() NULL, updated_at timestamp DEFAULT now() NULL, segment_id uuid NULL, CONSTRAINT integrations_pkey PRIMARY KEY (id));
CREATE INDEX idx_integrations_segment_id ON public.integrations USING btree (segment_id);

-- Table Triggers

create trigger update_integrations_updated_at before
update
    on
    public.integrations for each row execute function update_updated_at_column();

-- Permissions

ALTER TABLE public.integrations OWNER TO postgres;
GRANT ALL ON TABLE public.integrations TO postgres;
GRANT ALL ON TABLE public.integrations TO anon;
GRANT ALL ON TABLE public.integrations TO authenticated;
GRANT ALL ON TABLE public.integrations TO service_role;


-- public.nfe definition

-- Drop table

-- DROP TABLE public.nfe;

CREATE TABLE public.nfe ( id uuid DEFAULT uuid_generate_v4() NOT NULL, "number" text NOT NULL, customer_name text NOT NULL, "date" date NOT NULL, total numeric(10, 2) NOT NULL, status text DEFAULT 'Emitida'::text NULL, segment_id int4 NULL, created_at timestamp DEFAULT now() NULL, updated_at timestamp DEFAULT now() NULL, CONSTRAINT nfe_pkey PRIMARY KEY (id), CONSTRAINT nfe_status_check CHECK ((status = ANY (ARRAY['Emitida'::text, 'Cancelada'::text]))));
CREATE INDEX idx_nfe_segment_id ON public.nfe USING btree (segment_id);

-- Table Triggers

create trigger update_nfe_updated_at before
update
    on
    public.nfe for each row execute function update_updated_at_column();

-- Permissions

ALTER TABLE public.nfe OWNER TO postgres;
GRANT ALL ON TABLE public.nfe TO postgres;
GRANT ALL ON TABLE public.nfe TO anon;
GRANT ALL ON TABLE public.nfe TO authenticated;
GRANT ALL ON TABLE public.nfe TO service_role;


-- public.nfe_list definition

-- Drop table

-- DROP TABLE public.nfe_list;

CREATE TABLE public.nfe_list ( id uuid DEFAULT uuid_generate_v4() NOT NULL, "number" varchar(20) NOT NULL, customer_name varchar(255) NULL, "date" date NOT NULL, total numeric(12, 2) NOT NULL, status varchar(50) DEFAULT 'Emitida'::character varying NULL, created_at timestamp DEFAULT now() NULL, updated_at timestamp DEFAULT now() NULL, CONSTRAINT nfe_list_number_key UNIQUE (number), CONSTRAINT nfe_list_pkey PRIMARY KEY (id));
CREATE INDEX idx_nfe_list_date ON public.nfe_list USING btree (date);
CREATE INDEX idx_nfe_list_status ON public.nfe_list USING btree (status);

-- Table Triggers

create trigger update_nfe_list_updated_at before
update
    on
    public.nfe_list for each row execute function update_updated_at_column();

-- Permissions

ALTER TABLE public.nfe_list OWNER TO postgres;
GRANT ALL ON TABLE public.nfe_list TO postgres;
GRANT ALL ON TABLE public.nfe_list TO anon;
GRANT ALL ON TABLE public.nfe_list TO authenticated;
GRANT ALL ON TABLE public.nfe_list TO service_role;


-- public.partners definition

-- Drop table

-- DROP TABLE public.partners;

CREATE TABLE public.partners ( id uuid DEFAULT uuid_generate_v4() NOT NULL, "name" varchar NOT NULL, tax_id varchar NULL, email varchar NULL, phone varchar NULL, address text NULL, city varchar NULL, state varchar NULL, zip_code varchar NULL, notes text NULL, status varchar DEFAULT 'active'::character varying NULL, created_at timestamp DEFAULT now() NULL, updated_at timestamp DEFAULT now() NULL, segment_id uuid NULL, CONSTRAINT partners_pkey PRIMARY KEY (id), CONSTRAINT partners_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'suspended'::character varying])::text[]))), CONSTRAINT partners_tax_id_unique UNIQUE (tax_id));
CREATE INDEX idx_partners_name ON public.partners USING btree (name);
CREATE INDEX idx_partners_segment_id ON public.partners USING btree (segment_id);
CREATE INDEX idx_partners_status ON public.partners USING btree (status);

-- Table Triggers

create trigger trg_update_partners_updated_at before
update
    on
    public.partners for each row execute function update_partners_updated_at();

-- Permissions

ALTER TABLE public.partners OWNER TO postgres;
GRANT ALL ON TABLE public.partners TO postgres;
GRANT ALL ON TABLE public.partners TO anon;
GRANT ALL ON TABLE public.partners TO authenticated;
GRANT ALL ON TABLE public.partners TO service_role;


-- public.products definition

-- Drop table

-- DROP TABLE public.products;

CREATE TABLE public.products ( id uuid DEFAULT uuid_generate_v4() NOT NULL, "name" varchar(255) NOT NULL, stock int4 DEFAULT 0 NULL, min_stock int4 DEFAULT 0 NULL, price numeric(12, 2) NOT NULL, category varchar(100) NULL, created_at timestamp DEFAULT now() NULL, updated_at timestamp DEFAULT now() NULL, segment_id uuid NULL, code varchar NULL, description text NULL, cost_price numeric DEFAULT 0 NULL, stock_quantity int4 DEFAULT 0 NULL, minimum_stock int4 DEFAULT 0 NULL, supplier varchar NULL, CONSTRAINT products_pkey PRIMARY KEY (id));
CREATE INDEX idx_products_segment_id ON public.products USING btree (segment_id);

-- Table Triggers

create trigger update_products_updated_at before
update
    on
    public.products for each row execute function update_updated_at_column();

-- Permissions

ALTER TABLE public.products OWNER TO postgres;
GRANT ALL ON TABLE public.products TO postgres;
GRANT ALL ON TABLE public.products TO anon;
GRANT ALL ON TABLE public.products TO authenticated;
GRANT ALL ON TABLE public.products TO service_role;


-- public.sales definition

-- Drop table

-- DROP TABLE public.sales;

CREATE TABLE public.sales ( id uuid DEFAULT uuid_generate_v4() NOT NULL, customer_id uuid NULL, customer_name varchar(255) NULL, product varchar(255) NULL, quantity int4 NOT NULL, total numeric(12, 2) NOT NULL, "date" date NOT NULL, status varchar(50) DEFAULT 'Pendente'::character varying NULL, created_at timestamp DEFAULT now() NULL, updated_at timestamp DEFAULT now() NULL, segment_id uuid NULL, sale_date date NULL, total_amount numeric NULL, payment_method varchar DEFAULT 'cash'::character varying NULL, notes text NULL, CONSTRAINT sales_pkey PRIMARY KEY (id));
CREATE INDEX idx_sales_customer_id ON public.sales USING btree (customer_id);
CREATE INDEX idx_sales_date ON public.sales USING btree (date);
CREATE INDEX idx_sales_segment_id ON public.sales USING btree (segment_id);

-- Table Triggers

create trigger update_sales_updated_at before
update
    on
    public.sales for each row execute function update_updated_at_column();

-- Permissions

ALTER TABLE public.sales OWNER TO postgres;
GRANT ALL ON TABLE public.sales TO postgres;
GRANT ALL ON TABLE public.sales TO anon;
GRANT ALL ON TABLE public.sales TO authenticated;
GRANT ALL ON TABLE public.sales TO service_role;


-- public.segments definition

-- Drop table

-- DROP TABLE public.segments;

CREATE TABLE public.segments ( id uuid DEFAULT uuid_generate_v4() NOT NULL, "name" varchar(255) NOT NULL, description text NULL, created_at timestamp DEFAULT now() NULL, updated_at timestamp DEFAULT now() NULL, CONSTRAINT segments_pkey PRIMARY KEY (id));

-- Table Triggers

create trigger update_segments_updated_at before
update
    on
    public.segments for each row execute function update_updated_at_column();

-- Permissions

ALTER TABLE public.segments OWNER TO postgres;
GRANT ALL ON TABLE public.segments TO postgres;
GRANT ALL ON TABLE public.segments TO anon;
GRANT ALL ON TABLE public.segments TO authenticated;
GRANT ALL ON TABLE public.segments TO service_role;


-- public.transactions definition

-- Drop table

-- DROP TABLE public.transactions;

CREATE TABLE public.transactions ( id uuid DEFAULT uuid_generate_v4() NOT NULL, "type" varchar(20) NOT NULL, description text NULL, amount numeric(12, 2) NOT NULL, "date" date NOT NULL, category varchar(100) NULL, cost_center varchar(100) NULL, created_at timestamp DEFAULT now() NULL, updated_at timestamp DEFAULT now() NULL, segment_id uuid NULL, CONSTRAINT transactions_pkey PRIMARY KEY (id));
CREATE INDEX idx_transactions_date ON public.transactions USING btree (date);
CREATE INDEX idx_transactions_segment_id ON public.transactions USING btree (segment_id);
CREATE INDEX idx_transactions_type ON public.transactions USING btree (type);

-- Table Triggers

create trigger update_transactions_updated_at before
update
    on
    public.transactions for each row execute function update_updated_at_column();

-- Permissions

ALTER TABLE public.transactions OWNER TO postgres;
GRANT ALL ON TABLE public.transactions TO postgres;
GRANT ALL ON TABLE public.transactions TO anon;
GRANT ALL ON TABLE public.transactions TO authenticated;
GRANT ALL ON TABLE public.transactions TO service_role;


-- public.users definition

-- Drop table

-- DROP TABLE public.users;

CREATE TABLE public.users ( id uuid DEFAULT uuid_generate_v4() NOT NULL, "name" varchar(255) NOT NULL, email varchar(255) NOT NULL, "password" varchar(255) NOT NULL, "role" varchar(50) DEFAULT 'user'::character varying NULL, status text DEFAULT 'ativo'::text NULL, segment_id int4 NULL, created_at timestamp DEFAULT now() NULL, updated_at timestamp DEFAULT now() NULL, CONSTRAINT users_email_key UNIQUE (email), CONSTRAINT users_pkey PRIMARY KEY (id));

-- Table Triggers

create trigger update_users_updated_at before
update
    on
    public.users for each row execute function update_updated_at_column();

-- Permissions

ALTER TABLE public.users OWNER TO postgres;
GRANT ALL ON TABLE public.users TO postgres;
GRANT ALL ON TABLE public.users TO anon;
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;


-- public.account_categories definition

-- Drop table

-- DROP TABLE public.account_categories;

CREATE TABLE public.account_categories ( id uuid DEFAULT uuid_generate_v4() NOT NULL, "name" varchar NOT NULL, description text NULL, color varchar DEFAULT '#3B82F6'::character varying NULL, created_at timestamp DEFAULT now() NULL, updated_at timestamp DEFAULT now() NULL, segment_id uuid NULL, CONSTRAINT account_categories_pkey PRIMARY KEY (id), CONSTRAINT account_categories_segment_id_fkey FOREIGN KEY (segment_id) REFERENCES public.segments(id) ON DELETE SET NULL);

-- Permissions

ALTER TABLE public.account_categories OWNER TO postgres;
GRANT ALL ON TABLE public.account_categories TO postgres;
GRANT ALL ON TABLE public.account_categories TO anon;
GRANT ALL ON TABLE public.account_categories TO authenticated;
GRANT ALL ON TABLE public.account_categories TO service_role;


-- public.customers definition

-- Drop table

-- DROP TABLE public.customers;

CREATE TABLE public.customers ( id uuid DEFAULT uuid_generate_v4() NOT NULL, "name" varchar NOT NULL, tipo_pessoa varchar DEFAULT 'pf'::character varying NOT NULL, cpf varchar NULL, cnpj varchar NULL, rg varchar NULL, data_nascimento date NULL, estado_civil varchar NULL, profissao varchar NULL, empresa varchar NULL, cargo varchar NULL, data_admissao date NULL, tipo_documento varchar NULL, numero_documento varchar NULL, data_emissao date NULL, data_validade date NULL, orgao_emissor varchar NULL, documento_image_url text NULL, documentos jsonb DEFAULT '[]'::jsonb NULL, cnpj_origem_renda varchar NULL, data_admissao_renda date NULL, cargo_renda varchar NULL, tipo_renda varchar NULL, renda_bruta numeric(15, 2) NULL, salario_liquido numeric(15, 2) NULL, valor_imposto_renda numeric(15, 2) NULL, data_comprovacao date NULL, documento_renda_image_url text NULL, renda_mensal numeric(15, 2) NULL, renda_complementar numeric(15, 2) NULL, origem_renda varchar NULL, comprovantes_renda jsonb DEFAULT '[]'::jsonb NULL, cep varchar NULL, logradouro varchar NULL, numero varchar NULL, complemento varchar NULL, bairro varchar NULL, cidade varchar NULL, estado varchar NULL, tipo_imovel varchar NULL, data_referencia date NULL, telefone varchar NULL, tipo_telefone varchar DEFAULT 'residencial'::character varying NULL, celular varchar NULL, email varchar NULL, telefone_comercial varchar NULL, data_referencia_contato date NULL, possui_patrimonio bool DEFAULT false NULL, valor_patrimonio numeric(15, 2) NULL, descricao_patrimonio text NULL, status varchar DEFAULT 'pendente'::character varying NULL, observacoes text NULL, responsavel_cadastro varchar NULL, data_cadastro date DEFAULT CURRENT_DATE NULL, total_purchases numeric DEFAULT 0 NULL, last_purchase_date date NULL, created_at timestamp DEFAULT now() NULL, updated_at timestamp DEFAULT now() NULL, segment_id uuid NULL, CONSTRAINT customers_cnpj_unique UNIQUE (cnpj), CONSTRAINT customers_cpf_unique UNIQUE (cpf), CONSTRAINT customers_email_unique UNIQUE (email), CONSTRAINT customers_pkey PRIMARY KEY (id), CONSTRAINT customers_status_check CHECK (((status)::text = ANY ((ARRAY['pendente'::character varying, 'em_analise'::character varying, 'aprovado'::character varying, 'reprovado'::character varying, 'suspenso'::character varying])::text[]))), CONSTRAINT customers_tipo_pessoa_check CHECK (((tipo_pessoa)::text = ANY ((ARRAY['pf'::character varying, 'pj'::character varying])::text[]))), CONSTRAINT customers_segment_id_fkey FOREIGN KEY (segment_id) REFERENCES public.segments(id) ON DELETE SET NULL);
CREATE INDEX idx_customers_cnpj ON public.customers USING btree (cnpj);
CREATE INDEX idx_customers_cpf ON public.customers USING btree (cpf);
CREATE INDEX idx_customers_created_at ON public.customers USING btree (created_at);
CREATE INDEX idx_customers_email ON public.customers USING btree (email);
CREATE INDEX idx_customers_name ON public.customers USING btree (name);
CREATE INDEX idx_customers_segment_id ON public.customers USING btree (segment_id);
CREATE INDEX idx_customers_status ON public.customers USING btree (status);

-- Table Triggers

create trigger update_customers_updated_at before
update
    on
    public.customers for each row execute function update_customers_updated_at();

-- Permissions

ALTER TABLE public.customers OWNER TO postgres;
GRANT ALL ON TABLE public.customers TO postgres;
GRANT ALL ON TABLE public.customers TO anon;
GRANT ALL ON TABLE public.customers TO authenticated;
GRANT ALL ON TABLE public.customers TO service_role;


-- public.financial_documents definition

-- Drop table

-- DROP TABLE public.financial_documents;

CREATE TABLE public.financial_documents ( id uuid DEFAULT uuid_generate_v4() NOT NULL, partner_id uuid NULL, direction varchar NOT NULL, doc_no varchar NULL, issue_date date NULL, due_date date NULL, amount numeric(15, 2) NOT NULL, balance numeric(15, 2) DEFAULT 0 NOT NULL, status varchar DEFAULT 'open'::character varying NOT NULL, category_id uuid NULL, segment_id uuid NULL, description text NULL, payment_method varchar NULL, notes text NULL, created_at timestamp DEFAULT now() NULL, updated_at timestamp DEFAULT now() NULL, CONSTRAINT financial_documents_direction_check CHECK (((direction)::text = ANY ((ARRAY['receivable'::character varying, 'payable'::character varying])::text[]))), CONSTRAINT financial_documents_pkey PRIMARY KEY (id), CONSTRAINT financial_documents_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'open'::character varying, 'partially_paid'::character varying, 'paid'::character varying, 'canceled'::character varying])::text[]))), CONSTRAINT financial_documents_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.account_categories(id) ON DELETE SET NULL, CONSTRAINT financial_documents_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON DELETE SET NULL, CONSTRAINT financial_documents_segment_id_fkey FOREIGN KEY (segment_id) REFERENCES public.segments(id) ON DELETE SET NULL);
CREATE INDEX idx_fin_docs_direction ON public.financial_documents USING btree (direction);
CREATE INDEX idx_fin_docs_due_date ON public.financial_documents USING btree (due_date);
CREATE INDEX idx_fin_docs_partner_id ON public.financial_documents USING btree (partner_id);
CREATE INDEX idx_fin_docs_segment_id ON public.financial_documents USING btree (segment_id);
CREATE INDEX idx_fin_docs_status ON public.financial_documents USING btree (status);

-- Table Triggers

create trigger trg_update_fin_docs_updated_at before
update
    on
    public.financial_documents for each row execute function update_fin_docs_updated_at();

-- Permissions

ALTER TABLE public.financial_documents OWNER TO postgres;
GRANT ALL ON TABLE public.financial_documents TO postgres;
GRANT ALL ON TABLE public.financial_documents TO anon;
GRANT ALL ON TABLE public.financial_documents TO authenticated;
GRANT ALL ON TABLE public.financial_documents TO service_role;


-- public.financial_installments definition

-- Drop table

-- DROP TABLE public.financial_installments;

CREATE TABLE public.financial_installments ( id uuid DEFAULT uuid_generate_v4() NOT NULL, document_id uuid NOT NULL, installment_number int4 DEFAULT 1 NOT NULL, due_date date NOT NULL, amount numeric(15, 2) NOT NULL, paid_amount numeric(15, 2) DEFAULT 0 NOT NULL, status varchar DEFAULT 'open'::character varying NOT NULL, paid_date date NULL, created_at timestamp DEFAULT now() NULL, updated_at timestamp DEFAULT now() NULL, CONSTRAINT financial_installments_pkey PRIMARY KEY (id), CONSTRAINT financial_installments_status_check CHECK (((status)::text = ANY ((ARRAY['open'::character varying, 'paid'::character varying, 'canceled'::character varying])::text[]))), CONSTRAINT financial_installments_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.financial_documents(id) ON DELETE CASCADE);
CREATE INDEX idx_fin_inst_doc_id ON public.financial_installments USING btree (document_id);
CREATE INDEX idx_fin_inst_due_date ON public.financial_installments USING btree (due_date);

-- Permissions

ALTER TABLE public.financial_installments OWNER TO postgres;
GRANT ALL ON TABLE public.financial_installments TO postgres;
GRANT ALL ON TABLE public.financial_installments TO anon;
GRANT ALL ON TABLE public.financial_installments TO authenticated;
GRANT ALL ON TABLE public.financial_installments TO service_role;


-- public.financial_payments definition

-- Drop table

-- DROP TABLE public.financial_payments;

CREATE TABLE public.financial_payments ( id uuid DEFAULT uuid_generate_v4() NOT NULL, payment_date date DEFAULT CURRENT_DATE NOT NULL, amount numeric(15, 2) NOT NULL, "method" varchar NULL, reference varchar NULL, notes text NULL, segment_id uuid NULL, created_at timestamp DEFAULT now() NULL, updated_at timestamp DEFAULT now() NULL, CONSTRAINT financial_payments_pkey PRIMARY KEY (id), CONSTRAINT financial_payments_segment_id_fkey FOREIGN KEY (segment_id) REFERENCES public.segments(id) ON DELETE SET NULL);

-- Permissions

ALTER TABLE public.financial_payments OWNER TO postgres;
GRANT ALL ON TABLE public.financial_payments TO postgres;
GRANT ALL ON TABLE public.financial_payments TO anon;
GRANT ALL ON TABLE public.financial_payments TO authenticated;
GRANT ALL ON TABLE public.financial_payments TO service_role;


-- public.partner_roles definition

-- Drop table

-- DROP TABLE public.partner_roles;

CREATE TABLE public.partner_roles ( partner_id uuid NOT NULL, "role" varchar NOT NULL, created_at timestamp DEFAULT now() NULL, CONSTRAINT partner_roles_pkey PRIMARY KEY (partner_id, role), CONSTRAINT partner_roles_role_check CHECK (((role)::text = ANY ((ARRAY['customer'::character varying, 'supplier'::character varying, 'employee'::character varying])::text[]))), CONSTRAINT partner_roles_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON DELETE CASCADE);
CREATE INDEX idx_partner_roles_role ON public.partner_roles USING btree (role);

-- Permissions

ALTER TABLE public.partner_roles OWNER TO postgres;
GRANT ALL ON TABLE public.partner_roles TO postgres;
GRANT ALL ON TABLE public.partner_roles TO anon;
GRANT ALL ON TABLE public.partner_roles TO authenticated;
GRANT ALL ON TABLE public.partner_roles TO service_role;


-- public.suppliers definition

-- Drop table

-- DROP TABLE public.suppliers;

CREATE TABLE public.suppliers ( id uuid DEFAULT uuid_generate_v4() NOT NULL, "name" varchar NOT NULL, cnpj varchar NULL, cpf varchar NULL, email varchar NULL, telefone varchar NULL, endereco text NULL, cidade varchar NULL, estado varchar NULL, cep varchar NULL, observacoes text NULL, status varchar DEFAULT 'ativo'::character varying NULL, created_at timestamp DEFAULT now() NULL, updated_at timestamp DEFAULT now() NULL, segment_id uuid NULL, CONSTRAINT suppliers_cnpj_unique UNIQUE (cnpj), CONSTRAINT suppliers_cpf_unique UNIQUE (cpf), CONSTRAINT suppliers_pkey PRIMARY KEY (id), CONSTRAINT suppliers_status_check CHECK (((status)::text = ANY ((ARRAY['ativo'::character varying, 'inativo'::character varying, 'suspenso'::character varying])::text[]))), CONSTRAINT suppliers_segment_id_fkey FOREIGN KEY (segment_id) REFERENCES public.segments(id) ON DELETE SET NULL);

-- Permissions

ALTER TABLE public.suppliers OWNER TO postgres;
GRANT ALL ON TABLE public.suppliers TO postgres;
GRANT ALL ON TABLE public.suppliers TO anon;
GRANT ALL ON TABLE public.suppliers TO authenticated;
GRANT ALL ON TABLE public.suppliers TO service_role;


-- public.accounts_payable definition

-- Drop table

-- DROP TABLE public.accounts_payable;

CREATE TABLE public.accounts_payable ( id uuid DEFAULT uuid_generate_v4() NOT NULL, supplier_id uuid NULL, numero_nota_fiscal varchar NULL, descricao text NOT NULL, valor numeric(15, 2) NOT NULL, data_vencimento date NOT NULL, data_pagamento date NULL, status varchar DEFAULT 'pendente'::character varying NULL, categoria_id uuid NULL, forma_pagamento varchar DEFAULT 'boleto'::character varying NULL, observacoes text NULL, responsavel_pagamento varchar NULL, numero_parcela int4 DEFAULT 1 NULL, total_parcelas int4 DEFAULT 1 NULL, created_at timestamp DEFAULT now() NULL, updated_at timestamp DEFAULT now() NULL, segment_id uuid NULL, CONSTRAINT accounts_payable_forma_pagamento_check CHECK (((forma_pagamento)::text = ANY ((ARRAY['boleto'::character varying, 'pix'::character varying, 'transferencia'::character varying, 'dinheiro'::character varying, 'cartao'::character varying, 'cheque'::character varying])::text[]))), CONSTRAINT accounts_payable_pkey PRIMARY KEY (id), CONSTRAINT accounts_payable_status_check CHECK (((status)::text = ANY ((ARRAY['pendente'::character varying, 'paga'::character varying, 'vencida'::character varying, 'cancelada'::character varying])::text[]))), CONSTRAINT accounts_payable_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.account_categories(id) ON DELETE SET NULL, CONSTRAINT accounts_payable_segment_id_fkey FOREIGN KEY (segment_id) REFERENCES public.segments(id) ON DELETE SET NULL, CONSTRAINT accounts_payable_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE SET NULL);
CREATE INDEX idx_accounts_payable_categoria_id ON public.accounts_payable USING btree (categoria_id);
CREATE INDEX idx_accounts_payable_created_at ON public.accounts_payable USING btree (created_at);
CREATE INDEX idx_accounts_payable_data_pagamento ON public.accounts_payable USING btree (data_pagamento);
CREATE INDEX idx_accounts_payable_data_vencimento ON public.accounts_payable USING btree (data_vencimento);
CREATE INDEX idx_accounts_payable_segment_id ON public.accounts_payable USING btree (segment_id);
CREATE INDEX idx_accounts_payable_status ON public.accounts_payable USING btree (status);
CREATE INDEX idx_accounts_payable_supplier_id ON public.accounts_payable USING btree (supplier_id);

-- Table Triggers

create trigger update_accounts_payable_updated_at before
update
    on
    public.accounts_payable for each row execute function update_accounts_payable_updated_at();

-- Permissions

ALTER TABLE public.accounts_payable OWNER TO postgres;
GRANT ALL ON TABLE public.accounts_payable TO postgres;
GRANT ALL ON TABLE public.accounts_payable TO anon;
GRANT ALL ON TABLE public.accounts_payable TO authenticated;
GRANT ALL ON TABLE public.accounts_payable TO service_role;


-- public.financial_document_payments definition

-- Drop table

-- DROP TABLE public.financial_document_payments;

CREATE TABLE public.financial_document_payments ( id uuid DEFAULT uuid_generate_v4() NOT NULL, document_id uuid NOT NULL, installment_id uuid NULL, payment_id uuid NOT NULL, amount_applied numeric(15, 2) NOT NULL, created_at timestamp DEFAULT now() NULL, CONSTRAINT financial_document_payments_pkey PRIMARY KEY (id), CONSTRAINT financial_document_payments_document_fkey FOREIGN KEY (document_id) REFERENCES public.financial_documents(id) ON DELETE CASCADE, CONSTRAINT financial_document_payments_installment_fkey FOREIGN KEY (installment_id) REFERENCES public.financial_installments(id) ON DELETE SET NULL, CONSTRAINT financial_document_payments_payment_fkey FOREIGN KEY (payment_id) REFERENCES public.financial_payments(id) ON DELETE CASCADE);
CREATE INDEX idx_fin_doc_pay_doc_id ON public.financial_document_payments USING btree (document_id);
CREATE INDEX idx_fin_doc_pay_payment_id ON public.financial_document_payments USING btree (payment_id);

-- Permissions

ALTER TABLE public.financial_document_payments OWNER TO postgres;
GRANT ALL ON TABLE public.financial_document_payments TO postgres;
GRANT ALL ON TABLE public.financial_document_payments TO anon;
GRANT ALL ON TABLE public.financial_document_payments TO authenticated;
GRANT ALL ON TABLE public.financial_document_payments TO service_role;



-- DROP FUNCTION public.update_accounts_payable_updated_at();

CREATE OR REPLACE FUNCTION public.update_accounts_payable_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.update_accounts_payable_updated_at() OWNER TO postgres;
GRANT ALL ON FUNCTION public.update_accounts_payable_updated_at() TO public;
GRANT ALL ON FUNCTION public.update_accounts_payable_updated_at() TO postgres;
GRANT ALL ON FUNCTION public.update_accounts_payable_updated_at() TO anon;
GRANT ALL ON FUNCTION public.update_accounts_payable_updated_at() TO authenticated;
GRANT ALL ON FUNCTION public.update_accounts_payable_updated_at() TO service_role;

-- DROP FUNCTION public.update_customers_updated_at();

CREATE OR REPLACE FUNCTION public.update_customers_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.update_customers_updated_at() OWNER TO postgres;
GRANT ALL ON FUNCTION public.update_customers_updated_at() TO public;
GRANT ALL ON FUNCTION public.update_customers_updated_at() TO postgres;
GRANT ALL ON FUNCTION public.update_customers_updated_at() TO anon;
GRANT ALL ON FUNCTION public.update_customers_updated_at() TO authenticated;
GRANT ALL ON FUNCTION public.update_customers_updated_at() TO service_role;

-- DROP FUNCTION public.update_fin_docs_updated_at();

CREATE OR REPLACE FUNCTION public.update_fin_docs_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.update_fin_docs_updated_at() OWNER TO postgres;
GRANT ALL ON FUNCTION public.update_fin_docs_updated_at() TO public;
GRANT ALL ON FUNCTION public.update_fin_docs_updated_at() TO postgres;
GRANT ALL ON FUNCTION public.update_fin_docs_updated_at() TO anon;
GRANT ALL ON FUNCTION public.update_fin_docs_updated_at() TO authenticated;
GRANT ALL ON FUNCTION public.update_fin_docs_updated_at() TO service_role;

-- DROP FUNCTION public.update_partners_updated_at();

CREATE OR REPLACE FUNCTION public.update_partners_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.update_partners_updated_at() OWNER TO postgres;
GRANT ALL ON FUNCTION public.update_partners_updated_at() TO public;
GRANT ALL ON FUNCTION public.update_partners_updated_at() TO postgres;
GRANT ALL ON FUNCTION public.update_partners_updated_at() TO anon;
GRANT ALL ON FUNCTION public.update_partners_updated_at() TO authenticated;
GRANT ALL ON FUNCTION public.update_partners_updated_at() TO service_role;

-- DROP FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO public;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO postgres;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO anon;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO authenticated;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO service_role;

-- DROP FUNCTION public.validate_cnpj(text);

CREATE OR REPLACE FUNCTION public.validate_cnpj(cnpj text)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
  cnpj_clean text;
  i integer;
  sum1 integer := 0;
  sum2 integer := 0;
  digit1 integer;
  digit2 integer;
  weights1 integer[] := ARRAY[5,4,3,2,9,8,7,6,5,4,3,2];
  weights2 integer[] := ARRAY[6,5,4,3,2,9,8,7,6,5,4,3,2];
BEGIN
  -- Remove caracteres não numéricos
  cnpj_clean := regexp_replace(cnpj, '[^0-9]', '', 'g');
  
  -- Verifica se tem 14 dígitos
  IF length(cnpj_clean) != 14 THEN
    RETURN false;
  END IF;
  
  -- Verifica se todos os dígitos são iguais
  IF cnpj_clean = regexp_replace(cnpj_clean, '^(\d)\1*$', '\1', 'g') THEN
    RETURN false;
  END IF;
  
  -- Calcula primeiro dígito verificador
  FOR i IN 1..12 LOOP
    sum1 := sum1 + (substring(cnpj_clean, i, 1)::integer * weights1[i]);
  END LOOP;
  
  digit1 := 11 - (sum1 % 11);
  IF digit1 >= 10 THEN
    digit1 := 0;
  END IF;
  
  -- Calcula segundo dígito verificador
  FOR i IN 1..13 LOOP
    sum2 := sum2 + (substring(cnpj_clean, i, 1)::integer * weights2[i]);
  END LOOP;
  
  digit2 := 11 - (sum2 % 11);
  IF digit2 >= 10 THEN
    digit2 := 0;
  END IF;
  
  -- Verifica se os dígitos verificadores estão corretos
  RETURN (substring(cnpj_clean, 13, 1)::integer = digit1 AND 
          substring(cnpj_clean, 14, 1)::integer = digit2);
END;
$function$
;

-- Permissions

ALTER FUNCTION public.validate_cnpj(text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.validate_cnpj(text) TO public;
GRANT ALL ON FUNCTION public.validate_cnpj(text) TO postgres;
GRANT ALL ON FUNCTION public.validate_cnpj(text) TO anon;
GRANT ALL ON FUNCTION public.validate_cnpj(text) TO authenticated;
GRANT ALL ON FUNCTION public.validate_cnpj(text) TO service_role;

-- DROP FUNCTION public.validate_cpf(text);

CREATE OR REPLACE FUNCTION public.validate_cpf(cpf text)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
  cpf_clean text;
  i integer;
  sum1 integer := 0;
  sum2 integer := 0;
  digit1 integer;
  digit2 integer;
BEGIN
  -- Remove caracteres não numéricos
  cpf_clean := regexp_replace(cpf, '[^0-9]', '', 'g');
  
  -- Verifica se tem 11 dígitos
  IF length(cpf_clean) != 11 THEN
    RETURN false;
  END IF;
  
  -- Verifica se todos os dígitos são iguais
  IF cpf_clean = regexp_replace(cpf_clean, '^(\d)\1*$', '\1', 'g') THEN
    RETURN false;
  END IF;
  
  -- Calcula primeiro dígito verificador
  FOR i IN 1..9 LOOP
    sum1 := sum1 + (substring(cpf_clean, i, 1)::integer * (11 - i));
  END LOOP;
  
  digit1 := 11 - (sum1 % 11);
  IF digit1 >= 10 THEN
    digit1 := 0;
  END IF;
  
  -- Calcula segundo dígito verificador
  FOR i IN 1..10 LOOP
    sum2 := sum2 + (substring(cpf_clean, i, 1)::integer * (12 - i));
  END LOOP;
  
  digit2 := 11 - (sum2 % 11);
  IF digit2 >= 10 THEN
    digit2 := 0;
  END IF;
  
  -- Verifica se os dígitos verificadores estão corretos
  RETURN (substring(cpf_clean, 10, 1)::integer = digit1 AND 
          substring(cpf_clean, 11, 1)::integer = digit2);
END;
$function$
;

-- Permissions

ALTER FUNCTION public.validate_cpf(text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.validate_cpf(text) TO public;
GRANT ALL ON FUNCTION public.validate_cpf(text) TO postgres;
GRANT ALL ON FUNCTION public.validate_cpf(text) TO anon;
GRANT ALL ON FUNCTION public.validate_cpf(text) TO authenticated;
GRANT ALL ON FUNCTION public.validate_cpf(text) TO service_role;


-- Permissions

GRANT ALL ON SCHEMA public TO pg_database_owner;
GRANT USAGE ON SCHEMA public TO public;
GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT UPDATE, SELECT, TRUNCATE, MAINTAIN, INSERT, REFERENCES, TRIGGER, DELETE ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT UPDATE, SELECT, TRUNCATE, MAINTAIN, INSERT, REFERENCES, TRIGGER, DELETE ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT UPDATE, SELECT, TRUNCATE, MAINTAIN, INSERT, REFERENCES, TRIGGER, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT UPDATE, SELECT, TRUNCATE, MAINTAIN, INSERT, REFERENCES, TRIGGER, DELETE ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT UPDATE, SELECT, USAGE ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT UPDATE, SELECT, USAGE ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT UPDATE, SELECT, USAGE ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT UPDATE, SELECT, USAGE ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT UPDATE, SELECT, USAGE ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT UPDATE, SELECT, USAGE ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT UPDATE, SELECT, USAGE ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT UPDATE, SELECT, USAGE ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT UPDATE, SELECT, TRUNCATE, MAINTAIN, INSERT, REFERENCES, TRIGGER, DELETE ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT UPDATE, SELECT, TRUNCATE, MAINTAIN, INSERT, REFERENCES, TRIGGER, DELETE ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT UPDATE, SELECT, TRUNCATE, MAINTAIN, INSERT, REFERENCES, TRIGGER, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT UPDATE, SELECT, TRUNCATE, MAINTAIN, INSERT, REFERENCES, TRIGGER, DELETE ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO service_role;