#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://qerubjitetqwfqqydhzv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDU5NDUsImV4cCI6MjA2OTU4MTk0NX0.eP6QxQI1oerd5HxPxYpHF8mhKLK6bwnuIyw_aKFjuwU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarTabelas() {
    console.log('🔍 Verificando tabelas do sistema...');
    
    try {
        // 1. Verificar tabela financial_documents
        console.log('\n1️⃣ Verificando tabela financial_documents...');
        const { data: financialDocs, error: financialError } = await supabase
            .from('financial_documents')
            .select('*')
            .limit(1);
        
        if (financialError) {
            console.error('❌ Erro na tabela financial_documents:', financialError);
        } else {
            console.log('✅ Tabela financial_documents OK');
        }
        
        // 2. Verificar tabela accounts_payable
        console.log('\n2️⃣ Verificando tabela accounts_payable...');
        const { data: accountsPayable, error: accountsError } = await supabase
            .from('accounts_payable')
            .select('*')
            .limit(1);
        
        if (accountsError) {
            console.error('❌ Erro na tabela accounts_payable:', accountsError);
            console.log('📝 Tabela accounts_payable não existe ou tem problemas');
        } else {
            console.log('✅ Tabela accounts_payable OK');
        }
        
        // 3. Verificar tabela accounts_receivable
        console.log('\n3️⃣ Verificando tabela accounts_receivable...');
        const { data: accountsReceivable, error: receivableError } = await supabase
            .from('accounts_receivable')
            .select('*')
            .limit(1);
        
        if (receivableError) {
            console.error('❌ Erro na tabela accounts_receivable:', receivableError);
            console.log('📝 Tabela accounts_receivable não existe ou tem problemas');
        } else {
            console.log('✅ Tabela accounts_receivable OK');
        }
        
        // 4. Listar todas as tabelas disponíveis
        console.log('\n4️⃣ Verificando outras tabelas importantes...');
        
        const tabelas = [
            'partners',
            'segments', 
            'payment_methods',
            'users',
            'products',
            'suppliers',
            'customers'
        ];
        
        for (const tabela of tabelas) {
            try {
                const { data, error } = await supabase
                    .from(tabela)
                    .select('*')
                    .limit(1);
                
                if (error) {
                    console.log(`❌ Tabela ${tabela}: ${error.message}`);
                } else {
                    console.log(`✅ Tabela ${tabela}: OK`);
                }
            } catch (err) {
                console.log(`❌ Tabela ${tabela}: Erro de conexão`);
            }
        }
        
        console.log('\n🎉 Verificação de tabelas concluída!');
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

verificarTabelas().catch(console.error);
