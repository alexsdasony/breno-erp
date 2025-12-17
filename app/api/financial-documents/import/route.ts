import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { parseCSVStatement, parseXMLStatement } from '@/lib/bankStatementParsers';
import type { BankStatementTransaction } from '@/lib/bankStatementParsers';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação (se necessário)
    // TODO: Adicionar verificação de autenticação se necessário

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const segmentId = formData.get('segmentId') as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Arquivo não fornecido' },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo - suporta CSV, XML/OFX, QIF
    const fileName = file.name.toLowerCase();
    const isCSV = fileName.endsWith('.csv') || file.type === 'text/csv' || file.type === 'application/vnd.ms-excel';
    const isXML = fileName.endsWith('.xml') || fileName.endsWith('.ofx') || 
                  file.type === 'text/xml' || file.type === 'application/xml' || 
                  file.type === 'application/ofx' || file.type === 'application/x-ofx';
    const isQIF = fileName.endsWith('.qif') || file.type === 'application/qif';

    if (!isCSV && !isXML && !isQIF) {
      return NextResponse.json(
        { success: false, error: 'Formato de arquivo não suportado. Use CSV, XML/OFX ou QIF.' },
        { status: 400 }
      );
    }

    // Ler conteúdo do arquivo
    const fileContent = await file.text();

    // Parse do arquivo
    let transactions: BankStatementTransaction[];
    
    try {
      if (isCSV) {
        transactions = parseCSVStatement(fileContent);
      } else if (isQIF) {
        // QIF é processado como XML (texto estruturado)
        transactions = await parseXMLStatement(fileContent);
      } else {
        // XML/OFX
        transactions = await parseXMLStatement(fileContent);
      }
    } catch (parseError) {
      console.error('❌ Erro ao processar arquivo:', parseError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao processar arquivo',
          details: parseError instanceof Error ? parseError.message : 'Erro desconhecido'
        },
        { status: 400 }
      );
    }

    if (transactions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nenhuma transação válida encontrada no arquivo' },
        { status: 400 }
      );
    }

    console.log(`📊 Processando ${transactions.length} transações do extrato bancário`);

    // 1. Verificar duplicatas DENTRO do arquivo (usando doc_no quando disponível)
    const seenInFile = new Set<string>();
    const uniqueTransactions: BankStatementTransaction[] = [];
    let duplicatesInFile = 0;

    for (const tx of transactions) {
      // Criar chave única: usar doc_no se disponível, senão usar data+valor+direção
      const uniqueKey = tx.doc_no 
        ? `doc_no:${tx.doc_no}`
        : `${tx.date}-${tx.amount}-${tx.direction}-${tx.description.substring(0, 30)}`;
      
      if (seenInFile.has(uniqueKey)) {
        duplicatesInFile++;
        continue;
      }
      
      seenInFile.add(uniqueKey);
      uniqueTransactions.push(tx);
    }

    if (duplicatesInFile > 0) {
      console.log(`⚠️ ${duplicatesInFile} transação(ões) duplicada(s) encontrada(s) dentro do arquivo, ignoradas`);
    }

    // 2. Verificar duplicatas no banco de dados
    const documentsToInsert = [];
    let duplicateCount = 0;
    let importedCount = 0;

    for (const tx of uniqueTransactions) {
      let existingDoc = null;

      // Verificar duplicata usando doc_no se disponível (mais preciso)
      if (tx.doc_no) {
        const { data } = await supabaseAdmin
          .from('financial_documents')
          .select('id')
          .eq('doc_no', tx.doc_no)
          .eq('is_deleted', false)
          .limit(1)
          .single();
        
        existingDoc = data;
      } else {
        // Fallback: verificar usando data + valor + direção + descrição
        const { data } = await supabaseAdmin
          .from('financial_documents')
          .select('id')
          .eq('issue_date', tx.date)
          .eq('amount', tx.amount)
          .eq('direction', tx.direction)
          .ilike('description', `%${tx.description.substring(0, 50)}%`)
          .eq('is_deleted', false)
          .limit(1)
          .single();
        
        existingDoc = data;
      }

      if (existingDoc) {
        duplicateCount++;
        continue;
      }

      // Criar documento financeiro
      // Se não tem doc_no, gerar um único baseado em timestamp + índice
      const docNo: string = tx.doc_no || `IMPORT-${tx.date}-${tx.amount}-${Date.now()}-${documentsToInsert.length}`;
      
      const document = {
        partner_id: null,
        direction: tx.direction,
        doc_no: docNo,
        issue_date: tx.date,
        due_date: tx.date,
        amount: tx.amount,
        balance: tx.balance || tx.amount,
        status: 'open' as const,
        category_id: null,
        segment_id: segmentId || null,
        description: tx.description,
        payment_method: 'Transferência Bancária',
        notes: `Importado de extrato bancário - ${file.name}`,
        payment_method_id: null,
        is_deleted: false,
      };

      documentsToInsert.push(document);
    }

    // Inserir documentos em lote
    if (documentsToInsert.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from('financial_documents')
        .insert(documentsToInsert);

      if (insertError) {
        console.error('❌ Erro ao inserir documentos:', insertError);
        return NextResponse.json(
          { 
            success: false, 
            error: 'Erro ao salvar documentos no banco de dados',
            details: insertError.message
          },
          { status: 500 }
        );
      }

      importedCount = documentsToInsert.length;
    }

    console.log(`✅ Importação concluída: ${importedCount} novos documentos, ${duplicateCount} duplicados no banco, ${duplicatesInFile} duplicados no arquivo`);

    return NextResponse.json({
      success: true,
      imported: importedCount,
      duplicatesInFile,
      duplicatesInDatabase: duplicateCount,
      total: transactions.length,
      message: `${importedCount} registro(s) importado(s) com sucesso${duplicateCount > 0 || duplicatesInFile > 0 ? `. ${duplicateCount} duplicado(s) no banco, ${duplicatesInFile} no arquivo ignorado(s)` : ''}`,
    });

  } catch (error) {
    console.error('❌ Erro ao importar extrato bancário:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno ao processar importação',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
