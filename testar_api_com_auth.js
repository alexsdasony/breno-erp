#!/usr/bin/env node

import fetch from 'node-fetch';

async function testarApiComAuth() {
    console.log('🔍 Testando API com autenticação...');
    
    try {
        // 1. Testar API sem autenticação
        console.log('\n1️⃣ Testando API sem autenticação...');
        const response1 = await fetch('http://localhost:3000/api/financial-documents?page=1&pageSize=20');
        const data1 = await response1.json();
        
        console.log('📊 Resposta sem auth:', {
            status: response1.status,
            success: data1.success,
            totalDocuments: data1.financialDocuments?.length || 0
        });
        
        // 2. Testar API com headers de autenticação (simulando o que o frontend faz)
        console.log('\n2️⃣ Testando API com headers de autenticação...');
        
        // Simular headers que o frontend envia
        const response2 = await fetch('http://localhost:3000/api/financial-documents?page=1&pageSize=20', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDU5NDUsImV4cCI6MjA2OTU4MTk0NX0.eP6QxQI1oerd5HxPxYpHF8mhKLK6bwnuIyw_aKFjuwU',
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDU5NDUsImV4cCI6MjA2OTU4MTk0NX0.eP6QxQI1oerd5HxPxYpHF8mhKLK6bwnuIyw_aKFjuwU',
                'X-User-Token': 'fake-user-token' // Simular token de usuário
            }
        });
        const data2 = await response2.json();
        
        console.log('📊 Resposta com auth:', {
            status: response2.status,
            success: data2.success,
            totalDocuments: data2.financialDocuments?.length || 0
        });
        
        // 3. Comparar as respostas
        console.log('\n3️⃣ Comparando respostas...');
        console.log('📊 Diferenças:', {
            semAuth: {
                success: data1.success,
                totalDocuments: data1.financialDocuments?.length || 0,
                hasFinancialDocuments: !!data1.financialDocuments
            },
            comAuth: {
                success: data2.success,
                totalDocuments: data2.financialDocuments?.length || 0,
                hasFinancialDocuments: !!data2.financialDocuments
            }
        });
        
        // 4. Verificar se há diferença na estrutura
        if (data1.financialDocuments?.length !== data2.financialDocuments?.length) {
            console.log('⚠️ DIFERENÇA ENCONTRADA!');
            console.log('📊 Sem auth - estrutura:', Object.keys(data1));
            console.log('📊 Com auth - estrutura:', Object.keys(data2));
        } else {
            console.log('✅ Respostas idênticas');
        }
        
        console.log('\n🎉 Teste concluído!');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

testarApiComAuth().catch(console.error);
