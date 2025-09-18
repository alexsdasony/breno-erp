#!/usr/bin/env node

import fetch from 'node-fetch';

async function debugEstruturaResposta() {
    console.log('🔍 Debugando estrutura da resposta...');
    
    try {
        // 1. Testar API diretamente
        console.log('\n1️⃣ Testando API diretamente...');
        const response = await fetch('http://localhost:3000/api/financial-documents?page=1&pageSize=20');
        const apiData = await response.json();
        
        console.log('📊 API Response completa:', JSON.stringify(apiData, null, 2));
        
        console.log('\n📋 Estrutura da resposta:');
        console.log('- success:', apiData.success);
        console.log('- financialDocuments existe:', !!apiData.financialDocuments);
        console.log('- financialDocuments length:', apiData.financialDocuments?.length || 0);
        console.log('- pagination existe:', !!apiData.pagination);
        console.log('- pagination:', apiData.pagination);
        
        if (apiData.financialDocuments && apiData.financialDocuments.length > 0) {
            console.log('\n✅ API retornando dados:', apiData.financialDocuments.length);
            console.log('📋 Primeiro documento:');
            const first = apiData.financialDocuments[0];
            console.log('- ID:', first.id);
            console.log('- Description:', first.description);
            console.log('- Amount:', first.amount);
            console.log('- Direction:', first.direction);
        } else {
            console.log('❌ API não retornando dados');
        }
        
        // 2. Simular apiService.get
        console.log('\n2️⃣ Simulando apiService.get...');
        
        // Simular o que o apiService.get retorna
        const serviceResponse = apiData; // apiService.get retorna diretamente a resposta
        
        console.log('📊 Service Response:', {
            success: serviceResponse.success,
            hasFinancialDocuments: !!serviceResponse.financialDocuments,
            financialDocumentsLength: serviceResponse.financialDocuments?.length || 0,
            responseKeys: Object.keys(serviceResponse)
        });
        
        // 3. Simular getFinancialDocuments
        console.log('\n3️⃣ Simulando getFinancialDocuments...');
        
        const result = {
            success: true,
            data: serviceResponse
        };
        
        console.log('📊 getFinancialDocuments result:', {
            success: result.success,
            hasData: !!result.data,
            hasFinancialDocuments: !!result.data?.financialDocuments,
            totalDocuments: result.data?.financialDocuments?.length || 0
        });
        
        // 4. Simular hook
        console.log('\n4️⃣ Simulando hook...');
        
        const list = result.data?.financialDocuments || [];
        console.log('📊 Lista extraída no hook:', list.length, 'items');
        
        if (list.length > 0) {
            console.log('✅ Hook deveria funcionar com', list.length, 'items');
        } else {
            console.log('❌ Hook não funcionará - lista vazia');
            console.log('🔍 Investigando por que a lista está vazia...');
            console.log('- result.data existe:', !!result.data);
            console.log('- result.data.financialDocuments existe:', !!result.data?.financialDocuments);
            console.log('- result.data.financialDocuments é array:', Array.isArray(result.data?.financialDocuments));
        }
        
        console.log('\n🎉 Debug concluído!');
        
    } catch (error) {
        console.error('❌ Erro no debug:', error);
    }
}

debugEstruturaResposta().catch(console.error);
