-- =============================================
-- COMANDOS SQL PARA INICIALIZAR O BANCO NO RENDER
-- =============================================

-- 1. Criar tabela segments
CREATE TABLE IF NOT EXISTS segments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Criar tabela users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user' CHECK(role IN ('user', 'admin')),
  segment_id INTEGER REFERENCES segments(id),
  status VARCHAR(50) DEFAULT 'ativo' CHECK(status IN ('ativo', 'inativo', 'bloqueado')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Criar tabela cost_centers
CREATE TABLE IF NOT EXISTS cost_centers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  segment_id INTEGER REFERENCES segments(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Criar tabela customers
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  cpf VARCHAR(20),
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  total_purchases DECIMAL(10,2) DEFAULT 0,
  last_purchase_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Criar tabela products
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100),
  segment_id INTEGER REFERENCES segments(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Criar tabela transactions
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL CHECK(type IN ('receita', 'despesa')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  segment_id INTEGER REFERENCES segments(id),
  cost_center_id INTEGER REFERENCES cost_centers(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Inserir segmento padrão
INSERT INTO segments (name, description) 
VALUES ('Geral', 'Segmento geral do sistema')
ON CONFLICT DO NOTHING;

-- 8. Inserir usuário admin (senha: admin123)
INSERT INTO users (name, email, password, role, status)
VALUES ('Admin ERP Pro', 'admin@erppro.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3ZxQQxq6eq', 'admin', 'ativo')
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  updated_at = CURRENT_TIMESTAMP;

-- 9. Verificar se foi criado
SELECT 'Tabelas criadas:' as info;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

SELECT 'Usuário admin:' as info;
SELECT id, name, email, role, status FROM users WHERE email = 'admin@erppro.com';

SELECT 'Segmentos:' as info;
SELECT id, name, description FROM segments; 