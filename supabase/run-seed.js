#!/usr/bin/env node

import { runSeed } from './seed-data.js';

console.log('🌱 Iniciando seed do banco de dados Breno ERP...');
console.log('📊 Conectando ao Supabase...');

try {
  await runSeed();
  console.log('✅ Seed concluído com sucesso!');
  process.exit(0);
} catch (error) {
  console.error('❌ Erro durante o seed:', error);
  process.exit(1);
} 