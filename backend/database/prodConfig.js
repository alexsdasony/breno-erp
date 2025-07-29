import pkg from 'pg';
const { Pool } = pkg;
import sqlite3 from 'sqlite3';

let pool = null;
let sqliteDb = null;

export async function getDatabase() {
  // TEMPORARIAMENTE usando SQLite local devido a problemas com PostgreSQL remoto
  if (!sqliteDb) {
    sqliteDb = new sqlite3.Database('./database.sqlite');
  }
  
  // Interface compatível com sintaxe SQLite
  return {
    async get(sql, params = []) {
      return new Promise((resolve, reject) => {
        sqliteDb.get(sql, params, (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    },
    
    async all(sql, params = []) {
      return new Promise((resolve, reject) => {
        sqliteDb.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    },
    
    async run(sql, params = []) {
      return new Promise((resolve, reject) => {
        sqliteDb.run(sql, params, function(err) {
          if (err) reject(err);
          else {
            resolve({
              lastID: this.lastID,
              changes: this.changes
            });
          }
        });
      });
    },
    
    async query(sql, params = []) {
      return new Promise((resolve, reject) => {
        sqliteDb.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve({ rows });
        });
      });
    }
  };
}

export async function initProductionDatabase() {
  const db = await getDatabase();
  
  // Criar tabelas SQLite
  await db.run(`
    CREATE TABLE IF NOT EXISTS segments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
      segment_id INTEGER,
      status TEXT DEFAULT 'ativo' CHECK(status IN ('ativo', 'inativo', 'bloqueado')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (segment_id) REFERENCES segments(id)
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS cost_centers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      segment_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (segment_id) REFERENCES segments(id)
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      cpf TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      total_purchases DECIMAL(10,2) DEFAULT 0,
      last_purchase_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.run(`
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

  await db.run(`
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

  await db.run(`
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

  await db.run(`
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

  await db.run(`
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

  await db.run(`
    CREATE TABLE IF NOT EXISTS nfe (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      number TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      date DATE NOT NULL,
      total DECIMAL(10,2) NOT NULL,
      status TEXT DEFAULT 'Emitida' CHECK(status IN ('Emitida', 'Cancelada')),
      segment_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (segment_id) REFERENCES segments(id)
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS integrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      api_key TEXT,
      enabled BOOLEAN DEFAULT 0,
      config TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ SQLite database initialized');
} 

// Função utilitária para executar SQL arbitrário
export async function runArbitrarySQL(sql) {
  const db = await getDatabase();
  return db.query(sql);
} 