#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://qerubjitetqwfqqydhzv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDU5NDUsImV4cCI6MjA2OTU4MTk0NX0.eP6QxQI1oerd5HxPxYpHF8mhKLK6bwnuIyw_aKFjuwU';

const supabase = createClient(supabaseUrl, supabaseKey);

// Função de normalização (copiada do service)
function normalizeFinancialDocument(row) {
  // Garantir que partner_name seja extraído corretamente
  const partnerName = row.partner?.name || row.partner_name || null;
  
  // Garantir que payment_method seja extraído corretamente
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
    // Campos mapeados para compatibilidade
    type: row.direction,
    date: row.issue_date,
    partner_name: partnerName,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function testarNormalizacao() {
    console.log('🧪 Testando normalização de dados financeiros...');
    
    try {
        // 1. Buscar dados brutos
        console.log('\n1️⃣ Buscando dados brutos...');
        const { data: rawData, error: rawError } = await supabase
            .from('financial_documents')
            .select(`
                *,
                partner:partners(name, id),
                payment_method_data:payment_methods(name, id)
            `)
            .order('created_at', { ascending: false })
            .limit(3);
        
        if (rawError) {
            console.error('❌ Erro ao buscar dados brutos:', rawError);
            return;
        }
        
        console.log(`📊 Encontrados ${rawData?.length || 0} documentos brutos`);
        
        if (rawData && rawData.length > 0) {
            console.log('\n📋 Dados brutos (primeiro documento):');
            const firstDoc = rawData[0];
            console.log('   - ID:', firstDoc.id);
            console.log('   - Description:', firstDoc.description);
            console.log('   - Amount:', firstDoc.amount);
            console.log('   - Direction:', firstDoc.direction);
            console.log('   - Status:', firstDoc.status);
            console.log('   - Partner:', firstDoc.partner);
            console.log('   - Payment Method Data:', firstDoc.payment_method_data);
        }
        
        // 2. Testar normalização
        console.log('\n2️⃣ Testando normalização...');
        const normalizedData = rawData?.map(normalizeFinancialDocument) || [];
        
        console.log(`📊 Documentos normalizados: ${normalizedData.length}`);
        
        if (normalizedData.length > 0) {
            console.log('\n📋 Dados normalizados (primeiro documento):');
            const firstNormalized = normalizedData[0];
            console.log('   - ID:', firstNormalized.id);
            console.log('   - Description:', firstNormalized.description);
            console.log('   - Amount:', firstNormalized.amount);
            console.log('   - Direction:', firstNormalized.direction);
            console.log('   - Status:', firstNormalized.status);
            console.log('   - Partner Name:', firstNormalized.partner_name);
            console.log('   - Payment Method:', firstNormalized.payment_method);
            console.log('   - Type:', firstNormalized.type);
            console.log('   - Date:', firstNormalized.date);
        }
        
        // 3. Verificar se há problemas na normalização
        console.log('\n3️⃣ Verificando problemas na normalização...');
        
        const problemas = [];
        
        normalizedData.forEach((doc, index) => {
            if (!doc.id) problemas.push(`Documento ${index + 1}: ID ausente`);
            if (!doc.description) problemas.push(`Documento ${index + 1}: Descrição ausente`);
            if (!doc.amount && doc.amount !== 0) problemas.push(`Documento ${index + 1}: Amount ausente`);
            if (!doc.direction) problemas.push(`Documento ${index + 1}: Direction ausente`);
            if (!doc.status) problemas.push(`Documento ${index + 1}: Status ausente`);
        });
        
        if (problemas.length > 0) {
            console.log('⚠️  Problemas encontrados na normalização:');
            problemas.forEach(problema => console.log(`   - ${problema}`));
        } else {
            console.log('✅ Normalização OK - nenhum problema encontrado');
        }
        
        console.log('\n🎉 Teste de normalização concluído!');
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

testarNormalizacao().catch(console.error);
