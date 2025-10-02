#!/usr/bin/env node

/**
 * Script de Backup Automático do Sistema
 * Exporta dados do Supabase e faz upload para Google Drive
 */

import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;
const GOOGLE_SERVICE_ACCOUNT = process.env.GOOGLE_SERVICE_ACCOUNT;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

if (!GOOGLE_DRIVE_FOLDER_ID || !GOOGLE_SERVICE_ACCOUNT) {
  console.error('❌ Variáveis de ambiente do Google Drive não configuradas');
  console.log('ℹ️  Backup será salvo localmente apenas');
}

// Inicializar Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Função para obter todas as tabelas
async function getAllTables() {
  const tables = [
    'partners',
    'partner_roles',
    'segments',
    'products',
    'sales',
    'sale_items',
    'financial_documents',
    'billings',
    'accounts_payable',
    'accounts_receivable',
    'payment_methods',
    'users',
    'transactions',
    'cost_centers',
    'integrations'
  ];
  
  return tables;
}

// Função para exportar dados de uma tabela
async function exportTable(tableName) {
  console.log(`📊 Exportando tabela: ${tableName}`);
  
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*');
    
    if (error) {
      console.error(`❌ Erro ao exportar ${tableName}:`, error);
      return null;
    }
    
    console.log(`✅ ${tableName}: ${data?.length || 0} registros exportados`);
    return data;
  } catch (error) {
    console.error(`❌ Erro ao exportar ${tableName}:`, error);
    return null;
  }
}

// Função para criar dump SQL
async function createSQLDump() {
  console.log('🗄️  Criando dump SQL...');
  
  const tables = await getAllTables();
  const dumpData = {};
  
  for (const table of tables) {
    const data = await exportTable(table);
    if (data !== null) {
      dumpData[table] = data;
    }
  }
  
  // Criar timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const filename = `backup-${timestamp}.json`;
  const filepath = path.join(__dirname, '..', 'backups', filename);
  
  // Criar diretório se não existir
  const backupDir = path.dirname(filepath);
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  // Salvar arquivo
  fs.writeFileSync(filepath, JSON.stringify(dumpData, null, 2));
  
  console.log(`✅ Dump criado: ${filepath}`);
  return { filepath, filename };
}

// Função para autenticar Google Drive
async function authenticateGoogleDrive() {
  if (!GOOGLE_SERVICE_ACCOUNT) {
    return null;
  }
  
  try {
    const credentials = JSON.parse(GOOGLE_SERVICE_ACCOUNT);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file']
    });
    
    const drive = google.drive({ version: 'v3', auth });
    return drive;
  } catch (error) {
    console.error('❌ Erro ao autenticar Google Drive:', error);
    return null;
  }
}

// Função para fazer upload para Google Drive
async function uploadToGoogleDrive(filepath, filename) {
  const drive = await authenticateGoogleDrive();
  if (!drive) {
    console.log('ℹ️  Google Drive não configurado, pulando upload');
    return;
  }
  
  try {
    console.log('☁️  Fazendo upload para Google Drive...');
    
    const fileMetadata = {
      name: filename,
      parents: [GOOGLE_DRIVE_FOLDER_ID]
    };
    
    const media = {
      mimeType: 'application/json',
      body: fs.createReadStream(filepath)
    };
    
    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id,name'
    });
    
    console.log(`✅ Upload concluído: ${response.data.name} (ID: ${response.data.id})`);
  } catch (error) {
    console.error('❌ Erro no upload para Google Drive:', error);
  }
}

// Função para limpar backups antigos (manter últimos 7 dias)
async function cleanupOldBackups() {
  const backupDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(backupDir)) return;
  
  const files = fs.readdirSync(backupDir);
  const backupFiles = files
    .filter(file => file.startsWith('backup-') && file.endsWith('.json'))
    .map(file => ({
      name: file,
      path: path.join(backupDir, file),
      stats: fs.statSync(path.join(backupDir, file))
    }))
    .sort((a, b) => b.stats.mtime - a.stats.mtime);
  
  // Manter apenas os últimos 7 backups
  const filesToDelete = backupFiles.slice(7);
  
  for (const file of filesToDelete) {
    try {
      fs.unlinkSync(file.path);
      console.log(`🗑️  Backup antigo removido: ${file.name}`);
    } catch (error) {
      console.error(`❌ Erro ao remover ${file.name}:`, error);
    }
  }
}

// Função principal
async function main() {
  console.log('🚀 Iniciando backup automático...');
  console.log(`📅 Data: ${new Date().toLocaleString('pt-BR')}`);
  
  try {
    // Criar dump SQL
    const { filepath, filename } = await createSQLDump();
    
    // Upload para Google Drive (se configurado)
    await uploadToGoogleDrive(filepath, filename);
    
    // Limpar backups antigos
    await cleanupOldBackups();
    
    console.log('✅ Backup concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante backup:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as runBackup };
