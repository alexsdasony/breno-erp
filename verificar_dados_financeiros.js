#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://qerubjitetqwfqqydhzv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDU5NDUsImV4cCI6MjA2OTU4MTk0NX0.eP6QxQI1oerd5HxPxYpHF8mhKLK6bwnuIyw_aKFjuwU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarDadosFinanceiros() {
    console.log('🔍 Verificando dados na tabela financial_documents...');
    
    try {
        // 1. Contar total de registros
        const { count, error: countError } = await supabase
            .from('financial_documents')
            .select('*', { count: 'exact', head: true });
        
        if (countError) {
            console.error('❌ Erro ao contar registros:', countError);
            return;
        }
        
        console.log(`📊 Total de registros na tabela financial_documents: ${count}`);
        
        // 2. Buscar todos os registros
        const { data: financialDocs, error: fetchError } = await supabase
            .from('financial_documents')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (fetchError) {
            console.error('❌ Erro ao buscar registros:', fetchError);
            return;
        }
        
        console.log(`📊 Registros encontrados: ${financialDocs?.length || 0}`);
        
        if (financialDocs && financialDocs.length > 0) {
            console.log('\n📋 Lista de documentos financeiros:');
            financialDocs.forEach((doc, index) => {
                console.log(`${index + 1}. ID: ${doc.id}`);
                console.log(`   - Descrição: ${doc.description}`);
                console.log(`   - Valor: R$ ${doc.amount}`);
                console.log(`   - Direção: ${doc.direction}`);
                console.log(`   - Status: ${doc.status}`);
                console.log(`   - Data: ${doc.created_at}`);
                console.log('');
            });
            
            // 3. Verificar tipos de documentos
            const receivables = financialDocs.filter(doc => doc.direction === 'receivable');
            const payables = financialDocs.filter(doc => doc.direction === 'payable');
            
            console.log('📊 Resumo por tipo:');
            console.log(`   - Receitas (receivable): ${receivables.length}`);
            console.log(`   - Despesas (payable): ${payables.length}`);
            
            // 4. Calcular totais
            const totalReceivables = receivables.reduce((sum, doc) => sum + (doc.amount || 0), 0);
            const totalPayables = payables.reduce((sum, doc) => sum + (doc.amount || 0), 0);
            const saldo = totalReceivables - totalPayables;
            
            console.log('\n💰 Resumo financeiro:');
            console.log(`   - Total Receitas: R$ ${totalReceivables.toLocaleString('pt-BR')}`);
            console.log(`   - Total Despesas: R$ ${totalPayables.toLocaleString('pt-BR')}`);
            console.log(`   - Saldo: R$ ${saldo.toLocaleString('pt-BR')}`);
        } else {
            console.log('⚠️  Nenhum documento financeiro encontrado na tabela');
        }
        
        console.log('\n🎉 Verificação concluída!');
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

verificarDadosFinanceiros().catch(console.error);