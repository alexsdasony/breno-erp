import { getSupabaseAdmin } from './getSupabaseAdmin';

/**
 * Cria um log de auditoria no banco de dados.
 * 
 * ⚠️ IMPORTANTE: Esta função cria o client Supabase no runtime,
 * não usa client global, garantindo compatibilidade com Render.
 * 
 * @param action - Ação realizada (CREATE, UPDATE, DELETE, etc)
 * @param tableName - Nome da tabela afetada
 * @param recordId - ID do registro afetado
 * @param oldValues - Valores antigos (para UPDATE)
 * @param newValues - Valores novos
 * @param userId - ID do usuário que realizou a ação
 * @param userEmail - Email do usuário
 */
export async function createAuditLog(
  action: string,
  tableName: string,
  recordId: string | null,
  oldValues: any = null,
  newValues: any = null,
  userId: string | null = null,
  userEmail: string | null = null
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin
      .from('audit_logs')
      .insert({
        action,
        table_name: tableName,
        record_id: recordId,
        old_values: oldValues,
        new_values: newValues,
        user_id: userId,
        user_email: userEmail,
        ip_address: '127.0.0.1',
        user_agent: 'Sistema de Auditoria'
      });
    
    if (error) {
      console.error('❌ Erro ao criar log de auditoria:', error);
    } else {
      console.log('✅ Log de auditoria criado:', { action, tableName, recordId });
    }
  } catch (error) {
    console.error('❌ Erro ao criar log de auditoria:', error);
  }
}
