#!/usr/bin/env node

import fetch from 'node-fetch';

async function testarServiceDireto() {
    console.log('🧪 Testando service diretamente...');
    
    try {
        // 1. Testar API diretamente
        console.log('\n1️⃣ Testando API diretamente...');
        const response = await fetch('http://localhost:3000/api/financial-documents?page=1&pageSize=20');
        const apiData = await response.json();
        
        console.log('📊 API Response:', {
            success: apiData.success,
            totalDocuments: apiData.financialDocuments?.length || 0,
            pagination: apiData.pagination
        });
        
        if (apiData.financialDocuments && apiData.financialDocuments.length > 0) {
            console.log('✅ API retornando dados:', apiData.financialDocuments.length);
            
            // 2. Simular chamada do service
            console.log('\n2️⃣ Simulando chamada do service...');
            
            // Simular apiService.get
            const serviceResponse = {
                success: true,
                data: apiData
            };
            
            console.log('📊 Service Response:', {
                success: serviceResponse.success,
                hasData: !!serviceResponse.data,
                hasFinancialDocuments: !!serviceResponse.data?.financialDocuments,
                totalDocuments: serviceResponse.data?.financialDocuments?.length || 0
            });
            
            // 3. Simular getFinancialDocuments
            console.log('\n3️⃣ Simulando getFinancialDocuments...');
            
            const result = {
                success: true,
                data: serviceResponse.data
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
                
                // 5. Simular normalização
                console.log('\n5️⃣ Simulando normalização...');
                
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
            }
            
        } else {
            console.log('❌ API não retornando dados');
        }
        
        console.log('\n🎉 Teste concluído!');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

testarServiceDireto().catch(console.error);
