#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://qerubjitetqwfqqydhzv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDU5NDUsImV4cCI6MjA2OTU4MTk0NX0.eP6QxQI1oerd5HxPxYpHF8mhKLK6bwnuIyw_aKFjuwU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testarSegmentosDireto() {
    console.log('🧪 Testando segmentos diretamente...');
    
    try {
        // 1. Verificar segmentos na tabela segments
        console.log('\n1️⃣ Verificando tabela segments...');
        const { data: segmentsData, error: segmentsError } = await supabase
            .from('segments')
            .select('*');
        
        if (segmentsError) {
            console.error('❌ Erro ao buscar segmentos:', segmentsError);
        } else {
            console.log(`📊 Encontrados ${segmentsData?.length || 0} segmentos na tabela segments`);
        }
        
        // 2. Se não há segmentos, buscar da tabela partners
        if (!segmentsData || segmentsData.length === 0) {
            console.log('\n2️⃣ Buscando segmentos da tabela partners...');
            
            const { data: partnersData, error: partnersError } = await supabase
                .from('partners')
                .select('segment_id')
                .not('segment_id', 'is', null);
            
            if (partnersError) {
                console.error('❌ Erro ao buscar partners:', partnersError);
            } else {
                const segmentIds = [...new Set(partnersData.map(p => p.segment_id))];
                console.log(`📊 Encontrados ${segmentIds.length} segment_ids únicos na tabela partners`);
                
                // Mapear segmentos conhecidos
                const segmentosConhecidos = {
                    '68a2c101-4c01-4b1f-b5a2-18468df86b26': 'NAURU',
                    '791b380a-89dd-44e6-8982-bc204b47a024': 'ESCRITÓRIO JURÍDICO - AR&N',
                    'f5c2e105-4c05-4bbd-947a-575cf8877936': 'RDS IMOBILIÁRIO'
                };
                
                // Criar segmentos baseados nos IDs únicos encontrados
                const segments = segmentIds.map(id => ({
                    id: id,
                    name: segmentosConhecidos[id] || `Segmento ${id.substring(0, 8)}`,
                    description: `Segmento ${segmentosConhecidos[id] || id.substring(0, 8)}`,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }));
                
                console.log('\n📋 Segmentos disponíveis para o frontend:');
                segments.forEach((segment, index) => {
                    console.log(`   ${index + 1}. ${segment.name} (ID: ${segment.id})`);
                });
                
                return segments;
            }
        } else {
            console.log('\n📋 Segmentos da tabela segments:');
            segmentsData.forEach((segment, index) => {
                console.log(`   ${index + 1}. ${segment.name} (ID: ${segment.id})`);
            });
            return segmentsData;
        }
        
        console.log('\n🎉 Teste concluído!');
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

testarSegmentosDireto().catch(console.error);
