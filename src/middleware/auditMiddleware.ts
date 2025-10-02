import { NextRequest, NextResponse } from 'next/server';

export function auditMiddleware(request: NextRequest) {
  // Capturar informações do usuário e requisição
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const ipAddress = request.ip || 
    request.headers.get('x-forwarded-for') || 
    request.headers.get('x-real-ip') || 
    'unknown';

  // Adicionar headers para captura nos logs
  const response = NextResponse.next();
  
  // Adicionar informações de auditoria aos headers
  response.headers.set('x-audit-ip', ipAddress);
  response.headers.set('x-audit-user-agent', userAgent);
  
  return response;
}

// Função para logar ações manuais
export async function logManualAction(
  action: string,
  tableName: string,
  recordId?: string,
  oldValues?: any,
  newValues?: any
) {
  try {
    const response = await fetch('/api/audit-logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        table_name: tableName,
        record_id: recordId,
        old_values: oldValues,
        new_values: newValues
      })
    });

    if (!response.ok) {
      console.error('❌ Erro ao logar ação manual:', await response.text());
    }
  } catch (error) {
    console.error('❌ Erro ao logar ação manual:', error);
  }
}
