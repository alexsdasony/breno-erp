#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://qerubjitetqwfqqydhzv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDU5NDUsImV4cCI6MjA2OTU4MTk0NX0.eP6QxQI1oerd5HxPxYpHF8mhKLK6bwnuIyw_aKFjuwU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarDados() {
    console.log('🔍 Verificando dados dos clientes...');
    
    try {
        // Buscar clientes com roles
        const { data: customers, error } = await supabase
            .from('partners')
            .select(`
                *,
                partner_roles!inner(role)
            `)
            .eq('partner_roles.role', 'customer')
            .order('created_at', { ascending: false })
            .limit(10);
        
        if (error) {
            console.error('❌ Erro ao buscar clientes:', error);
            return;
        }
        
        console.log(`📊 Encontrados ${customers?.length || 0} clientes`);
        
        if (customers && customers.length > 0) {
            console.log('\n📋 Primeiros 5 clientes:');
            customers.slice(0, 5).forEach((customer, index) => {
                console.log(`\n${index + 1}. ID: ${customer.id}`);
                console.log(`   Nome: "${customer.name}"`);
                console.log(`   Tax ID: "${customer.tax_id}"`);
                console.log(`   Email: "${customer.email || 'N/A'}"`);
                console.log(`   Phone: "${customer.phone || 'N/A'}"`);
                console.log(`   Address: "${customer.address || 'N/A'}"`);
                console.log(`   City: "${customer.city || 'N/A'}"`);
                console.log(`   State: "${customer.state || 'N/A'}"`);
                console.log(`   Segment ID: "${customer.segment_id || 'N/A'}"`);
                console.log(`   Status: "${customer.status}"`);
                console.log(`   Created: ${customer.created_at}`);
            });
            
            // Verificar se há clientes com nome vazio ou apenas tax_id
            const clientesComProblema = customers.filter(c => 
                !c.name || 
                c.name.trim() === '' || 
                c.name === c.tax_id ||
                c.name === 'Cliente'
            );
            
            if (clientesComProblema.length > 0) {
                console.log(`\n⚠️  ${clientesComProblema.length} clientes com problemas de nome:`);
                clientesComProblema.forEach((customer, index) => {
                    console.log(`${index + 1}. ID: ${customer.id} - Nome: "${customer.name}" - Tax ID: "${customer.tax_id}"`);
                });
            }
        }
        
        // Verificar segmentos
        console.log('\n🏷️  Verificando segmentos...');
        const { data: segments, error: segmentsError } = await supabase
            .from('segments')
            .select('*')
            .order('name');
        
        if (segmentsError) {
            console.error('❌ Erro ao buscar segmentos:', segmentsError);
        } else {
            console.log(`📊 Encontrados ${segments?.length || 0} segmentos:`);
            segments?.forEach(segment => {
                console.log(`   - ${segment.name} (ID: ${segment.id})`);
            });
        }
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

verificarDados().catch(console.error);
