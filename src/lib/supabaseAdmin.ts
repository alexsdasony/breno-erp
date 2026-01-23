/**
 * ⚠️ DEPRECATED: Este arquivo está desabilitado.
 * 
 * NÃO USE: import { supabaseAdmin } from '@/lib/supabaseAdmin'
 * 
 * USE: import { getSupabaseAdmin } from '@/lib/getSupabaseAdmin'
 *      const supabaseAdmin = getSupabaseAdmin(); // dentro da função da rota
 * 
 * O client Supabase Admin deve ser criado no runtime de cada rota,
 * não em escopo global, para evitar problemas com recycle de container no Render.
 * 
 * Veja lib/getSupabaseAdmin.ts para o helper correto.
 */

// Exportar função que lança erro para ajudar na migração
export function supabaseAdmin() {
  throw new Error(
    '❌ supabaseAdmin global está desabilitado. ' +
    'Use getSupabaseAdmin() dentro do runtime da rota. ' +
    'Veja: lib/getSupabaseAdmin.ts'
  );
}
