#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://qerubjitetqwfqqydhzv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDU5NDUsImV4cCI6MjA2OTU4MTk0NX0.eP6QxQI1oerd5HxPxYpHF8mhKLK6bwnuIyw_aKFjuwU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarSegmentosFrontend() {
    console.log('🔍 Verificando segmentos para o frontend...');
    
    try {
        // 1. Verificar segmentos na tabela segments
        console.log('\n1️⃣ Verificando tabela segments...');
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
        
        // 2. Verificar segmentos únicos na tabela partners
        console.log('\n2️⃣ Verificando segmentos únicos na tabela partners...');
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
        
        // 3. Criar segmentos se não existirem
        if (!segments || segments.length === 0) {
            console.log('\n3️⃣ Criando segmentos necessários...');
            
            const segmentosParaCriar = [
                { id: '68a2c101-4c01-4b1f-b5a2-18468df86b26', name: 'NAURU', description: 'Segmento NAURU' },
                { id: '791b380a-89dd-44e6-8982-bc204b47a024', name: 'ESCRITÓRIO JURÍDICO - AR&N', description: 'Escritório Jurídico AR&N' },
                { id: 'f5c2e105-4c05-4bbd-947a-575cf8877936', name: 'RDS IMOBILIÁRIO', description: 'RDS Imobiliário' }
            ];
            
            for (const segmento of segmentosParaCriar) {
                console.log(`🔄 Tentando criar segmento: ${segmento.name}`);
                
                try {
                    // Tentar inserir o segmento
                    const { data: newSegment, error: insertError } = await supabase
                        .from('segments')
                        .insert([{
                            id: segmento.id,
                            name: segmento.name,
                            description: segmento.description,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        }])
                        .select()
                        .single();
                    
                    if (insertError) {
                        if (insertError.code === '23505') {
                            console.log(`⚠️  Segmento ${segmento.name} já existe (duplicate key)`);
                        } else {
                            console.error(`❌ Erro ao criar segmento ${segmento.name}:`, insertError);
                        }
                    } else {
                        console.log(`✅ Segmento ${segmento.name} criado com sucesso!`);
                    }
                } catch (error) {
                    console.error(`❌ Erro ao criar segmento ${segmento.name}:`, error);
                }
            }
        }
        
        // 4. Verificar resultado final
        console.log('\n4️⃣ Verificando resultado final...');
        const { data: segmentsFinal, error: segmentsFinalError } = await supabase
            .from('segments')
            .select('*');
        
        if (segmentsFinalError) {
            console.error('❌ Erro ao verificar segmentos finais:', segmentsFinalError);
        } else {
            console.log(`📊 Total de segmentos: ${segmentsFinal?.length || 0}`);
            if (segmentsFinal && segmentsFinal.length > 0) {
                console.log('\n📋 Segmentos disponíveis para o frontend:');
                segmentsFinal.forEach(segment => {
                    console.log(`   - ${segment.name} (ID: ${segment.id})`);
                });
            }
        }
        
        console.log('\n🎉 Verificação concluída!');
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

verificarSegmentosFrontend().catch(console.error);
