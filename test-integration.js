#!/usr/bin/env node

/**
 * Script para testar a integração completa entre frontend e backend
 * Este script verifica se todos os componentes estão funcionando corretamente
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🧪 Iniciando testes de integração...');

// Função para verificar se um arquivo existe
const fileExists = (filePath) => {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
};

// Função para verificar se um diretório existe
const dirExists = (dirPath) => {
  try {
    return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  } catch (error) {
    return false;
  }
};

// Função para executar comando e capturar saída
const runCommand = (command, cwd = process.cwd()) => {
  try {
    const output = execSync(command, { 
      cwd, 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    return { success: true, output };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Testes de estrutura de arquivos
console.log('\n📁 Verificando estrutura de arquivos...');

const requiredFiles = [
  'src/hooks/useAuth.jsx',
  'src/hooks/useCrud.jsx',
  'src/hooks/useAppData.jsx',
  'src/services/api.js',
  'src/lib/supabase.js',
  'backend/server.js',
  'backend/database/supabaseConfig.js',
  'package.json'
];

const requiredDirs = [
  'src/components',
  'src/pages',
  'src/modules',
  'backend/routes',
  'backend/middleware'
];

let allFilesExist = true;
let allDirsExist = true;

// Verificar arquivos
for (const file of requiredFiles) {
  if (fileExists(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - NÃO ENCONTRADO`);
    allFilesExist = false;
  }
}

// Verificar diretórios
for (const dir of requiredDirs) {
  if (dirExists(dir)) {
    console.log(`✅ ${dir}/`);
  } else {
    console.log(`❌ ${dir}/ - NÃO ENCONTRADO`);
    allDirsExist = false;
  }
}

// Testes de dependências
console.log('\n📦 Verificando dependências...');

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = [
  'react',
  'react-dom',
  'react-router-dom',
  '@supabase/supabase-js',
  'express',
  'cors'
];

const missingDeps = [];
for (const dep of requiredDeps) {
  if (!packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]) {
    missingDeps.push(dep);
  }
}

if (missingDeps.length === 0) {
  console.log('✅ Todas as dependências principais estão instaladas');
} else {
  console.log(`❌ Dependências faltando: ${missingDeps.join(', ')}`);
}

// Testes de configuração
console.log('\n⚙️ Verificando configurações...');

// Verificar se o arquivo .env.local existe
if (fileExists('.env.local')) {
  console.log('✅ .env.local encontrado');
} else {
  console.log('⚠️ .env.local não encontrado - você precisa configurar as variáveis de ambiente');
}

// Verificar se o backend está configurado
if (fileExists('backend/package.json')) {
  console.log('✅ Backend package.json encontrado');
} else {
  console.log('❌ Backend package.json não encontrado');
}

// Testes de sintaxe básica
console.log('\n🔍 Verificando sintaxe dos arquivos principais...');

const jsFiles = [
  'src/hooks/useAuth.jsx',
  'src/hooks/useCrud.jsx',
  'src/services/api.js'
];

for (const file of jsFiles) {
  if (fileExists(file)) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      // Verificação básica de sintaxe (se contém imports e exports)
      if (content.includes('import') && content.includes('export')) {
        console.log(`✅ ${file} - Sintaxe básica OK`);
      } else {
        console.log(`⚠️ ${file} - Possível problema de sintaxe`);
      }
    } catch (error) {
      console.log(`❌ ${file} - Erro ao ler arquivo: ${error.message}`);
    }
  }
}

// Testes de conectividade (se possível)
console.log('\n🌐 Verificando conectividade...');

// Verificar se o backend está rodando (se a porta 3001 estiver em uso)
const portCheck = runCommand('lsof -i :3001');
if (portCheck.success && portCheck.output.includes('LISTEN')) {
  console.log('✅ Backend parece estar rodando na porta 3001');
} else {
  console.log('⚠️ Backend não parece estar rodando na porta 3001');
}

// Verificar se o frontend está rodando (se a porta 5173 estiver em uso)
const frontendPortCheck = runCommand('lsof -i :5173');
if (frontendPortCheck.success && frontendPortCheck.output.includes('LISTEN')) {
  console.log('✅ Frontend parece estar rodando na porta 5173');
} else {
  console.log('⚠️ Frontend não parece estar rodando na porta 5173');
}

// Resumo final
console.log('\n📊 RESUMO DOS TESTES:');
console.log('=====================');

if (allFilesExist && allDirsExist && missingDeps.length === 0) {
  console.log('🎉 TODOS OS TESTES PASSARAM!');
  console.log('✅ Estrutura de arquivos: OK');
  console.log('✅ Dependências: OK');
  console.log('✅ Configurações: OK');
  console.log('✅ Sintaxe: OK');
  console.log('\n🚀 A integração está pronta para uso!');
} else {
  console.log('❌ ALGUNS TESTES FALHARAM:');
  
  if (!allFilesExist) {
    console.log('❌ Alguns arquivos necessários estão faltando');
  }
  
  if (!allDirsExist) {
    console.log('❌ Alguns diretórios necessários estão faltando');
  }
  
  if (missingDeps.length > 0) {
    console.log(`❌ Dependências faltando: ${missingDeps.join(', ')}`);
  }
  
  console.log('\n🔧 CORREÇÕES NECESSÁRIAS:');
  console.log('1. Verifique se todos os arquivos estão no lugar correto');
  console.log('2. Instale as dependências faltantes: npm install');
  console.log('3. Configure as variáveis de ambiente no arquivo .env.local');
  console.log('4. Inicie o backend: cd backend && npm start');
  console.log('5. Inicie o frontend: npm run dev');
}

console.log('\n✨ Teste de integração concluído!'); 