#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://qerubjitetqwfqqydhzv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDU5NDUsImV4cCI6MjA2OTU4MTk0NX0.eP6QxQI1oerd5HxPxYpHF8mhKLK6bwnuIyw_aKFjuwU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function associarClientesSegmentos() {
    console.log('🔗 Associando clientes aos segmentos...');
    
    try {
        // Buscar segmentos existentes
        const { data: segments, error: segmentsError } = await supabase
            .from('segments')
            .select('*');
        
        if (segmentsError) {
            console.error('❌ Erro ao buscar segmentos:', segmentsError);
            return;
        }
        
        console.log(`📊 Encontrados ${segments?.length || 0} segmentos`);
        
        if (segments && segments.length > 0) {
            segments.forEach(segment => {
                console.log(`   - ${segment.name} (ID: ${segment.id})`);
            });
        }
        
        // Buscar clientes sem segmento
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
            return;
        }
        
        console.log(`📊 Encontrados ${customersWithoutSegment?.length || 0} clientes sem segmento`);
        
        if (customersWithoutSegment && customersWithoutSegment.length > 0) {
            // Associar clientes aos segmentos baseado nos nomes
            for (const customer of customersWithoutSegment) {
                let segmentId = null;
                
                // Determinar segmento baseado no nome ou tax_id
                if (customer.name.includes('NAURU') || customer.tax_id === '524.171.152-04') {
                    // Buscar segmento NAURU
                    const nauruSegment = segments?.find(s => s.name.includes('NAURU'));
                    if (nauruSegment) {
                        segmentId = nauruSegment.id;
                        console.log(`🏷️  Associando ${customer.name} ao segmento NAURU`);
                    }
                } else if (customer.name.includes('ARN') || customer.name.includes('ADVOGADOS')) {
                    // Buscar segmento ESCRITÓRIO JURÍDICO
                    const juridicoSegment = segments?.find(s => s.name.includes('JURÍDICO') || s.name.includes('ARN'));
                    if (juridicoSegment) {
                        segmentId = juridicoSegment.id;
                        console.log(`🏷️  Associando ${customer.name} ao segmento ESCRITÓRIO JURÍDICO`);
                    }
                } else {
                    // Associar ao segmento RDS IMOBILIÁRIO (padrão)
                    const rdsSegment = segments?.find(s => s.name.includes('RDS') || s.name.includes('IMO'));
                    if (rdsSegment) {
                        segmentId = rdsSegment.id;
                        console.log(`🏷️  Associando ${customer.name} ao segmento RDS IMOBILIÁRIO`);
                    }
                }
                
                if (segmentId) {
                    // Atualizar o cliente com o segmento
                    const { error: updateError } = await supabase
                        .from('partners')
                        .update({ segment_id: segmentId })
                        .eq('id', customer.id);
                    
                    if (updateError) {
                        console.error(`❌ Erro ao atualizar ${customer.name}:`, updateError);
                    } else {
                        console.log(`✅ ${customer.name} associado ao segmento com sucesso!`);
                    }
                } else {
                    console.log(`⚠️  Segmento não encontrado para ${customer.name}`);
                }
            }
        }
        
        console.log('\n🎉 Associação concluída!');
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

associarClientesSegmentos().catch(console.error);
