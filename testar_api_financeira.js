#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://qerubjitetqwfqqydhzv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDU5NDUsImV4cCI6MjA2OTU4MTk0NX0.eP6QxQI1oerd5HxPxYpHF8mhKLK6bwnuIyw_aKFjuwU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testarApiFinanceira() {
    console.log('🧪 Testando API financeira...');
    
    try {
        // 1. Testar busca de documentos financeiros
        console.log('\n1️⃣ Testando busca de documentos financeiros...');
        const { data: financialDocs, error: financialDocsError } = await supabase
            .from('financial_documents')
            .select(`
                *,
                partner:partners(name, id),
                payment_method_data:payment_methods(name, id)
            `)
            .order('created_at', { ascending: false });
        
        if (financialDocsError) {
            console.error('❌ Erro ao buscar documentos financeiros:', financialDocsError);
        } else {
            console.log(`📊 Encontrados ${financialDocs?.length || 0} documentos financeiros`);
            if (financialDocs && financialDocs.length > 0) {
                console.log('\n📋 Documentos financeiros:');
                financialDocs.forEach((doc, index) => {
                    console.log(`${index + 1}. ID: ${doc.id}`);
                    console.log(`   - Descrição: ${doc.description || 'N/A'}`);
                    console.log(`   - Valor: R$ ${doc.amount || 0}`);
                    console.log(`   - Status: ${doc.status || 'N/A'}`);
                    console.log(`   - Parceiro: ${doc.partner?.name || 'N/A'}`);
                    console.log(`   - Método de Pagamento: ${doc.payment_method_data?.name || 'N/A'}`);
                    console.log(`   - Data: ${doc.created_at}`);
                    console.log('');
                });
            }
        }
        
        // 2. Testar criação de um documento financeiro
        console.log('\n2️⃣ Testando criação de documento financeiro...');
        
        const novoDocumento = {
            description: 'Teste de Documento Financeiro',
            amount: 1500.00,
            direction: 'receivable',
            status: 'pending',
            issue_date: new Date().toISOString().split('T')[0],
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            partner_id: null,
            payment_method_id: null,
            notes: 'Documento de teste criado automaticamente'
        };
        
        console.log('📝 Dados do documento teste:', novoDocumento);
        
        const { data: newDoc, error: createError } = await supabase
            .from('financial_documents')
            .insert([novoDocumento])
            .select(`
                *,
                partner:partners(name, id),
                payment_method_data:payment_methods(name, id)
            `)
            .single();
        
        if (createError) {
            console.error('❌ Erro ao criar documento:', createError);
        } else {
            console.log('✅ Documento criado com sucesso!');
            console.log(`   - ID: ${newDoc.id}`);
            console.log(`   - Descrição: ${newDoc.description}`);
            console.log(`   - Valor: R$ ${newDoc.amount}`);
            console.log(`   - Status: ${newDoc.status}`);
            
            // Limpar o documento teste
            console.log('\n🧹 Limpando documento teste...');
            const { error: deleteError } = await supabase
                .from('financial_documents')
                .delete()
                .eq('id', newDoc.id);
            
            if (deleteError) {
                console.error('❌ Erro ao deletar documento teste:', deleteError);
            } else {
                console.log('✅ Documento teste removido com sucesso!');
            }
        }
        
        console.log('\n🎉 Teste da API financeira concluído!');
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

testarApiFinanceira().catch(console.error);
