#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://qerubjitetqwfqqydhzv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDU5NDUsImV4cCI6MjA2OTU4MTk0NX0.eP6QxQI1oerd5HxPxYpHF8mhKLK6bwnuIyw_aKFjuwU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugApiFinanceira() {
    console.log('🔍 Debug da API financeira...');
    
    try {
        // 1. Verificar dados na tabela financial_documents
        console.log('\n1️⃣ Verificando dados na tabela financial_documents...');
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
                    console.log(`   - Direction: ${doc.direction || 'N/A'}`);
                    console.log(`   - Parceiro: ${doc.partner?.name || 'N/A'}`);
                    console.log(`   - Data: ${doc.created_at}`);
                    console.log('');
                });
            }
        }
        
        // 2. Simular a API como o frontend faria
        console.log('\n2️⃣ Simulando chamada da API...');
        
        // Simular parâmetros da API
        const page = 1;
        const pageSize = 20;
        const segmentId = null;
        
        console.log('📝 Parâmetros da API:', { page, pageSize, segmentId });
        
        // Construir filtros baseados no segmento
        const segmentFilter = segmentId && segmentId !== 'null' && segmentId !== '0' 
            ? { segment_id: segmentId } 
            : {};
        
        console.log('🔍 Filtros aplicados:', segmentFilter);
        
        // Buscar documentos financeiros da tabela financial_documents
        const { data: apiDocs, error: apiError } = await supabase
            .from('financial_documents')
            .select(`
                *,
                partner:partners(name, id),
                payment_method_data:payment_methods(name, id)
            `)
            .match(segmentFilter)
            .order('created_at', { ascending: false });
        
        if (apiError) {
            console.error('❌ Erro na simulação da API:', apiError);
        } else {
            console.log(`📊 API retornaria ${apiDocs?.length || 0} documentos`);
            
            // Aplicar paginação
            const startIndex = (page - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const paginatedDocuments = (apiDocs || []).slice(startIndex, endIndex);
            
            console.log(`📊 Documentos paginados: ${paginatedDocuments.length}`);
            
            if (paginatedDocuments.length > 0) {
                console.log('\n📋 Documentos que seriam retornados:');
                paginatedDocuments.forEach((doc, index) => {
                    console.log(`${index + 1}. ${doc.description} - R$ ${doc.amount} (${doc.direction})`);
                });
            }
        }
        
        // 3. Verificar se há problemas de permissão
        console.log('\n3️⃣ Verificando permissões...');
        
        // Testar com diferentes tipos de usuário
        const { data: testQuery, error: testError } = await supabase
            .from('financial_documents')
            .select('id, description, amount')
            .limit(1);
        
        if (testError) {
            console.error('❌ Erro de permissão:', testError);
        } else {
            console.log('✅ Permissões OK - dados acessíveis');
        }
        
        console.log('\n🎉 Debug concluído!');
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

debugApiFinanceira().catch(console.error);
