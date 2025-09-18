#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://qerubjitetqwfqqydhzv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDU5NDUsImV4cCI6MjA2OTU4MTk0NX0.eP6QxQI1oerd5HxPxYpHF8mhKLK6bwnuIyw_aKFjuwU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarTabelasFinanceiras() {
    console.log('🔍 Verificando tabelas financeiras...');
    
    try {
        // 1. Verificar tabela financial_documents
        console.log('\n1️⃣ Verificando tabela financial_documents...');
        const { data: financialDocs, error: financialDocsError } = await supabase
            .from('financial_documents')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
        
        if (financialDocsError) {
            console.error('❌ Erro ao buscar financial_documents:', financialDocsError);
        } else {
            console.log(`📊 Encontrados ${financialDocs?.length || 0} documentos financeiros`);
            if (financialDocs && financialDocs.length > 0) {
                console.log('\n📋 Primeiros documentos financeiros:');
                financialDocs.slice(0, 5).forEach((doc, index) => {
                    console.log(`${index + 1}. ID: ${doc.id}`);
                    console.log(`   - Descrição: ${doc.description || 'N/A'}`);
                    console.log(`   - Valor: R$ ${doc.amount || 0}`);
                    console.log(`   - Status: ${doc.status || 'N/A'}`);
                    console.log(`   - Data: ${doc.created_at}`);
                    console.log('');
                });
            }
        }
        
        // 2. Verificar tabela transactions
        console.log('\n2️⃣ Verificando tabela transactions...');
        const { data: transactions, error: transactionsError } = await supabase
            .from('transactions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
        
        if (transactionsError) {
            console.error('❌ Erro ao buscar transactions:', transactionsError);
        } else {
            console.log(`📊 Encontradas ${transactions?.length || 0} transações`);
            if (transactions && transactions.length > 0) {
                console.log('\n📋 Primeiras transações:');
                transactions.slice(0, 5).forEach((transaction, index) => {
                    console.log(`${index + 1}. ID: ${transaction.id}`);
                    console.log(`   - Descrição: ${transaction.description || 'N/A'}`);
                    console.log(`   - Valor: R$ ${transaction.amount || 0}`);
                    console.log(`   - Tipo: ${transaction.type || 'N/A'}`);
                    console.log(`   - Data: ${transaction.created_at}`);
                    console.log('');
                });
            }
        }
        
        // 3. Verificar tabela sales
        console.log('\n3️⃣ Verificando tabela sales...');
        const { data: sales, error: salesError } = await supabase
            .from('sales')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
        
        if (salesError) {
            console.error('❌ Erro ao buscar sales:', salesError);
        } else {
            console.log(`📊 Encontradas ${sales?.length || 0} vendas`);
            if (sales && sales.length > 0) {
                console.log('\n📋 Primeiras vendas:');
                sales.slice(0, 5).forEach((sale, index) => {
                    console.log(`${index + 1}. ID: ${sale.id}`);
                    console.log(`   - Cliente: ${sale.customer_name || 'N/A'}`);
                    console.log(`   - Valor: R$ ${sale.total_amount || 0}`);
                    console.log(`   - Status: ${sale.status || 'N/A'}`);
                    console.log(`   - Data: ${sale.created_at}`);
                    console.log('');
                });
            }
        }
        
        // 4. Verificar tabela billings
        console.log('\n4️⃣ Verificando tabela billings...');
        const { data: billings, error: billingsError } = await supabase
            .from('billings')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
        
        if (billingsError) {
            console.error('❌ Erro ao buscar billings:', billingsError);
        } else {
            console.log(`📊 Encontrados ${billings?.length || 0} cobranças`);
            if (billings && billings.length > 0) {
                console.log('\n📋 Primeiras cobranças:');
                billings.slice(0, 5).forEach((billing, index) => {
                    console.log(`${index + 1}. ID: ${billing.id}`);
                    console.log(`   - Cliente: ${billing.customer_name || 'N/A'}`);
                    console.log(`   - Valor: R$ ${billing.amount || 0}`);
                    console.log(`   - Status: ${billing.status || 'N/A'}`);
                    console.log(`   - Data: ${billing.created_at}`);
                    console.log('');
                });
            }
        }
        
        console.log('\n🎉 Verificação concluída!');
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

verificarTabelasFinanceiras().catch(console.error);
