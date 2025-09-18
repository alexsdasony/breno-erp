#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://qerubjitetqwfqqydhzv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDU5NDUsImV4cCI6MjA2OTU4MTk0NX0.eP6QxQI1oerd5HxPxYpHF8mhKLK6bwnuIyw_aKFjuwU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function criarDocumentosFinanceirosExemplo() {
    console.log('💰 Criando documentos financeiros de exemplo...');
    
    try {
        // Documentos financeiros de exemplo
        const documentosExemplo = [
            // Receitas
            {
                description: 'Venda de Produto A',
                amount: 1500.00,
                direction: 'receivable',
                status: 'paid',
                issue_date: '2025-09-15',
                due_date: '2025-09-20',
                notes: 'Venda realizada para cliente'
            },
            {
                description: 'Serviço de Consultoria',
                amount: 2500.00,
                direction: 'receivable',
                status: 'paid',
                issue_date: '2025-09-10',
                due_date: '2025-09-15',
                notes: 'Consultoria técnica realizada'
            },
            {
                description: 'Venda de Produto B',
                amount: 800.00,
                direction: 'receivable',
                status: 'paid',
                issue_date: '2025-09-05',
                due_date: '2025-09-10',
                notes: 'Venda de produto para revenda'
            },
            // Despesas
            {
                description: 'Aluguel do Escritório',
                amount: 2000.00,
                direction: 'payable',
                status: 'paid',
                issue_date: '2025-09-01',
                due_date: '2025-09-05',
                notes: 'Pagamento mensal do aluguel'
            },
            {
                description: 'Energia Elétrica',
                amount: 350.00,
                direction: 'payable',
                status: 'paid',
                issue_date: '2025-09-03',
                due_date: '2025-09-08',
                notes: 'Conta de energia do mês'
            },
            {
                description: 'Internet e Telefone',
                amount: 150.00,
                direction: 'payable',
                status: 'paid',
                issue_date: '2025-09-02',
                due_date: '2025-09-07',
                notes: 'Serviços de telecomunicação'
            },
            {
                description: 'Material de Escritório',
                amount: 300.00,
                direction: 'payable',
                status: 'paid',
                issue_date: '2025-08-28',
                due_date: '2025-09-02',
                notes: 'Compra de material para escritório'
            },
            {
                description: 'Marketing Digital',
                amount: 1200.00,
                direction: 'payable',
                status: 'paid',
                issue_date: '2025-08-25',
                due_date: '2025-08-30',
                notes: 'Campanha de marketing online'
            }
        ];
        
        console.log(`📊 Criando ${documentosExemplo.length} documentos financeiros...`);
        
        const documentosCriados = [];
        
        for (const doc of documentosExemplo) {
            console.log(`🔄 Criando: ${doc.description}`);
            
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
        
        // Verificar resultado final
        console.log('\n📊 Verificando resultado final...');
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
            console.log(`📊 Total de documentos financeiros: ${allDocs?.length || 0}`);
            
            // Calcular totais
            const receitas = allDocs?.filter(doc => doc.direction === 'receivable').reduce((sum, doc) => sum + (doc.amount || 0), 0) || 0;
            const despesas = allDocs?.filter(doc => doc.direction === 'payable').reduce((sum, doc) => sum + (doc.amount || 0), 0) || 0;
            const saldo = receitas - despesas;
            
            console.log('\n📋 Resumo Financeiro:');
            console.log(`   - Receitas: R$ ${receitas.toFixed(2)}`);
            console.log(`   - Despesas: R$ ${despesas.toFixed(2)}`);
            console.log(`   - Saldo: R$ ${saldo.toFixed(2)}`);
            
            console.log('\n📋 Documentos por tipo:');
            const receitasDocs = allDocs?.filter(doc => doc.direction === 'receivable') || [];
            const despesasDocs = allDocs?.filter(doc => doc.direction === 'payable') || [];
            
            console.log(`   - Receitas: ${receitasDocs.length} documentos`);
            receitasDocs.forEach(doc => {
                console.log(`     • ${doc.description}: R$ ${doc.amount}`);
            });
            
            console.log(`   - Despesas: ${despesasDocs.length} documentos`);
            despesasDocs.forEach(doc => {
                console.log(`     • ${doc.description}: R$ ${doc.amount}`);
            });
        }
        
        console.log('\n🎉 Documentos financeiros de exemplo criados com sucesso!');
        console.log('💡 Agora você pode testar o menu financeiro no sistema!');
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

criarDocumentosFinanceirosExemplo().catch(console.error);
