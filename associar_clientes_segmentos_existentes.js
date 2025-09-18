#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://qerubjitetqwfqqydhzv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDU5NDUsImV4cCI6MjA2OTU4MTk0NX0.eP6QxQI1oerd5HxPxYpHF8mhKLK6bwnuIyw_aKFjuwU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function associarClientesSegmentosExistentes() {
    console.log('🔗 Associando clientes aos segmentos existentes...');
    
    try {
        // IDs dos segmentos que já existem na tabela partners
        const segmentosExistentes = {
            '68a2c101-4c01-4b1f-b5a2-18468df86b26': 'NAURU',
            '791b380a-89dd-44e6-8982-bc204b47a024': 'ESCRITÓRIO JURÍDICO - AR&N',
            'f5c2e105-4c05-4bbd-947a-575cf8877936': 'RDS IMOBILIÁRIO'
        };
        
        console.log('📊 Segmentos disponíveis:');
        Object.entries(segmentosExistentes).forEach(([id, name]) => {
            console.log(`   - ${name} (ID: ${id})`);
        });
        
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
        
        console.log(`\n📊 Encontrados ${customersWithoutSegment?.length || 0} clientes sem segmento`);
        
        if (customersWithoutSegment && customersWithoutSegment.length > 0) {
            // Associar clientes aos segmentos baseado nos nomes ou tax_ids
            for (const customer of customersWithoutSegment) {
                let segmentId = null;
                let segmentName = '';
                
                // Determinar segmento baseado no nome ou tax_id
                if (customer.name.includes('NAURU') || 
                    customer.tax_id === '524.171.152-04' ||
                    customer.name.includes('JOSINEI') ||
                    customer.name.includes('VITÓRIA') ||
                    customer.name.includes('ALBERTO')) {
                    segmentId = '68a2c101-4c01-4b1f-b5a2-18468df86b26';
                    segmentName = 'NAURU';
                } else if (customer.name.includes('ARN') || 
                          customer.name.includes('ADVOGADOS') ||
                          customer.name.includes('JURÍDICO')) {
                    segmentId = '791b380a-89dd-44e6-8982-bc204b47a024';
                    segmentName = 'ESCRITÓRIO JURÍDICO - AR&N';
                } else {
                    // Associar ao segmento RDS IMOBILIÁRIO (padrão para os demais)
                    segmentId = 'f5c2e105-4c05-4bbd-947a-575cf8877936';
                    segmentName = 'RDS IMOBILIÁRIO';
                }
                
                console.log(`🏷️  Associando ${customer.name} ao segmento ${segmentName}`);
                
                // Atualizar o cliente com o segmento
                const { error: updateError } = await supabase
                    .from('partners')
                    .update({ segment_id: segmentId })
                    .eq('id', customer.id);
                
                if (updateError) {
                    console.error(`❌ Erro ao atualizar ${customer.name}:`, updateError);
                } else {
                    console.log(`✅ ${customer.name} associado ao segmento ${segmentName} com sucesso!`);
                }
            }
        }
        
        // Verificar resultado final
        console.log('\n🔍 Verificando resultado final...');
        const { data: customersWithSegment, error: finalError } = await supabase
            .from('partners')
            .select(`
                *,
                partner_roles!inner(role)
            `)
            .eq('partner_roles.role', 'customer')
            .not('segment_id', 'is', null);
        
        if (finalError) {
            console.error('❌ Erro ao verificar resultado:', finalError);
        } else {
            console.log(`📊 Total de clientes com segmento: ${customersWithSegment?.length || 0}`);
            
            // Agrupar por segmento
            const segmentosCount = {};
            customersWithSegment?.forEach(customer => {
                const segmentId = customer.segment_id;
                segmentosCount[segmentId] = (segmentosCount[segmentId] || 0) + 1;
            });
            
            console.log('\n📊 Distribuição por segmento:');
            Object.entries(segmentosCount).forEach(([segmentId, count]) => {
                const segmentName = segmentosExistentes[segmentId] || 'Desconhecido';
                console.log(`   - ${segmentName}: ${count} clientes`);
            });
        }
        
        console.log('\n🎉 Associação concluída!');
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

associarClientesSegmentosExistentes().catch(console.error);
