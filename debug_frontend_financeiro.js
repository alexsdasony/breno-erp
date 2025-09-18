#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://qerubjitetqwfqqydhzv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDU5NDUsImV4cCI6MjA2OTU4MTk0NX0.eP6QxQI1oerd5HxPxYpHF8mhKLK6bwnuIyw_aKFjuwU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugFrontendFinanceiro() {
    console.log('🔍 Debug completo do frontend financeiro...');
    
    try {
        // 1. Simular exatamente o que a API retorna
        console.log('\n1️⃣ Simulando resposta da API...');
        
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
            return;
        }
        
        // Aplicar paginação como a API faz
        const page = 1;
        const pageSize = 20;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedDocuments = (financialDocs || []).slice(startIndex, endIndex);
        
        console.log(`📊 Total de documentos: ${financialDocs?.length || 0}`);
        console.log(`📊 Documentos paginados: ${paginatedDocuments.length}`);
        
        // 2. Simular a função normalizeFinancialDocument
        console.log('\n2️⃣ Testando normalização...');
        
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
        
        const normalizedDocs = paginatedDocuments.map(normalizeFinancialDocument);
        console.log(`📊 Documentos normalizados: ${normalizedDocs.length}`);
        
        // 3. Verificar se os dados estão corretos após normalização
        console.log('\n3️⃣ Verificando dados normalizados...');
        
        if (normalizedDocs.length > 0) {
            const firstDoc = normalizedDocs[0];
            console.log('📋 Primeiro documento normalizado:');
            console.log('   - ID:', firstDoc.id);
            console.log('   - Description:', firstDoc.description);
            console.log('   - Amount:', firstDoc.amount);
            console.log('   - Direction:', firstDoc.direction);
            console.log('   - Status:', firstDoc.status);
            console.log('   - Partner Name:', firstDoc.partner_name);
            console.log('   - Payment Method:', firstDoc.payment_method);
            console.log('   - Type:', firstDoc.type);
            console.log('   - Date:', firstDoc.date);
        }
        
        // 4. Simular o filtro que o frontend aplica
        console.log('\n4️⃣ Testando filtros do frontend...');
        
        const partner = '';
        const type = '';
        const status = '';
        const activeSegmentId = null;
        
        const filtered = normalizedDocs.filter((it) => {
            const p = partner.trim().toLowerCase();
            const matchesPartner = !p || `${it.partner_name || it.partner?.name || ''}`.toLowerCase().includes(p) || `${it.partner_id || ''}`.toLowerCase().includes(p);
            const matchesType = !type || (it.direction || '') === type;
            const matchesStatus = !status || (it.status || '') === status;
            const matchesSegment = !activeSegmentId || activeSegmentId === '0' ||
                                (it.segment_id && it.segment_id === activeSegmentId);
            return matchesPartner && matchesType && matchesStatus && matchesSegment;
        });
        
        console.log(`📊 Documentos após filtros: ${filtered.length}`);
        
        // 5. Verificar se há problemas específicos
        console.log('\n5️⃣ Verificando problemas específicos...');
        
        const problemas = [];
        
        // Verificar se todos os documentos têm ID
        const semId = filtered.filter(doc => !doc.id);
        if (semId.length > 0) {
            problemas.push(`${semId.length} documentos sem ID`);
        }
        
        // Verificar se todos os documentos têm descrição
        const semDescricao = filtered.filter(doc => !doc.description);
        if (semDescricao.length > 0) {
            problemas.push(`${semDescricao.length} documentos sem descrição`);
        }
        
        // Verificar se todos os documentos têm amount
        const semAmount = filtered.filter(doc => !doc.amount && doc.amount !== 0);
        if (semAmount.length > 0) {
            problemas.push(`${semAmount.length} documentos sem amount`);
        }
        
        // Verificar se todos os documentos têm direction
        const semDirection = filtered.filter(doc => !doc.direction);
        if (semDirection.length > 0) {
            problemas.push(`${semDirection.length} documentos sem direction`);
        }
        
        // Verificar se todos os documentos têm status
        const semStatus = filtered.filter(doc => !doc.status);
        if (semStatus.length > 0) {
            problemas.push(`${semStatus.length} documentos sem status`);
        }
        
        if (problemas.length > 0) {
            console.log('⚠️  Problemas encontrados:');
            problemas.forEach(problema => console.log(`   - ${problema}`));
        } else {
            console.log('✅ Nenhum problema encontrado na normalização');
        }
        
        // 6. Verificar se os dados estão prontos para exibição
        console.log('\n6️⃣ Verificando dados para exibição...');
        
        if (filtered.length > 0) {
            console.log('📋 Documentos prontos para exibição:');
            filtered.forEach((doc, index) => {
                console.log(`${index + 1}. ${doc.description} - R$ ${doc.amount} (${doc.direction})`);
            });
        } else {
            console.log('⚠️  Nenhum documento para exibir');
        }
        
        console.log('\n🎉 Debug do frontend concluído!');
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

debugFrontendFinanceiro().catch(console.error);
