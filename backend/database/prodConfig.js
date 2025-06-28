import pkg from 'pg';
const { Pool } = pkg;

let pool = null;

export async function getDatabase() {
  if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
    // PostgreSQL para produção (Render)
    if (!pool) {
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false
        }
      });
    }
    return pool;
  } else {
    // SQLite para desenvolvimento (importa a configuração original)
    const { getDatabase: getSQLiteDB } = await import('./init.js');
    return getSQLiteDB();
  }
}

export async function initProductionDatabase() {
  if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
    const db = await getDatabase();
    
    // Criar tabelas PostgreSQL
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
        segment_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (segment_id) REFERENCES segments(id)
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS segments (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS cost_centers (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        segment_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (segment_id) REFERENCES segments(id)
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        cpf TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        total_purchases DECIMAL(10,2) DEFAULT 0,
        last_purchase_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        stock INTEGER DEFAULT 0,
        min_stock INTEGER DEFAULT 0,
        price DECIMAL(10,2) NOT NULL,
        category TEXT,
        segment_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (segment_id) REFERENCES segments(id)
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        type TEXT NOT NULL CHECK(type IN ('receita', 'despesa')),
        description TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        date DATE NOT NULL,
        category TEXT,
        cost_center TEXT,
        segment_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (segment_id) REFERENCES segments(id)
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS sales (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL,
        customer_name TEXT NOT NULL,
        product TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        date DATE NOT NULL,
        status TEXT DEFAULT 'Pendente' CHECK(status IN ('Pendente', 'Concluída', 'Cancelada')),
        segment_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (segment_id) REFERENCES segments(id)
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS billings (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL,
        customer_name TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        due_date DATE NOT NULL,
        status TEXT DEFAULT 'Pendente' CHECK(status IN ('Pendente', 'Paga', 'Vencida', 'Cancelada')),
        payment_date DATE,
        segment_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (segment_id) REFERENCES segments(id)
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS accounts_payable (
        id SERIAL PRIMARY KEY,
        supplier TEXT NOT NULL,
        description TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        due_date DATE NOT NULL,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'paid', 'overdue')),
        segment_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (segment_id) REFERENCES segments(id)
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS nfe (
        id SERIAL PRIMARY KEY,
        number TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        date DATE NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        status TEXT DEFAULT 'Emitida' CHECK(status IN ('Emitida', 'Cancelada')),
        segment_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (segment_id) REFERENCES segments(id)
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS integrations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        api_key TEXT,
        enabled BOOLEAN DEFAULT 0,
        config JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ PostgreSQL database initialized for production');
  }
} 