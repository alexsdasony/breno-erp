#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://qerubjitetqwfqqydhzv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDU5NDUsImV4cCI6MjA2OTU4MTk0NX0.eP6QxQI1oerd5HxPxYpHF8mhKLK6bwnuIyw_aKFjuwU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function criarSegmentosFaltantes() {
    console.log('🏷️  Criando segmentos faltantes...');
    
    try {
        // IDs dos segmentos que já existem na tabela partners
        const segmentosExistentes = [
            { id: '68a2c101-4c01-4b1f-b5a2-18468df86b26', name: 'NAURU', description: 'Segmento NAURU' },
            { id: '791b380a-89dd-44e6-8982-bc204b47a024', name: 'ESCRITÓRIO JURÍDICO - AR&N', description: 'Escritório Jurídico AR&N' },
            { id: 'f5c2e105-4c05-4bbd-947a-575cf8877936', name: 'RDS IMOBILIÁRIO', description: 'RDS Imobiliário' }
        ];
        
        console.log(`📊 Tentando criar ${segmentosExistentes.length} segmentos...`);
        
        for (const segmento of segmentosExistentes) {
            console.log(`🔄 Criando segmento: ${segmento.name} (ID: ${segmento.id})`);
            
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
        
        // Verificar se os segmentos foram criados
        console.log('\n🔍 Verificando segmentos criados...');
        const { data: segments, error: segmentsError } = await supabase
            .from('segments')
            .select('*');
        
        if (segmentsError) {
            console.error('❌ Erro ao verificar segmentos:', segmentsError);
        } else {
            console.log(`📊 Encontrados ${segments?.length || 0} segmentos na tabela segments`);
            if (segments && segments.length > 0) {
                segments.forEach(segment => {
                    console.log(`   - ${segment.name} (ID: ${segment.id})`);
                });
            }
        }
        
        console.log('\n🎉 Criação de segmentos concluída!');
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

criarSegmentosFaltantes().catch(console.error);
