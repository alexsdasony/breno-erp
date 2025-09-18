#!/usr/bin/env node

import fetch from 'node-fetch';

async function testarApiDireta() {
    console.log('🧪 Testando API direta...');
    
    try {
        // Testar a API de documentos financeiros
        const response = await fetch('http://localhost:3000/api/financial-documents?page=1&pageSize=20');
        
        if (!response.ok) {
            console.error('❌ Erro na resposta da API:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('❌ Detalhes do erro:', errorText);
            return;
        }
        
        const data = await response.json();
        console.log('📊 Resposta da API de documentos financeiros:');
        console.log('   - Success:', data.success);
        console.log('   - Total de documentos:', data.financialDocuments?.length || 0);
        console.log('   - Paginação:', data.pagination);
        
        if (data.financialDocuments && data.financialDocuments.length > 0) {
            console.log('\n📋 Documentos retornados:');
            data.financialDocuments.forEach((doc, index) => {
                console.log(`${index + 1}. ID: ${doc.id}`);
                console.log(`   - Descrição: ${doc.description || 'N/A'}`);
                console.log(`   - Valor: R$ ${doc.amount || 0}`);
                console.log(`   - Status: ${doc.status || 'N/A'}`);
                console.log(`   - Direction: ${doc.direction || 'N/A'}`);
                console.log(`   - Parceiro: ${doc.partner?.name || 'N/A'}`);
                console.log('');
            });
        } else {
            console.log('⚠️  Nenhum documento retornado pela API');
        }
        
        console.log('\n🎉 Teste da API direta concluído!');
        
    } catch (error) {
        console.error('❌ Erro ao testar API:', error);
    }
}

testarApiDireta().catch(console.error);
