#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://qerubjitetqwfqqydhzv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDU5NDUsImV4cCI6MjA2OTU4MTk0NX0.eP6QxQI1oerd5HxPxYpHF8mhKLK6bwnuIyw_aKFjuwU';

const supabase = createClient(supabaseUrl, supabaseKey);

// Mapeamento dos clientes com nomes corretos baseado nos tax_ids
const clientesCorretos = {
    '85380385249': 'RICARDO CAMINHA MONTENEGRO',
    '00513643281': 'MARIA DO PERPETUO SOCORRO SOUZA PANTOJA',
    '79354996282': 'JULIANE NUNES MONTEIRO',
    '04678716203': 'LEONARDO DA SILVA LEITÃO',
    '67577458287': 'LUCIENE DOS SANTOS OLIVEIRA CASTRO',
    '65656598268': 'ALCIENE GENTIL DA SILVA',
    '40745163220': 'RAIMUNDO NONATO PEIXOTO',
    '70950285242': 'CARLOS ALDEMAR ROMERO ALGUACA',
    '01811248233': 'EDIVILSON SOUZA NETO',
    '64278760230': 'MARCIA REGINA PACHECO OLIVEIRA',
    '02177458226': 'EDUARDO CORRÊA DE SENA CAJADO',
    '93400349291': 'FABIANO LIMA DA SILVEIRA',
    '20711259000158': 'ZEUS CONSULTORIA EM GESTÃO EMPRESARIAL',
    '48999863000140': 'GESTCONT CONSULTORIA E GERENCIAL MENTO CONTÁBIL',
    '27986353000169': 'ATTACKMED COMÉRCIO DE MAT.',
    '06046143000110': 'JH CONSTRUÇÃO LTDA',
    '37852636000171': 'NELSA DA SILVA RIBEIRO',
    '38492533000100': 'AMAZONVIDA ATIVIDADES MÉDICAS E AMBULATORIAL LTDA'
};

async function corrigirNomesClientes() {
    console.log('🔧 Corrigindo nomes dos clientes...');
    
    try {
        // Buscar clientes com nome "Cliente"
        const { data: customers, error } = await supabase
            .from('partners')
            .select(`
                *,
                partner_roles!inner(role)
            `)
            .eq('partner_roles.role', 'customer')
            .eq('name', 'Cliente');
        
        if (error) {
            console.error('❌ Erro ao buscar clientes:', error);
            return;
        }
        
        console.log(`📊 Encontrados ${customers?.length || 0} clientes para corrigir`);
        
        if (customers && customers.length > 0) {
            for (const customer of customers) {
                const nomeCorreto = clientesCorretos[customer.tax_id];
                
                if (nomeCorreto) {
                    console.log(`🔄 Corrigindo: ${customer.tax_id} → ${nomeCorreto}`);
                    
                    // Atualizar o nome do cliente
                    const { error: updateError } = await supabase
                        .from('partners')
                        .update({ name: nomeCorreto })
                        .eq('id', customer.id);
                    
                    if (updateError) {
                        console.error(`❌ Erro ao atualizar ${customer.tax_id}:`, updateError);
                    } else {
                        console.log(`✅ ${nomeCorreto} atualizado com sucesso!`);
                    }
                } else {
                    console.log(`⚠️  Nome não encontrado para tax_id: ${customer.tax_id}`);
                }
            }
        }
        
        // Verificar se há segmentos
        console.log('\n🏷️  Verificando segmentos...');
        const { data: segments, error: segmentsError } = await supabase
            .from('segments')
            .select('*');
        
        if (segmentsError) {
            console.error('❌ Erro ao buscar segmentos:', segmentsError);
        } else {
            console.log(`📊 Encontrados ${segments?.length || 0} segmentos`);
            
            if (!segments || segments.length === 0) {
                console.log('🔧 Criando segmentos necessários...');
                
                // Criar segmentos
                const segmentosParaCriar = [
                    { name: 'NAURU', description: 'Segmento NAURU' },
                    { name: 'ESCRITÓRIO JURÍDICO - AR&N', description: 'Escritório Jurídico AR&N' },
                    { name: 'RDS IMOBILIÁRIO', description: 'RDS Imobiliário' }
                ];
                
                for (const segmento of segmentosParaCriar) {
                    const { data: newSegment, error: createError } = await supabase
                        .from('segments')
                        .insert([segmento])
                        .select()
                        .single();
                    
                    if (createError) {
                        console.error(`❌ Erro ao criar segmento ${segmento.name}:`, createError);
                    } else {
                        console.log(`✅ Segmento ${segmento.name} criado com sucesso! (ID: ${newSegment.id})`);
                    }
                }
            }
        }
        
        console.log('\n🎉 Correção concluída!');
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

corrigirNomesClientes().catch(console.error);
