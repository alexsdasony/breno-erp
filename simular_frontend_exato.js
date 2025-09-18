#!/usr/bin/env node

import fetch from 'node-fetch';

async function simularFrontendExato() {
    console.log('🔍 Simulando exatamente o que o frontend faz...');
    
    try {
        // 1. Simular apiService.get
        console.log('\n1️⃣ Simulando apiService.get...');
        
        const response = await fetch('http://localhost:3000/api/financial-documents?page=1&pageSize=20', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDU5NDUsImV4cCI6MjA2OTU4MTk0NX0.eP6QxQI1oerd5HxPxYpHF8mhKLK6bwnuIyw_aKFjuwU',
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDU5NDUsImV4cCI6MjA2OTU4MTk0NX0.eP6QxQI1oerd5HxPxYpHF8mhKLK6bwnuIyw_aKFjuwU'
            }
        });
        
        const apiResponse = await response.json();
        console.log('📊 apiService.get retorna:', {
            success: apiResponse.success,
            totalDocuments: apiResponse.financialDocuments?.length || 0,
            responseKeys: Object.keys(apiResponse)
        });
        
        // 2. Simular getFinancialDocuments
        console.log('\n2️⃣ Simulando getFinancialDocuments...');
        
        // Simular o que o service faz
        const serviceResult = {
            success: true,
            data: {
                financialDocuments: apiResponse.financialDocuments || []
            }
        };
        
        console.log('📊 getFinancialDocuments retorna:', {
            success: serviceResult.success,
            hasData: !!serviceResult.data,
            hasFinancialDocuments: !!serviceResult.data?.financialDocuments,
            totalDocuments: serviceResult.data?.financialDocuments?.length || 0
        });
        
        // 3. Simular hook
        console.log('\n3️⃣ Simulando hook...');
        
        const list = serviceResult.data?.financialDocuments || [];
        console.log('📊 Lista extraída no hook:', list.length, 'items');
        
        if (list.length > 0) {
            console.log('✅ Hook deveria funcionar com', list.length, 'items');
            
            // 4. Simular normalização
            console.log('\n4️⃣ Simulando normalização...');
            
            function normalizeFinancialDocument(row) {
                const partnerName = row.partner?.name || row.partner_name || null;
                const paymentMethod = row.payment_method_data?.name || row.payment_method || null;
                
                return {
                    id: row.id,
                    partner_id: row.partner_id,
                    direction: row.direction,
                    doc_no: row.doc_no,
                    issue_date: row.issue_date,
                    due_date: row.due_date,
                    amount: row.amount || 0,
                    balance: row.balance || row.amount || 0,
                    status: row.status,
                    category_id: row.category_id,
                    segment_id: row.segment_id,
                    description: row.description,
                    payment_method: paymentMethod,
                    payment_method_id: row.payment_method_id,
                    notes: row.notes,
                    deleted_at: row.deleted_at,
                    is_deleted: row.is_deleted,
                    partner: row.partner,
                    type: row.direction,
                    date: row.issue_date,
                    partner_name: partnerName,
                    created_at: row.created_at,
                    updated_at: row.updated_at,
                };
            }
            
            const normalized = list.map(normalizeFinancialDocument);
            console.log('📊 Documentos normalizados:', normalized.length);
            
            if (normalized.length > 0) {
                console.log('✅ Normalização funcionando');
                console.log('📋 Primeiro documento normalizado:');
                const first = normalized[0];
                console.log('   - ID:', first.id);
                console.log('   - Description:', first.description);
                console.log('   - Amount:', first.amount);
                console.log('   - Direction:', first.direction);
                console.log('   - Status:', first.status);
            }
            
        } else {
            console.log('❌ Hook não funcionará - lista vazia');
            console.log('🔍 Investigando por que a lista está vazia...');
            console.log('- serviceResult.data existe:', !!serviceResult.data);
            console.log('- serviceResult.data.financialDocuments existe:', !!serviceResult.data?.financialDocuments);
            console.log('- serviceResult.data.financialDocuments é array:', Array.isArray(serviceResult.data?.financialDocuments));
            console.log('- apiResponse.financialDocuments existe:', !!apiResponse.financialDocuments);
            console.log('- apiResponse.financialDocuments é array:', Array.isArray(apiResponse.financialDocuments));
        }
        
        console.log('\n🎉 Simulação concluída!');
        
    } catch (error) {
        console.error('❌ Erro na simulação:', error);
    }
}

simularFrontendExato().catch(console.error);
