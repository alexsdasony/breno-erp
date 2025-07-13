import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupLocalDatabase() {
  console.log('🔧 Configurando banco de dados local...');
  
  const dbPath = path.join(__dirname, 'breno_erp.db');
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  try {
    // Criar tabela de segmentos
    await db.exec(`
      CREATE TABLE IF NOT EXISTS segments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela de usuários
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
        segment_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (segment_id) REFERENCES segments(id)
      )
    `);

    // Criar tabela de clientes com todos os campos bancários
    await db.exec(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        document TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        
        -- Campos do cadastro
        profissao TEXT,
        pais TEXT,
        estado TEXT,
        cidade TEXT,
        grau_instrucao TEXT,
        estado_civil TEXT,
        data_nascimento DATE,
        sexo TEXT,
        
        -- Campos de documento
        tipo_documento TEXT,
        data_emissao DATE,
        numero_documento TEXT,
        data_validade DATE,
        orgao_emissor TEXT,
        documento_image TEXT,
        
        -- Campos de renda
        cnpj_origem_renda TEXT,
        data_admissao DATE,
        cargo TEXT,
        renda_bruta DECIMAL(15,2),
        salario_liquido DECIMAL(15,2),
        valor_imposto_renda DECIMAL(15,2),
        data_comprovacao DATE,
        documento_renda_image TEXT,
        
        -- Campos de endereço
        cep TEXT,
        rua TEXT,
        bairro TEXT,
        numero_casa TEXT,
        tipo_imovel TEXT,
        data_atualizacao_endereco DATE,
        endereco_declarado BOOLEAN DEFAULT 0,
        endereco_comprovado BOOLEAN DEFAULT 0,
        
        -- Campos de contato
        telefone_fixo TEXT,
        celular TEXT,
        
        -- Campos de patrimônio
        valor_patrimonio DECIMAL(15,2),
        nao_possui_patrimonio BOOLEAN DEFAULT 0,
        
        -- Status do cadastro
        status_cadastro TEXT DEFAULT 'Pendente',
        responsavel_cadastro TEXT,
        
        total_purchases DECIMAL(10,2) DEFAULT 0,
        last_purchase_date DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela de produtos
    await db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        stock INTEGER DEFAULT 0,
        min_stock INTEGER DEFAULT 0,
        price DECIMAL(10,2) NOT NULL,
        category TEXT,
        segment_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (segment_id) REFERENCES segments(id)
      )
    `);

    // Criar tabela de transações
    await db.exec(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL CHECK(type IN ('receita', 'despesa')),
        description TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        date DATE NOT NULL,
        category TEXT,
        cost_center TEXT,
        segment_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (segment_id) REFERENCES segments(id)
      )
    `);

    // Criar tabela de vendas
    await db.exec(`
      CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        customer_name TEXT NOT NULL,
        product TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        date DATE NOT NULL,
        status TEXT DEFAULT 'Pendente' CHECK(status IN ('Pendente', 'Concluída', 'Cancelada')),
        segment_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (segment_id) REFERENCES segments(id)
      )
    `);

    // Criar tabela de cobranças
    await db.exec(`
      CREATE TABLE IF NOT EXISTS billings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        customer_name TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        due_date DATE NOT NULL,
        status TEXT DEFAULT 'Pendente' CHECK(status IN ('Pendente', 'Paga', 'Vencida', 'Cancelada')),
        payment_date DATE,
        segment_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (segment_id) REFERENCES segments(id)
      )
    `);

    // Criar tabela de contas a pagar
    await db.exec(`
      CREATE TABLE IF NOT EXISTS accounts_payable (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        supplier TEXT NOT NULL,
        description TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        due_date DATE NOT NULL,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'paid', 'overdue')),
        segment_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (segment_id) REFERENCES segments(id)
      )
    `);

    // Criar tabela de NFe
    await db.exec(`
      CREATE TABLE IF NOT EXISTS nfe (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        number TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        issue_date DATE NOT NULL,
        status TEXT DEFAULT 'Pendente' CHECK(status IN ('Pendente', 'Emitida', 'Cancelada')),
        segment_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (segment_id) REFERENCES segments(id)
      )
    `);

    // Criar tabela de centros de custo
    await db.exec(`
      CREATE TABLE IF NOT EXISTS cost_centers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        segment_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (segment_id) REFERENCES segments(id)
      )
    `);

    // Inserir dados iniciais
    await db.exec(`
      INSERT OR IGNORE INTO segments (id, name, description) VALUES 
      (1, 'Advocaçia', 'Segmento de advocacia'),
      (2, 'Contabilidade', 'Segmento de contabilidade'),
      (3, 'Consultoria', 'Segmento de consultoria')
    `);

    await db.exec(`
      INSERT OR IGNORE INTO users (id, name, email, password, role) VALUES 
      (1, 'Admin ERP Pro', 'admin@erp.com', '$2b$10$rQZ8K9vX8K9vX8K9vX8K9O', 'admin')
    `);

    await db.exec(`
      INSERT OR IGNORE INTO cost_centers (id, name, segment_id) VALUES 
      (1, 'Marketing', 1),
      (2, 'Vendas', 1),
      (3, 'Administrativo', 1)
    `);

    console.log('✅ Banco de dados local configurado com sucesso!');
    console.log('📁 Arquivo do banco:', dbPath);

  } catch (error) {
    console.error('❌ Erro ao configurar banco:', error);
  } finally {
    await db.close();
  }
}

setupLocalDatabase(); 