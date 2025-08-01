// Script para rodar um comando SQL arbitrário no banco
import { runArbitrarySQL } from '../database/prodConfig.js';

async function main() {
  try {
    const sql = 'ALTER TABLE customers ADD COLUMN endereco_comprovado TEXT NULL;';
    await runArbitrarySQL(sql);
    console.log('Coluna endereco_comprovado adicionada com sucesso!');
    process.exit(0);
  } catch (err) {
    console.error('Erro ao adicionar coluna:', err.message);
    process.exit(1);
  }
}

main(); 