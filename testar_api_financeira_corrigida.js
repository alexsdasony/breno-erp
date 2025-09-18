#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://qerubjitetqwfqqydhzv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDU5NDUsImV4cCI6MjA2OTU4MTk0NX0.eP6QxQI1oerd5HxPxYpHF8mhKLK6bwnuIyw_aKFjuwU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testarApiFinanceiraCorrigida() {
    console.log('🧪 Testando API financeira corrigida...');
    
    try {
        // 1. Verificar documentos existentes
        console.log('\n1️⃣ Verificando documentos existentes...');
        const { data: existingDocs, error: existingError } = await supabase
            .from('financial_documents')
            .select(`
                *,
                partner:partners(name, id),
                payment_method_data:payment_methods(name, id)
            `)
            .order('created_at', { ascending: false });
        
        if (existingError) {
            console.error('❌ Erro ao buscar documentos existentes:', existingError);
        } else {
            console.log(`📊 Encontrados ${existingDocs?.length || 0} documentos financeiros`);
            if (existingDocs && existingDocs.length > 0) {
                console.log('\n📋 Documentos existentes:');
                existingDocs.forEach((doc, index) => {
                    console.log(`${index + 1}. ID: ${doc.id}`);
                    console.log(`   - Descrição: ${doc.description || 'N/A'}`);
                    console.log(`   - Valor: R$ ${doc.amount || 0}`);
                    console.log(`   - Status: ${doc.status || 'N/A'}`);
                    console.log(`   - Direction: ${doc.direction || 'N/A'}`);
                    console.log(`   - Parceiro: ${doc.partner?.name || 'N/A'}`);
                    console.log(`   - Data: ${doc.created_at}`);
                    console.log('');
                });
            }
        }
        
        // 2. Testar criação de documentos com valores corretos
        console.log('\n2️⃣ Testando criação de documentos...');
        
        const documentosParaTestar = [
            {
                description: 'Receita de Venda',
                amount: 2500.00,
                direction: 'receivable',
                status: 'paid',
                issue_date: new Date().toISOString().split('T')[0],
                due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                notes: 'Venda de produto'
            },
            {
                description: 'Despesa de Aluguel',
                amount: 1200.00,
                direction: 'payable',
                status: 'paid',
                issue_date: new Date().toISOString().split('T')[0],
                due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                notes: 'Pagamento de aluguel'
            }
        ];
        
        const documentosCriados = [];
        
        for (const doc of documentosParaTestar) {
            console.log(`🔄 Criando documento: ${doc.description}`);
            
            const { data: newDoc, error: createError } = await supabase
                .from('financial_documents')
                .insert([doc])
                .select(`
                    *,
                    partner:partners(name, id),
                    payment_method_data:payment_methods(name, id)
                `)
                .single();
            
            if (createError) {
                console.error(`❌ Erro ao criar ${doc.description}:`, createError);
            } else {
                console.log(`✅ ${doc.description} criado com sucesso! ID: ${newDoc.id}`);
                documentosCriados.push(newDoc);
            }
        }
        
        // 3. Verificar documentos criados
        if (documentosCriados.length > 0) {
            console.log('\n3️⃣ Verificando documentos criados...');
            const { data: allDocs, error: allDocsError } = await supabase
                .from('financial_documents')
                .select(`
                    *,
                    partner:partners(name, id),
                    payment_method_data:payment_methods(name, id)
                `)
                .order('created_at', { ascending: false });
            
            if (allDocsError) {
                console.error('❌ Erro ao buscar todos os documentos:', allDocsError);
            } else {
                console.log(`📊 Total de documentos: ${allDocs?.length || 0}`);
                console.log('\n📋 Todos os documentos:');
                allDocs?.forEach((doc, index) => {
                    console.log(`${index + 1}. ${doc.description} - R$ ${doc.amount} (${doc.direction})`);
                });
            }
        }
        
        // 4. Limpar documentos de teste
        console.log('\n4️⃣ Limpando documentos de teste...');
        for (const doc of documentosCriados) {
            const { error: deleteError } = await supabase
                .from('financial_documents')
                .delete()
                .eq('id', doc.id);
            
            if (deleteError) {
                console.error(`❌ Erro ao deletar ${doc.description}:`, deleteError);
            } else {
                console.log(`✅ ${doc.description} removido com sucesso!`);
            }
        }
        
        console.log('\n🎉 Teste da API financeira corrigida concluído!');
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

testarApiFinanceiraCorrigida().catch(console.error);
