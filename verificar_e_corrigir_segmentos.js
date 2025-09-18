#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://qerubjitetqwfqqydhzv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDU5NDUsImV4cCI6MjA2OTU4MTk0NX0.eP6QxQI1oerd5HxPxYpHF8mhKLK6bwnuIyw_aKFjuwU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarECorrigirSegmentos() {
    console.log('🏷️  Verificando e corrigindo segmentos...');
    
    try {
        // Verificar segmentos existentes
        const { data: segments, error: segmentsError } = await supabase
            .from('segments')
            .select('*');
        
        if (segmentsError) {
            console.error('❌ Erro ao buscar segmentos:', segmentsError);
            return;
        }
        
        console.log(`📊 Encontrados ${segments?.length || 0} segmentos existentes`);
        
        if (segments && segments.length > 0) {
            segments.forEach(segment => {
                console.log(`   - ${segment.name} (ID: ${segment.id})`);
            });
        }
        
        // Se não há segmentos, vamos verificar se existem na tabela partners
        if (!segments || segments.length === 0) {
            console.log('\n🔍 Verificando segmentos na tabela partners...');
            
            const { data: partners, error: partnersError } = await supabase
                .from('partners')
                .select('segment_id')
                .not('segment_id', 'is', null)
                .limit(10);
            
            if (partnersError) {
                console.error('❌ Erro ao buscar partners:', partnersError);
            } else {
                console.log(`📊 Encontrados ${partners?.length || 0} partners com segment_id`);
                if (partners && partners.length > 0) {
                    const segmentIds = [...new Set(partners.map(p => p.segment_id))];
                    console.log('Segment IDs encontrados:', segmentIds);
                }
            }
        }
        
        // Verificar clientes sem segmento
        console.log('\n👥 Verificando clientes sem segmento...');
        const { data: customersWithoutSegment, error: customersError } = await supabase
            .from('partners')
            .select(`
                *,
                partner_roles!inner(role)
            `)
            .eq('partner_roles.role', 'customer')
            .is('segment_id', null);
        
        if (customersError) {
            console.error('❌ Erro ao buscar clientes sem segmento:', customersError);
        } else {
            console.log(`📊 Encontrados ${customersWithoutSegment?.length || 0} clientes sem segmento`);
            
            if (customersWithoutSegment && customersWithoutSegment.length > 0) {
                console.log('\n📋 Clientes sem segmento:');
                customersWithoutSegment.slice(0, 5).forEach((customer, index) => {
                    console.log(`${index + 1}. ${customer.name} (${customer.tax_id})`);
                });
            }
        }
        
        console.log('\n🎉 Verificação concluída!');
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

verificarECorrigirSegmentos().catch(console.error);
