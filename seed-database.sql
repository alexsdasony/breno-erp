-- ========================================
-- SCRIPT DE CRIAÇÃO E POPULAÇÃO DO BANCO DE DADOS
-- Sistema ERP Horizons - PostgreSQL
-- ========================================

-- Limpar dados existentes (caso existam)
DROP TABLE IF EXISTS integrations CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS nfe_list CASCADE;
DROP TABLE IF EXISTS accounts_payable CASCADE;
DROP TABLE IF EXISTS billings CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS segments CASCADE;
DROP TABLE IF EXISTS cost_centers CASCADE;

-- ========================================
-- CRIAÇÃO DAS TABELAS
-- ========================================

-- Tabela de Clientes
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cpf VARCHAR(20),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(2),
    total_purchases DECIMAL(12,2) DEFAULT 0,
    last_purchase_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Produtos
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 0,
    price DECIMAL(12,2) NOT NULL,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Vendas
CREATE TABLE sales (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER,
    customer_name VARCHAR(255),
    product VARCHAR(255),
    quantity INTEGER NOT NULL,
    total DECIMAL(12,2) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Pendente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Tabela de Transações Financeiras
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL, -- 'receita' ou 'despesa'
    description TEXT,
    amount DECIMAL(12,2) NOT NULL,
    date DATE NOT NULL,
    category VARCHAR(100),
    cost_center VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Cobranças/Faturas
CREATE TABLE billings (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER,
    customer_name VARCHAR(255),
    amount DECIMAL(12,2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Pendente',
    payment_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Tabela de Contas a Pagar
CREATE TABLE accounts_payable (
    id SERIAL PRIMARY KEY,
    supplier VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(12,2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Notas Fiscais Eletrônicas
CREATE TABLE nfe_list (
    id SERIAL PRIMARY KEY,
    number VARCHAR(20) NOT NULL UNIQUE,
    customer_name VARCHAR(255),
    date DATE NOT NULL,
    total DECIMAL(12,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Emitida',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Segmentos
CREATE TABLE segments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Centros de Custo
CREATE TABLE cost_centers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Usuários
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Integrações (configurações)
CREATE TABLE integrations (
    id SERIAL PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    api_key TEXT,
    enabled BOOLEAN DEFAULT FALSE,
    config JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- INSERÇÃO DOS DADOS
-- ========================================

-- Inserir Centros de Custo primeiro (dependência para outras tabelas)
INSERT INTO cost_centers (name) VALUES
('Administrativo'),
('Vendas'),
('Marketing'),
('Estoque'),
('Operacional');

-- Inserir Segmentos
INSERT INTO segments (name, description) VALUES
('Imobiliaria', 'Empresa de alguel, vendas e administraçao de ativos.'),
('Serviços', 'Prestação de serviços e consultoria em advocaçia.'),
('Financeira', 'Empresa de emprestimos a PJ.');

-- Inserir Usuários
INSERT INTO users (id, name, email, password, role) VALUES
(0, 'Admin ERP Pro', 'admin@erppro.com', 'admin123', 'admin');

-- Inserir Integrações
INSERT INTO integrations (service_name, api_key, enabled, config) VALUES
('imobzi', '', FALSE, '{"apiKey": "", "enabled": false}');

-- Resetar sequence para manter IDs originais dos clientes
ALTER SEQUENCE customers_id_seq RESTART WITH 1;

-- Inserir dados dos Clientes (primeiros 50 registros para exemplo)
INSERT INTO customers (id, name, cpf, email, phone, address, city, state, total_purchases, last_purchase_date) VALUES
(1, 'Carlos Rodrigues', '929.434.791-28', 'carlos.rodrigues@example.com', '(11) 91752-6526', 'Rua Fictícia, 387', 'São Paulo', 'SP', 8763, '2024-12-06'),
(2, 'Eduardo Lima', '763.658.630-65', 'eduardo.lima@example.com', '(11) 94353-8243', 'Rua Fictícia, 649', 'São Paulo', 'SP', 2612.27, '2025-01-26'),
(3, 'Yasmin Martins', '770.579.987-94', 'yasmin.martins@example.com', '(11) 92946-3613', 'Rua Fictícia, 542', 'São Paulo', 'SP', 8763, '2024-10-14'),
(4, 'Bruno Oliveira', '997.109.580-22', 'bruno.oliveira@example.com', '(11) 98547-5648', 'Rua Fictícia, 573', 'São Paulo', 'SP', 2609.34, '2025-05-24'),
(5, 'Helena Silva', '946.272.687-28', 'helena.silva@example.com', '(11) 95552-1319', 'Rua Fictícia, 134', 'São Paulo', 'SP', 13128.03, '2024-12-03'),
(6, 'Mariana Oliveira', '177.294.307-63', 'mariana.oliveira@example.com', '(11) 93479-9803', 'Rua Fictícia, 991', 'São Paulo', 'SP', 2017.53, '2025-05-05'),
(7, 'Carlos Carvalho', '409.551.401-67', 'carlos.carvalho@example.com', '(11) 96681-3297', 'Rua Fictícia, 877', 'São Paulo', 'SP', 25872.46, '2025-06-05'),
(8, 'Olivia Ribeiro', '515.352.304-25', 'olivia.ribeiro@example.com', '(11) 98495-2952', 'Rua Fictícia, 821', 'São Paulo', 'SP', 5083.7, '2025-06-24'),
(9, 'Sofia Lopes', '675.568.348-28', 'sofia.lopes@example.com', '(11) 96213-3652', 'Rua Fictícia, 484', 'São Paulo', 'SP', 16927.8, '2024-12-10'),
(10, 'Quintino Souza', '739.475.387-81', 'quintino.souza@example.com', '(11) 93647-9431', 'Rua Fictícia, 449', 'São Paulo', 'SP', 29470.26, '2025-06-23'),
(11, 'Helena Alves', '138.314.941-28', 'helena.alves@example.com', '(11) 97842-1170', 'Rua Fictícia, 165', 'São Paulo', 'SP', 23656.5, '2025-02-21'),
(12, 'Lucas Ferreira', '785.258.385-80', 'lucas.ferreira@example.com', '(11) 95520-7926', 'Rua Fictícia, 671', 'São Paulo', 'SP', 32726.98, '2025-05-26'),
(13, 'Igor Gomes', '672.994.291-98', 'igor.gomes@example.com', '(11) 92943-7660', 'Rua Fictícia, 703', 'São Paulo', 'SP', 31122.33, '2025-06-16'),
(14, 'Ursula Silva', '770.250.804-65', 'ursula.silva@example.com', '(11) 95731-7270', 'Rua Fictícia, 762', 'São Paulo', 'SP', 36736.74, '2025-06-09'),
(15, 'Julia Almeida', '725.539.402-20', 'julia.almeida@example.com', '(11) 97695-2989', 'Rua Fictícia, 96', 'São Paulo', 'SP', 10318.9, '2024-12-18'),
(16, 'Yasmin Ferreira', '392.785.518-63', 'yasmin.ferreira@example.com', '(11) 96676-1643', 'Rua Fictícia, 465', 'São Paulo', 'SP', 8425.58, '2025-02-18'),
(17, 'Sofia Silva', '101.482.957-69', 'sofia.silva@example.com', '(11) 97807-8931', 'Rua Fictícia, 223', 'São Paulo', 'SP', 12500.00, '2024-11-15'),
(18, 'Quintino Martins', '123.456.789-01', 'quintino.martins@example.com', '(11) 98765-4321', 'Rua Fictícia, 100', 'São Paulo', 'SP', 15000.00, '2024-12-01'),
(19, 'Carlos Lima', '987.654.321-09', 'carlos.lima@example.com', '(11) 91234-5678', 'Rua Fictícia, 200', 'São Paulo', 'SP', 8000.00, '2024-12-15'),
(20, 'Victor Nunes', '456.789.123-45', 'victor.nunes@example.com', '(11) 95678-1234', 'Rua Fictícia, 300', 'São Paulo', 'SP', 22000.00, '2025-01-10'),
(21, 'Pedro Almeida', '789.123.456-78', 'pedro.almeida@example.com', '(11) 92345-6789', 'Rua Fictícia, 400', 'São Paulo', 'SP', 18500.00, '2024-11-20'),
(22, 'Olivia Oliveira', '321.654.987-32', 'olivia.oliveira@example.com', '(11) 96789-2345', 'Rua Fictícia, 500', 'São Paulo', 'SP', 12300.00, '2024-12-05'),
(23, 'Sofia Martins', '654.987.321-65', 'sofia.martins@example.com', '(11) 93456-7890', 'Rua Fictícia, 600', 'São Paulo', 'SP', 16800.00, '2025-02-01'),
(24, 'Eduardo Ferreira', '147.258.369-14', 'eduardo.ferreira@example.com', '(11) 97890-3456', 'Rua Fictícia, 700', 'São Paulo', 'SP', 14200.00, '2024-12-20'),
(25, 'Nelson Oliveira', '258.369.147-25', 'nelson.oliveira@example.com', '(11) 94567-8901', 'Rua Fictícia, 800', 'São Paulo', 'SP', 19700.00, '2025-01-15'),
(26, 'Zeca Silva', '369.147.258-36', 'zeca.silva@example.com', '(11) 91234-5679', 'Rua Fictícia, 900', 'São Paulo', 'SP', 11500.00, '2024-11-30'),
(27, 'Ana Santos', '741.852.963-74', 'ana.santos@example.com', '(11) 98765-4322', 'Rua Fictícia, 1000', 'São Paulo', 'SP', 13900.00, '2024-12-25'),
(28, 'João Silva', '852.963.741-85', 'joao.silva@example.com', '(11) 95432-1098', 'Rua Fictícia, 1100', 'São Paulo', 'SP', 17600.00, '2025-01-05');

-- Resetar sequence para produtos
ALTER SEQUENCE products_id_seq RESTART WITH 1;

-- Inserir Produtos (primeira parte dos produtos)
INSERT INTO products (id, name, stock, min_stock, price, category) VALUES
(1, 'HD Externo 2TB Mk5', 75, 20, 1286.05, 'Mobiliário'),
(2, 'Impressora Multifuncional Mk5', 56, 10, 1752.6, 'Eletrônicos'),
(3, 'Monitor 4K Mk1', 107, 6, 2609.34, 'Eletrônicos'),
(4, 'Projetor LED Mk5', 97, 10, 1644.42, 'Periféricos'),
(5, 'Projetor LED Mk5', 42, 9, 1603.45, 'Periféricos'),
(6, 'Fone Bluetooth Mk3', 124, 13, 2612.27, 'Periféricos'),
(7, 'Webcam HD Mk2', 90, 15, 124.44, 'Hardware'),
(8, 'Roteador Wi-Fi 6 Mk5', 96, 12, 312.37, 'Hardware'),
(9, 'Roteador Wi-Fi 6 Mk3', 79, 11, 567.13, 'Eletrônicos'),
(10, 'Mouse Gamer Mk4', 134, 9, 2007.78, 'Acessórios'),
(11, 'Teclado Mecânico Mk3', 107, 11, 1549.36, 'Eletrônicos'),
(12, 'Monitor 4K Mk2', 120, 12, 1016.74, 'Eletrônicos'),
(13, 'Projetor LED Mk1', 59, 17, 2326.75, 'Hardware'),
(14, 'Impressora Multifuncional Mk5', 90, 6, 2017.53, 'Periféricos'),
(15, 'Notebook Pro Mk5', 55, 9, 2718.56, 'Mobiliário'),
(16, 'Mouse Gamer Mk5', 145, 10, 497.19, 'Hardware'),
(17, 'Teclado Mecânico Mk3', 131, 20, 2628.5, 'Acessórios'),
(18, 'Placa de Vídeo Mk1', 118, 11, 539.23, 'Acessórios'),
(19, 'Mesa Digitalizadora Mk5', 111, 9, 55.55, 'Acessórios'),
(20, 'Monitor 4K Mk1', 26, 15, 80.12, 'Mobiliário');

-- Inserir Vendas (amostra das primeiras vendas)
INSERT INTO sales (id, customer_id, customer_name, product, quantity, total, date, status) VALUES
(1, 24, 'Carlos Lima', 'Fone Bluetooth Mk3', 2, 5224.54, '2024-12-17', 'Cancelada'),
(2, 1, 'Carlos Rodrigues', 'Impressora Multifuncional Mk5', 1, 1752.6, '2024-10-28', 'Concluída'),
(3, 10, 'Quintino Souza', 'Mouse Gamer Mk5', 3, 1491.57, '2024-08-15', 'Pendente'),
(4, 12, 'Lucas Ferreira', 'Projetor LED Mk1', 5, 11633.75, '2024-11-17', 'Concluída'),
(5, 7, 'Carlos Carvalho', 'Monitor 4K Mk1', 1, 2609.34, '2025-06-05', 'Pendente'),
(6, 14, 'Ursula Silva', 'Teclado Mecânico Mk3', 2, 3098.72, '2025-06-09', 'Concluída'),
(7, 9, 'Sofia Lopes', 'HD Externo 2TB Mk5', 3, 3858.15, '2024-12-10', 'Concluída'),
(8, 5, 'Helena Silva', 'Notebook Pro Mk5', 1, 2718.56, '2024-12-03', 'Concluída'),
(9, 15, 'Julia Almeida', 'Webcam HD Mk2', 5, 622.2, '2024-12-18', 'Pendente'),
(10, 13, 'Igor Gomes', 'Placa de Vídeo Mk1', 4, 2156.92, '2025-06-16', 'Concluída');

-- Inserir Transações Financeiras (amostra)
INSERT INTO transactions (id, type, description, amount, date, category, cost_center) VALUES
(1, 'despesa', 'Contas de Consumo', 179.87, '2024-07-07', 'Administrativo', 'Operacional'),
(2, 'receita', 'Suporte Técnico', 2478.75, '2024-07-12', 'Serviços', NULL),
(3, 'receita', 'Suporte Técnico', 926.88, '2025-01-26', 'Marketing', NULL),
(4, 'despesa', 'Compra de Estoque', 3659.77, '2024-07-30', 'Marketing', 'Operacional'),
(5, 'despesa', 'Aluguel do Escritório', 3535.64, '2025-04-12', 'Vendas', 'Marketing'),
(6, 'despesa', 'Salários', 4522.06, '2024-09-28', 'Vendas', 'Vendas'),
(7, 'receita', 'Suporte Técnico', 562.19, '2025-02-20', 'Administrativo', NULL),
(8, 'receita', 'Assinatura de Software', 3475.74, '2025-01-26', 'Marketing', NULL),
(9, 'receita', 'Serviços de Consultoria', 4069.28, '2024-12-25', 'RH', NULL),
(10, 'despesa', 'Contas de Consumo', 3787.84, '2024-11-15', 'Marketing', 'Marketing');

-- Inserir Cobranças/Faturas (amostra)
INSERT INTO billings (id, customer_id, customer_name, amount, due_date, status, payment_date) VALUES
(1, 17, 'Sofia Silva', 1054.23, '2025-07-18', 'Paga', '2024-08-06'),
(2, 23, 'Olivia Oliveira', 219.93, '2025-07-04', 'Pendente', NULL),
(3, 7, 'Carlos Carvalho', 834.93, '2025-07-13', 'Paga', '2024-10-14'),
(4, 9, 'Sofia Lopes', 470.36, '2025-07-10', 'Pendente', NULL),
(5, 6, 'Mariana Oliveira', 369.41, '2025-07-02', 'Pendente', NULL),
(6, 28, 'Eduardo Ferreira', 364.16, '2025-07-20', 'Pendente', NULL),
(7, 10, 'Quintino Souza', 265.61, '2025-07-01', 'Paga', '2024-10-15'),
(8, 25, 'Pedro Almeida', 311.35, '2025-07-21', 'Paga', '2024-11-03'),
(9, 21, 'Victor Nunes', 437.04, '2025-07-26', 'Paga', '2025-03-06'),
(10, 21, 'Victor Nunes', 990.57, '2025-07-15', 'Paga', '2024-11-23');

-- Inserir Contas a Pagar (amostra)
INSERT INTO accounts_payable (id, supplier, description, amount, due_date, status) VALUES
(1, 'Logística E', 'Salários', 171.16, '2025-06-28', 'paid'),
(2, 'Tech D', 'Salários', 314.65, '2025-07-10', 'paid'),
(3, 'Tech D', 'Fornecedores de Software', 299.52, '2025-07-21', 'pending'),
(4, 'Tech D', 'Manutenção de Equipamentos', 1389.18, '2025-07-17', 'pending'),
(5, 'Tech D', 'Aluguel do Escritório', 2441.94, '2025-07-07', 'pending'),
(6, 'Logística E', 'Salários', 288.96, '2025-07-02', 'pending'),
(7, 'Tech D', 'Marketing Digital', 1264.81, '2025-07-12', 'paid'),
(8, 'Tech D', 'Marketing Digital', 1036.33, '2025-07-26', 'paid'),
(9, 'Serviços F', 'Marketing Digital', 2384.32, '2025-07-06', 'paid'),
(10, 'Logística E', 'Salários', 1024.95, '2025-07-05', 'pending');

-- Inserir NFe (amostra das primeiras notas fiscais)
INSERT INTO nfe_list (id, number, customer_name, date, total, status) VALUES
(1, '00001', 'Carlos Rodrigues', '2024-12-06', 8763.00, 'Emitida'),
(2, '00002', 'Eduardo Lima', '2025-01-26', 2612.27, 'Emitida'),
(3, '00003', 'Yasmin Martins', '2024-10-14', 8763.00, 'Cancelada'),
(4, '00004', 'Bruno Oliveira', '2025-05-24', 2609.34, 'Emitida'),
(5, '00005', 'Helena Silva', '2024-12-03', 13128.03, 'Emitida'),
(6, '00006', 'Mariana Oliveira', '2025-05-05', 2017.53, 'Pendente'),
(7, '00007', 'Carlos Carvalho', '2025-06-05', 25872.46, 'Emitida'),
(8, '00008', 'Olivia Ribeiro', '2025-06-24', 5083.70, 'Emitida'),
(9, '00009', 'Sofia Lopes', '2024-12-10', 16927.80, 'Emitida'),
(10, '00010', 'Quintino Souza', '2025-06-23', 29470.26, 'Emitida');

-- ========================================
-- CRIAÇÃO DE ÍNDICES PARA PERFORMANCE
-- ========================================

-- Índices para melhorar performance das consultas
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_cpf ON customers(cpf);
CREATE INDEX idx_sales_customer_id ON sales(customer_id);
CREATE INDEX idx_sales_date ON sales(date);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_billings_customer_id ON billings(customer_id);
CREATE INDEX idx_billings_due_date ON billings(due_date);
CREATE INDEX idx_billings_status ON billings(status);
CREATE INDEX idx_accounts_payable_due_date ON accounts_payable(due_date);
CREATE INDEX idx_accounts_payable_status ON accounts_payable(status);
CREATE INDEX idx_nfe_list_date ON nfe_list(date);
CREATE INDEX idx_nfe_list_status ON nfe_list(status);

-- ========================================
-- COMENTÁRIOS DAS TABELAS
-- ========================================

COMMENT ON TABLE customers IS 'Tabela de clientes do sistema';
COMMENT ON TABLE products IS 'Tabela de produtos e estoque';
COMMENT ON TABLE sales IS 'Tabela de vendas realizadas';
COMMENT ON TABLE transactions IS 'Tabela de transações financeiras (receitas e despesas)';
COMMENT ON TABLE billings IS 'Tabela de cobranças e faturas';
COMMENT ON TABLE accounts_payable IS 'Tabela de contas a pagar';
COMMENT ON TABLE nfe_list IS 'Tabela de notas fiscais eletrônicas';
COMMENT ON TABLE segments IS 'Tabela de segmentos de negócio';
COMMENT ON TABLE cost_centers IS 'Tabela de centros de custo';
COMMENT ON TABLE users IS 'Tabela de usuários do sistema';
COMMENT ON TABLE integrations IS 'Tabela de configurações de integrações';

-- ========================================
-- FUNÇÕES AUXILIARES
-- ========================================

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar automaticamente o campo updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_billings_updated_at BEFORE UPDATE ON billings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accounts_payable_updated_at BEFORE UPDATE ON accounts_payable FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nfe_list_updated_at BEFORE UPDATE ON nfe_list FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_segments_updated_at BEFORE UPDATE ON segments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cost_centers_updated_at BEFORE UPDATE ON cost_centers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- CONSULTAS DE VERIFICAÇÃO
-- ========================================

-- Verificar se os dados foram inseridos corretamente
SELECT 'customers' as tabela, COUNT(*) as registros FROM customers
UNION ALL
SELECT 'products' as tabela, COUNT(*) as registros FROM products
UNION ALL
SELECT 'sales' as tabela, COUNT(*) as registros FROM sales
UNION ALL
SELECT 'transactions' as tabela, COUNT(*) as registros FROM transactions
UNION ALL
SELECT 'billings' as tabela, COUNT(*) as registros FROM billings
UNION ALL
SELECT 'accounts_payable' as tabela, COUNT(*) as registros FROM accounts_payable
UNION ALL
SELECT 'nfe_list' as tabela, COUNT(*) as registros FROM nfe_list
UNION ALL
SELECT 'segments' as tabela, COUNT(*) as registros FROM segments
UNION ALL
SELECT 'cost_centers' as tabela, COUNT(*) as registros FROM cost_centers
UNION ALL
SELECT 'users' as tabela, COUNT(*) as registros FROM users
UNION ALL
SELECT 'integrations' as tabela, COUNT(*) as registros FROM integrations;

-- ========================================
-- SCRIPT FINALIZADO
-- ========================================

-- Mensagem de sucesso
SELECT 'Database ERP Horizons criado e populado com sucesso!' as status;