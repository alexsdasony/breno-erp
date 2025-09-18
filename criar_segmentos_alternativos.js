#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://qerubjitetqwfqqydhzv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDU5NDUsImV4cCI6MjA2OTU4MTk0NX0.eP6QxQI1oerd5HxPxYpHF8mhKLK6bwnuIyw_aKFjuwU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function criarSegmentosAlternativos() {
    console.log('🔧 Criando segmentos alternativos...');
    
    try {
        // 1. Verificar segmentos existentes na tabela partners
        console.log('\n1️⃣ Verificando segmentos existentes...');
        const { data: partners, error: partnersError } = await supabase
            .from('partners')
            .select('segment_id')
            .not('segment_id', 'is', null);
        
        if (partnersError) {
            console.error('❌ Erro ao buscar partners:', partnersError);
            return;
        }
        
        const segmentIds = [...new Set(partners.map(p => p.segment_id))];
        console.log(`📊 Encontrados ${segmentIds.length} segment_ids únicos:`);
        segmentIds.forEach(id => {
            console.log(`   - ${id}`);
        });
        
        // 2. Mapear segmentos conhecidos
        const segmentosConhecidos = {
            '68a2c101-4c01-4b1f-b5a2-18468df86b26': 'NAURU',
            '791b380a-89dd-44e6-8982-bc204b47a024': 'ESCRITÓRIO JURÍDICO - AR&N',
            'f5c2e105-4c05-4bbd-947a-575cf8877936': 'RDS IMOBILIÁRIO'
        };
        
        // 3. Tentar inserir segmentos usando diferentes abordagens
        console.log('\n2️⃣ Tentando criar segmentos...');
        
        for (const [id, name] of Object.entries(segmentosConhecidos)) {
            console.log(`🔄 Criando segmento: ${name} (ID: ${id})`);
            
            try {
                // Tentar inserir sem especificar ID (deixar o banco gerar)
                const { data: newSegment, error: insertError } = await supabase
                    .from('segments')
                    .insert([{
                        name: name,
                        description: `Segmento ${name}`,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }])
                    .select()
                    .single();
                
                if (insertError) {
                    if (insertError.code === '23505') {
                        console.log(`⚠️  Segmento ${name} já existe (duplicate key)`);
                    } else {
                        console.error(`❌ Erro ao criar segmento ${name}:`, insertError);
                    }
                } else {
                    console.log(`✅ Segmento ${name} criado com sucesso! (ID: ${newSegment.id})`);
                }
            } catch (error) {
                console.error(`❌ Erro ao criar segmento ${name}:`, error);
            }
        }
        
        // 4. Verificar resultado final
        console.log('\n3️⃣ Verificando resultado final...');
        const { data: segmentsFinal, error: segmentsFinalError } = await supabase
            .from('segments')
            .select('*');
        
        if (segmentsFinalError) {
            console.error('❌ Erro ao verificar segmentos finais:', segmentsFinalError);
        } else {
            console.log(`📊 Total de segmentos: ${segmentsFinal?.length || 0}`);
            if (segmentsFinal && segmentsFinal.length > 0) {
                console.log('\n📋 Segmentos disponíveis:');
                segmentsFinal.forEach(segment => {
                    console.log(`   - ${segment.name} (ID: ${segment.id})`);
                });
            }
        }
        
        console.log('\n🎉 Processo concluído!');
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

criarSegmentosAlternativos().catch(console.error);
