#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://qerubjitetqwfqqydhzv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDU5NDUsImV4cCI6MjA2OTU4MTk0NX0.eP6QxQI1oerd5HxPxYpHF8mhKLK6bwnuIyw_aKFjuwU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarConstraintsFinanceiras() {
    console.log('🔍 Verificando constraints financeiras...');
    
    try {
        // 1. Verificar documento existente
        console.log('\n1️⃣ Verificando documento existente...');
        const { data: existingDoc, error: existingError } = await supabase
            .from('financial_documents')
            .select('*')
            .limit(1)
            .single();
        
        if (existingError) {
            console.error('❌ Erro ao buscar documento existente:', existingError);
        } else {
            console.log('📊 Documento existente:');
            console.log(`   - ID: ${existingDoc.id}`);
            console.log(`   - Status: ${existingDoc.status}`);
            console.log(`   - Direction: ${existingDoc.direction}`);
            console.log(`   - Amount: ${existingDoc.amount}`);
            console.log(`   - Description: ${existingDoc.description}`);
        }
        
        // 2. Testar diferentes status
        console.log('\n2️⃣ Testando diferentes status...');
        
        const statusParaTestar = ['paid', 'pending', 'cancelled', 'active', 'inactive'];
        
        for (const status of statusParaTestar) {
            console.log(`🔄 Testando status: ${status}`);
            
            const documentoTeste = {
                description: `Teste status ${status}`,
                amount: 100.00,
                direction: 'receivable',
                status: status,
                issue_date: new Date().toISOString().split('T')[0],
                due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                partner_id: null,
                payment_method_id: null,
                notes: `Teste de status ${status}`
            };
            
            const { data: testDoc, error: testError } = await supabase
                .from('financial_documents')
                .insert([documentoTeste])
                .select()
                .single();
            
            if (testError) {
                console.log(`❌ Status ${status} não aceito:`, testError.message);
            } else {
                console.log(`✅ Status ${status} aceito! ID: ${testDoc.id}`);
                
                // Limpar documento teste
                await supabase
                    .from('financial_documents')
                    .delete()
                    .eq('id', testDoc.id);
            }
        }
        
        // 3. Testar diferentes directions
        console.log('\n3️⃣ Testando diferentes directions...');
        
        const directionsParaTestar = ['receivable', 'payable', 'income', 'expense'];
        
        for (const direction of directionsParaTestar) {
            console.log(`🔄 Testando direction: ${direction}`);
            
            const documentoTeste = {
                description: `Teste direction ${direction}`,
                amount: 100.00,
                direction: direction,
                status: 'paid', // Usar status que sabemos que funciona
                issue_date: new Date().toISOString().split('T')[0],
                due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                partner_id: null,
                payment_method_id: null,
                notes: `Teste de direction ${direction}`
            };
            
            const { data: testDoc, error: testError } = await supabase
                .from('financial_documents')
                .insert([documentoTeste])
                .select()
                .single();
            
            if (testError) {
                console.log(`❌ Direction ${direction} não aceito:`, testError.message);
            } else {
                console.log(`✅ Direction ${direction} aceito! ID: ${testDoc.id}`);
                
                // Limpar documento teste
                await supabase
                    .from('financial_documents')
                    .delete()
                    .eq('id', testDoc.id);
            }
        }
        
        console.log('\n🎉 Verificação de constraints concluída!');
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

verificarConstraintsFinanceiras().catch(console.error);
