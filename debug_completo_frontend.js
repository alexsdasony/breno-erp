#!/usr/bin/env node

import fetch from 'node-fetch';

async function debugCompletoFrontend() {
    console.log('🔍 DEBUG COMPLETO DO FRONTEND FINANCEIRO');
    console.log('=========================================\n');
    
    try {
        // 1. Testar a API diretamente como o navegador faria
        console.log('1️⃣ TESTANDO API DIRETAMENTE...');
        
        const apiUrl = 'http://localhost:3000/api/financial-documents?page=1&pageSize=20';
        console.log('📡 URL da API:', apiUrl);
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            console.error('❌ API retornou erro:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('❌ Detalhes do erro:', errorText);
            return;
        }
        
        const apiData = await response.json();
        console.log('✅ API funcionando corretamente');
        console.log('📊 Dados da API:', {
            success: apiData.success,
            totalDocuments: apiData.financialDocuments?.length || 0,
            pagination: apiData.pagination
        });
        
        // 2. Simular exatamente o que o hook faz
        console.log('\n2️⃣ SIMULANDO O HOOK useFinancialDocuments...');
        
        // Simular fetchPage
        const simulateResponse = {
            data: apiData
        };
        
        console.log('📥 Response simulado:', simulateResponse);
        
        const list = simulateResponse.data?.financialDocuments || [];
        console.log('📊 Lista extraída:', list.length, 'documentos');
        
        // Simular normalização
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
        console.log('🔄 Documentos normalizados:', normalized.length);
        
        // Simular estado do hook
        const hookState = {
            items: normalized,
            loading: false,
            refetching: false,
            page: 1,
            hasMore: normalized.length === 20
        };
        
        console.log('🎯 Estado do hook simulado:', {
            items: hookState.items.length,
            loading: hookState.loading,
            refetching: hookState.refetching,
            page: hookState.page,
            hasMore: hookState.hasMore
        });
        
        // 3. Simular o componente FinancialView
        console.log('\n3️⃣ SIMULANDO COMPONENTE FinancialView...');
        
        const items = hookState.items;
        const partner = '';
        const type = '';
        const status = '';
        const activeSegmentId = null;
        
        // Simular filtro
        const filtered = items.filter((it) => {
            const p = partner.trim().toLowerCase();
            const matchesPartner = !p || `${it.partner_name || it.partner?.name || ''}`.toLowerCase().includes(p) || `${it.partner_id || ''}`.toLowerCase().includes(p);
            const matchesType = !type || (it.direction || '') === type;
            const matchesStatus = !status || (it.status || '') === status;
            const matchesSegment = !activeSegmentId || activeSegmentId === '0' ||
                                (it.segment_id && it.segment_id === activeSegmentId);
            return matchesPartner && matchesType && matchesStatus && matchesSegment;
        });
        
        console.log('📊 Items filtrados:', filtered.length);
        
        // 4. Simular o componente FinancialTable
        console.log('\n4️⃣ SIMULANDO COMPONENTE FinancialTable...');
        
        console.log('📊 Items recebidos pela tabela:', filtered.length);
        
        if (filtered.length > 0) {
            console.log('✅ DADOS PRONTOS PARA RENDERIZAÇÃO:');
            filtered.forEach((doc, index) => {
                console.log(`   ${index + 1}. ${doc.description} - R$ ${doc.amount} (${doc.direction}) - Status: ${doc.status}`);
            });
        } else {
            console.log('⚠️  NENHUM DADO PARA RENDERIZAR');
        }
        
        // 5. Verificar possíveis problemas
        console.log('\n5️⃣ VERIFICANDO POSSÍVEIS PROBLEMAS...');
        
        const problemas = [];
        
        // Verificar se há documentos sem ID
        const semId = filtered.filter(doc => !doc.id);
        if (semId.length > 0) {
            problemas.push(`${semId.length} documentos sem ID`);
        }
        
        // Verificar se há documentos com ID inválido
        const idInvalido = filtered.filter(doc => typeof doc.id !== 'string' || doc.id.trim() === '');
        if (idInvalido.length > 0) {
            problemas.push(`${idInvalido.length} documentos com ID inválido`);
        }
        
        // Verificar se há problemas na estrutura dos dados
        const estruturaInvalida = filtered.filter(doc => !doc.description || !doc.amount && doc.amount !== 0 || !doc.direction || !doc.status);
        if (estruturaInvalida.length > 0) {
            problemas.push(`${estruturaInvalida.length} documentos com estrutura inválida`);
        }
        
        if (problemas.length > 0) {
            console.log('❌ PROBLEMAS ENCONTRADOS:');
            problemas.forEach(problema => console.log(`   - ${problema}`));
        } else {
            console.log('✅ NENHUM PROBLEMA ENCONTRADO - OS DADOS DEVERIAM APARECER NA TELA');
        }
        
        console.log('\n🎉 DEBUG COMPLETO CONCLUÍDO!');
        console.log('==========================================');
        
        if (filtered.length > 0 && problemas.length === 0) {
            console.log('\n🚨 CONCLUSÃO:');
            console.log('   Os dados estão corretos e prontos para exibição.');
            console.log('   Se não aparecem na tela, o problema pode ser:');
            console.log('   1. Erro JavaScript que impede a renderização');
            console.log('   2. Problema no ciclo de vida do React');
            console.log('   3. CSS que está ocultando os elementos');
            console.log('   4. Hook não sendo chamado corretamente');
        }
        
    } catch (error) {
        console.error('❌ ERRO GERAL:', error);
    }
}

debugCompletoFrontend().catch(console.error);
