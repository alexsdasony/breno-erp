/**
 * Função de reconciliação Pluggy - NUNCA chamada na rota GET
 * Esta função deve ser chamada APENAS em /api/pluggy/sync
 */

import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * Reconcilia transações Pluggy com documentos financeiros
 * Busca ou cria documentos em financial_documents para cada transação Pluggy
 * 
 * @param pluggyTransactions - Array de transações da Pluggy
 * @returns Array de documentos financeiros (criados ou encontrados)
 */
export async function reconcilePluggyTransactionsToDocuments(
  pluggyTransactions: Array<{
    id: string;
    pluggy_id?: string;
    external_id?: string;
    direction?: string;
    type?: string;
    date: string;
    amount: number;
    description?: string;
    segment_id?: string;
    institution?: string;
    category?: string;
  }>
): Promise<Array<{
  id: string;
  [key: string]: any;
}>> {
  const reconciledDocs = await Promise.all(
    pluggyTransactions.map(async (tx) => {
      const pluggyId = tx.pluggy_id || tx.external_id || tx.id;
      
      if (!pluggyId) {
        console.warn('⚠️ Transação sem pluggy_id, ignorando:', tx.id);
        return null;
      }
      
      // Buscar documento existente em financial_documents usando doc_no
      const { data: existingDoc, error: docError } = await supabaseAdmin
        .from('financial_documents')
        .select('*')
        .eq('doc_no', pluggyId)
        .eq('is_deleted', false)
        .single();
      
      if (!docError && existingDoc) {
        // Documento já existe, retornar ele
        return {
          id: existingDoc.id,
          ...existingDoc,
          _source: 'pluggy',
          pluggy_id: pluggyId
        };
      }
      
      // Criar novo documento em financial_documents para esta transação
      const newDoc = {
        partner_id: null,
        direction: tx.direction || (tx.type === 'receita' ? 'receivable' : 'payable'),
        doc_no: pluggyId,
        issue_date: tx.date,
        due_date: tx.date,
        amount: Math.abs(Number(tx.amount) || 0),
        balance: Math.abs(Number(tx.amount) || 0),
        status: 'open',
        category_id: null,
        segment_id: tx.segment_id,
        description: tx.description || 'Transação Pluggy',
        payment_method: 'PIX',
        notes: `Importado da Pluggy - ${tx.institution || 'Banco'} - ${tx.category || ''}`,
        payment_method_id: null
      };
      
      const { data: createdDoc, error: createError } = await supabaseAdmin
        .from('financial_documents')
        .insert(newDoc)
        .select()
        .single();
      
      if (createError || !createdDoc) {
        console.error(`❌ Erro ao criar documento para transação ${tx.id}:`, createError);
        return null;
      }
      
      return {
        id: createdDoc.id,
        ...createdDoc,
        _source: 'pluggy',
        pluggy_id: pluggyId
      };
    })
  );
  
  return reconciledDocs.filter((doc): doc is NonNullable<typeof doc> => doc !== null);
}

