#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://qerubjitetqwfqqydhzv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDU5NDUsImV4cCI6MjA2OTU4MTk0NX0.eP6QxQI1oerd5HxPxYpHF8mhKLK6bwnuIyw_aKFjuwU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarSegmentosExistentes() {
    console.log('🔍 Verificando segmentos existentes...');
    
    try {
        // Verificar segmentos na tabela segments
        console.log('\n📊 Verificando tabela segments...');
        const { data: segments, error: segmentsError } = await supabase
            .from('segments')
            .select('*');
        
        if (segmentsError) {
            console.error('❌ Erro ao buscar segmentos:', segmentsError);
        } else {
            console.log(`📊 Encontrados ${segments?.length || 0} segmentos na tabela segments`);
            if (segments && segments.length > 0) {
                segments.forEach(segment => {
                    console.log(`   - ${segment.name} (ID: ${segment.id})`);
                });
            }
        }
        
        // Verificar segmentos únicos na tabela partners
        console.log('\n📊 Verificando segmentos únicos na tabela partners...');
        const { data: partners, error: partnersError } = await supabase
            .from('partners')
            .select('segment_id')
            .not('segment_id', 'is', null);
        
        if (partnersError) {
            console.error('❌ Erro ao buscar partners:', partnersError);
        } else {
            const segmentIds = [...new Set(partners.map(p => p.segment_id))];
            console.log(`📊 Encontrados ${segmentIds.length} segment_ids únicos na tabela partners:`);
            segmentIds.forEach(id => {
                console.log(`   - ${id}`);
            });
        }
        
        // Verificar se há segmentos com nomes específicos
        console.log('\n🔍 Verificando segmentos com nomes específicos...');
        const segmentosParaVerificar = ['NAURU', 'ESCRITÓRIO JURÍDICO', 'RDS IMOBILIÁRIO'];
        
        for (const nomeSegmento of segmentosParaVerificar) {
            const { data: segment, error } = await supabase
                .from('segments')
                .select('*')
                .ilike('name', `%${nomeSegmento}%`);
            
            if (error) {
                console.error(`❌ Erro ao buscar segmento ${nomeSegmento}:`, error);
            } else {
                console.log(`📊 Segmento ${nomeSegmento}: ${segment?.length || 0} encontrados`);
                if (segment && segment.length > 0) {
                    segment.forEach(s => {
                        console.log(`   - ${s.name} (ID: ${s.id})`);
                    });
                }
            }
        }
        
        console.log('\n🎉 Verificação concluída!');
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

verificarSegmentosExistentes().catch(console.error);
