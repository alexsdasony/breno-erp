import pkg from 'pg';
const { Pool } = pkg;

let pool = null;

export async function getDatabase() {
  // SEMPRE PostgreSQL (local E produção)
  const connectionString = process.env.DATABASE_URL || 'postgresql://breno_erp_user:aHQO5rzBcecx5bRm2Xt53UQPxS49OXLj@dpg-d1fs2rali9vc739tpac0-a.oregon-postgres.render.com/breno_erp';
  
  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      }
    });
  }
  
  // Interface compatível com sintaxe SQLite
  return {
    async get(sql, params = []) {
      // Converter ? para $1, $2, etc
      let paramCount = 0;
      const pgSql = sql.replace(/\?/g, () => `$${++paramCount}`);
      const result = await pool.query(pgSql, params);
      return result.rows[0] || null;
    },
    
    async all(sql, params = []) {
      let paramCount = 0;
      const pgSql = sql.replace(/\?/g, () => `$${++paramCount}`);
      const result = await pool.query(pgSql, params);
      return result.rows;
    },
    
    async run(sql, params = []) {
      let paramCount = 0;
      const pgSql = sql.replace(/\?/g, () => `$${++paramCount}`);
      
      // Para INSERT, adicionar RETURNING id
      if (sql.toUpperCase().includes('INSERT')) {
        const returningSQL = pgSql + ' RETURNING id';
        const result = await pool.query(returningSQL, params);
        return {
          lastID: result.rows[0]?.id,
          changes: result.rowCount
        };
      } else {
        const result = await pool.query(pgSql, params);
        return {
          changes: result.rowCount
        };
      }
    },
    
    async query(sql, params = []) {
      return pool.query(sql, params);
    }
  };
}

export async function initProductionDatabase() {
  const db = await getDatabase();
  
  // Criar tabelas PostgreSQL
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
      enabled BOOLEAN DEFAULT false,
      config JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ PostgreSQL database initialized');
} 