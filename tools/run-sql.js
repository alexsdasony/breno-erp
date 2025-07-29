#!/usr/bin/env node
import { runArbitrarySQL } from '../backend/database/prodConfig.js';

const sql = process.argv.slice(2).join(' ');
if (!sql) {
  console.error('Uso: node tools/run-sql.js "SQL_COMMAND"');
  process.exit(1);
}

(async () => {
  try {
    const result = await runArbitrarySQL(sql);
    console.log(JSON.stringify(result.rows, null, 2));
  } catch (err) {
    console.error('Erro ao executar SQL:', err.message);
    process.exit(1);
  }
})(); 