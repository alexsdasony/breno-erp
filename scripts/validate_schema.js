#!/usr/bin/env node

/*
  validate_schema.js
  - Carrega variáveis de ambiente de .env.local e/ou env.example
  - Conecta ao Postgres remoto (Supabase) via DATABASE_URL (ou SUPABASE_DB_URL)
  - Lê supabase/schemas/current-schema.sql e extrai tabelas/colunas/constrains básicos
  - Consulta information_schema/pg_catalog para obter schema real
  - Compara e gera relatório em supabase/schemas/remote-vs-current-report.txt
*/

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const dotenv = require('dotenv');

function loadEnv() {
  const root = process.cwd();
  const envLocal = path.join(root, '.env.local');
  const envExample = path.join(root, 'env.example');

  if (fs.existsSync(envLocal)) {
    dotenv.config({ path: envLocal, override: false });
  }
  if (fs.existsSync(envExample)) {
    dotenv.config({ path: envExample, override: false });
  }
}

function getDbUrl() {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.SUPABASE_DB_URL,
    process.env.DB_URL,
  ];
  const dbUrl = candidates.find(Boolean);
  if (!dbUrl) {
    throw new Error('Não encontrei DATABASE_URL/SUPABASE_DB_URL/DB_URL no ambiente (.env.local/env.example).');
  }
  return dbUrl;
}

function parseCurrentSchema(sqlText) {
  // Extrai blocos CREATE TABLE public.xxxx ( ... );
  const createTableRegex = /CREATE\s+TABLE\s+public\.(\w+)\s*\(([^;]*?)\);/gis;
  const tables = {};

  let match;
  while ((match = createTableRegex.exec(sqlText)) !== null) {
    const tableName = match[1];
    const body = match[2];

    const lines = body
      .split(/\n|,/)
      .map(l => l.trim())
      .filter(l => l.length > 0);

    const columns = [];
    const constraints = [];

    for (const line of lines) {
      if (/^CONSTRAINT\s+/i.test(line)) {
        constraints.push(line);
      } else if (/^[a-zA-Z_][a-zA-Z0-9_]*\s+/i.test(line)) {
        // Linha de coluna: nome tipo ... (parcial, heurístico)
        const parts = line.split(/\s+/);
        const colName = parts[0].replace(/"/g, '');
        const colType = parts[1] ? parts[1].toLowerCase() : '';
        columns.push({ name: colName, type: colType, raw: line });
      }
    }

    tables[tableName] = { name: tableName, columns, constraints };
  }

  return { tables };
}

async function fetchRemoteSchema(client) {
  // Tabelas no schema public
  const tablesRes = await client.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`
  );
  const tableNames = tablesRes.rows.map(r => r.table_name);

  const tables = {};

  for (const tableName of tableNames) {
    const colsRes = await client.query(
      `SELECT column_name, data_type, is_nullable, column_default
       FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = $1
       ORDER BY ordinal_position;`,
      [tableName]
    );

    // PK columns
    const pkRes = await client.query(
      `SELECT kcu.column_name
       FROM information_schema.table_constraints tc
       JOIN information_schema.key_column_usage kcu
         ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
       WHERE tc.table_schema = 'public'
         AND tc.table_name = $1
         AND tc.constraint_type = 'PRIMARY KEY'
       ORDER BY kcu.ordinal_position;`,
      [tableName]
    );

    // FKs (campo -> tabela referenciada)
    const fkRes = await client.query(
      `SELECT
         kcu.column_name AS column_name,
         ccu.table_name  AS foreign_table_name,
         ccu.column_name AS foreign_column_name
       FROM information_schema.table_constraints AS tc
       JOIN information_schema.key_column_usage AS kcu
         ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
       JOIN information_schema.constraint_column_usage AS ccu
         ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
       WHERE tc.constraint_type = 'FOREIGN KEY'
         AND tc.table_schema = 'public'
         AND tc.table_name = $1
       ORDER BY kcu.ordinal_position;`,
      [tableName]
    );

    tables[tableName] = {
      name: tableName,
      columns: colsRes.rows.map(r => ({
        name: r.column_name,
        type: r.data_type,
        nullable: r.is_nullable === 'YES',
        default: r.column_default || null,
      })),
      primaryKey: pkRes.rows.map(r => r.column_name),
      foreignKeys: fkRes.rows.map(r => ({
        column: r.column_name,
        refTable: r.foreign_table_name,
        refColumn: r.foreign_column_name,
      })),
    };
  }

  return { tables };
}

function normalizeType(t) {
  if (!t) return t;
  const x = t.toLowerCase();
  // Mapear variações comuns
  if (x.startsWith('character varying')) return 'character varying';
  if (x === 'timestamp without time zone') return 'timestamp';
  if (x === 'integer') return 'integer';
  if (x === 'numeric') return 'numeric';
  if (x === 'text') return 'text';
  if (x === 'uuid') return 'uuid';
  if (x === 'jsonb') return 'jsonb';
  if (x === 'boolean') return 'boolean';
  if (x === 'date') return 'date';
  return x;
}

function compareSchemas(expected, actual) {
  const report = [];
  const expectedTables = new Set(Object.keys(expected.tables));
  const actualTables = new Set(Object.keys(actual.tables));

  const missingInActual = [...expectedTables].filter(t => !actualTables.has(t));
  const extraInActual = [...actualTables].filter(t => !expectedTables.has(t));

  if (missingInActual.length) {
    report.push(`Tabelas faltando no banco: ${missingInActual.join(', ')}`);
  }
  if (extraInActual.length) {
    report.push(`Tabelas extras no banco (não listadas no current-schema): ${extraInActual.join(', ')}`);
  }

  const common = [...expectedTables].filter(t => actualTables.has(t));
  for (const table of common) {
    const expCols = expected.tables[table].columns.reduce((acc, c) => {
      acc[c.name.toLowerCase()] = c;
      return acc;
    }, {});
    const actCols = actual.tables[table].columns.reduce((acc, c) => {
      acc[c.name.toLowerCase()] = c;
      return acc;
    }, {});

    const expNames = new Set(Object.keys(expCols));
    const actNames = new Set(Object.keys(actCols));

    const missingCols = [...expNames].filter(c => !actNames.has(c));
    const extraCols = [...actNames].filter(c => !expNames.has(c));

    if (missingCols.length || extraCols.length) {
      report.push(`Tabela ${table}:`);
      if (missingCols.length) report.push(`  - Colunas faltando no banco: ${missingCols.join(', ')}`);
      if (extraCols.length) report.push(`  - Colunas extras no banco: ${extraCols.join(', ')}`);
    }

    // Diferenças de tipo para colunas em comum
    const commonCols = [...expNames].filter(c => actNames.has(c));
    for (const col of commonCols) {
      const expType = normalizeType(expCols[col].type);
      const actType = normalizeType(actCols[col].type);
      if (expType && actType && expType !== actType) {
        report.push(`  * ${table}.${col}: tipo diferente (expected: ${expType}, actual: ${actType})`);
      }
    }
  }

  return report;
}

async function main() {
  try {
    const root = process.cwd();
    loadEnv();
    const dbUrl = getDbUrl();

    const currentSchemaPath = process.argv.includes('--current')
      ? process.argv[process.argv.indexOf('--current') + 1]
      : path.join(root, 'supabase', 'schemas', 'current-schema.sql');

    const sqlText = fs.readFileSync(currentSchemaPath, 'utf8');
    const expected = parseCurrentSchema(sqlText);

    const client = new Client({ connectionString: dbUrl });
    await client.connect();

    const actual = await fetchRemoteSchema(client);
    await client.end();

    const report = compareSchemas(expected, actual);
    const outPath = path.join(root, 'supabase', 'schemas', 'remote-vs-current-report.txt');

    if (!report.length) {
      const ok = 'OK: Schema remoto coincide com current-schema (sem diferenças relevantes em tabelas/colunas/tipos básicos).';
      console.log(ok);
      fs.writeFileSync(outPath, ok + '\n');
      process.exit(0);
    } else {
      const header = 'Diferenças encontradas entre schema remoto e current-schema:';
      const content = [header, ...report].join('\n');
      console.log(content);
      fs.writeFileSync(outPath, content + '\n');
      process.exit(1);
    }
  } catch (err) {
    console.error('Erro ao validar schema:', err.message);
    process.exit(2);
  }
}

if (require.main === module) {
  main();
}
