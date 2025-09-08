import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
let supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Limpeza da chave para remover quebras de linha e espaços extras
supabaseKey = supabaseKey.replace(/\n/g, '').replace(/\r/g, '').trim();

// Debug das variáveis de ambiente
console.log('🔍 SupabaseAdmin - Verificando variáveis:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Definida' : '❌ Não definida');
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✅ Definida e limpa' : '❌ Não definida');

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL não está definida!');
  throw new Error('NEXT_PUBLIC_SUPABASE_URL não está definida');
}

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não está definida!');
  throw new Error('SUPABASE_SERVICE_ROLE_KEY não está definida');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
