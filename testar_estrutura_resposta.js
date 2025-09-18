#!/usr/bin/env node

import fetch from 'node-fetch';

async function testarEstruturaResposta() {
    console.log('🔍 Testando estrutura da resposta...');
    
    try {
        // 1. Testar API diretamente
        console.log('\n1️⃣ Testando API diretamente...');
        const response = await fetch('http://localhost:3000/api/financial-documents?page=1&pageSize=20');
        const data = await response.json();
        
        console.log('📊 Resposta da API:', {
            success: data.success,
            totalDocuments: data.financialDocuments?.length || 0,
            hasFinancialDocuments: !!data.financialDocuments,
            isArray: Array.isArray(data.financialDocuments)
        });
        
        if (data.financialDocuments && data.financialDocuments.length > 0) {
            console.log('✅ API retornando dados:', data.financialDocuments.length);
            
            // 2. Simular service
            console.log('\n2️⃣ Simulando service...');
            
            const serviceResult = {
                success: true,
                data: {
                    financialDocuments: data.financialDocuments || []
                }
            };
            
            console.log('📊 Service result:', {
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
                    console.log('📋 Primeiros 3 documentos normalizados:');
                    normalized.slice(0, 3).forEach((doc, index) => {
                        console.log(`   ${index + 1}. ${doc.description} - R$ ${doc.amount} (${doc.direction})`);
                    });
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

testarEstruturaResposta().catch(console.error);
