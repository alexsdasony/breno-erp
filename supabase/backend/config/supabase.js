import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente do arquivo .env.local na raiz do projeto
dotenv.config({ path: path.join(__dirname, '../../../.env.local') });

// Verificar se as variáveis necessárias estão definidas
import { SUPABASE_CONFIG } from './constants.js'

const supabaseUrl = SUPABASE_CONFIG.URL;
const supabaseServiceKey = SUPABASE_CONFIG.SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas!');
  console.error('VITE_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  throw new Error('❌ Variáveis de ambiente do Supabase não encontradas!');
}

// Criar cliente Supabase com service role key para operações do backend
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Função para testar conexão com o banco
export async function testConnection() {
  try {
    console.log('🔗 Testando conexão com Supabase...');
    
    // Testar conexão fazendo uma query simples
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro na conexão com Supabase:', error.message);
      return false;
    }
    
    console.log('✅ Supabase database connected successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao testar conexão com Supabase:', error.message);
    return false;
  }
} 