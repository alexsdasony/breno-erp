#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Configuração do Supabase
const supabaseUrl = 'https://qerubjitetqwfqqydhzv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDU5NDUsImV4cCI6MjA2OTU4MTk0NX0.eP6QxQI1oerd5HxPxYpHF8mhKLK6bwnuIyw_aKFjuwU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function importarLocatarios() {
    console.log('📁 Importando locatários como clientes...');
    
    const locatarios = [
        { name: 'JOSINEI NUNES DO NASCIMENTO', tax_id: '524.171.152-04', address: 'Travessa Alvorada, nº151, Apt. 01' },
        { name: 'VITÓRIA EMANUELLY RIBEIRO LEMOS', tax_id: '061.660.022-46', address: 'Travessa Alvorada, nº151, Apt. 02' },
        { name: 'ALBERTO TEIXEIRA DA SILVA JÚNIOR', tax_id: '033.772.392-35', address: 'Travessa Alvorada, nº151, Apt. 03' },
        { name: 'ANILTON MARQUES / LUZIETH FARIAS', tax_id: '123.456.789-00', address: 'Travessa Alvorada, nº151, Apt. 04' },
        { name: 'PATRICK JEHMERSON GOMES DE ALMEIDA', tax_id: '987.654.321-00', address: 'Travessa Alvorada, nº151, Apt. 05' },
        { name: 'LINDAELZA RAMOS', tax_id: '836.948.702-53', address: 'Travessa Alvorada, nº151, Apt. 06' },
        { name: 'JÉSSICA SILVA SANTOS', tax_id: '035.026.122-93', address: 'Travessa Alvorada, nº151, Apt. 07' },
        { name: 'LEUDIMARA TAUANA MACIEL', tax_id: '038.454.522-00', address: 'Travessa Alvorada, nº151, Apt. 08' },
        { name: 'FRANNY MARIANA GOMEZ CONDE', tax_id: '709.840.122-65', address: 'Travessa Alvorada, nº151, Apt. 09' },
        { name: 'MARCOS ADRIANO GAMA', tax_id: '040.603.712-16', address: 'Travessa Alvorada, nº151, Apt. 11' }
    ];
    
    for (const locatario of locatarios) {
        try {
            // Inserir na tabela partners
            const { data: partner, error: partnerError } = await supabase
                .from('partners')
                .insert({
                    name: locatario.name,
                    tipo_pessoa: 'pf',
                    tax_id: locatario.tax_id,
                    address: locatario.address,
                    city: 'Manaus',
                    state: 'AM',
                    status: 'active'
                })
                .select()
                .single();
            
            if (partnerError) {
                console.log(`⚠️  ${locatario.name}: ${partnerError.message}`);
            } else {
                // Adicionar role de customer
                await supabase
                    .from('partner_roles')
                    .insert({
                        partner_id: partner.id,
                        role: 'customer'
                    });
                
                // Atualizar segment_id
                await supabase
                    .from('partners')
                    .update({ segment_id: 'f5c2e105-4c05-4bbd-947a-575cf8877936' })
                    .eq('id', partner.id);
                
                console.log(`✅ ${locatario.name} importado com sucesso!`);
            }
        } catch (error) {
            console.log(`❌ Erro ao importar ${locatario.name}: ${error.message}`);
        }
    }
}

async function importarProprietarios() {
    console.log('📁 Importando proprietários como fornecedores...');
    
    const proprietarios = [
        { name: 'RHEMA NEGÓCIOS IMOBILIÁRIOS LTDA', tax_id: '55.518.933/0001-67', address: 'Rua Raul Brandão, nº17, Compensa' },
        { name: 'SPAZZIO GESTÃO E ADMINISTRAÇÃO LTDA', tax_id: '40.170.291/0001-80', address: 'Rua Ayres de Almeida, nº18, São Francisco' },
        { name: 'E.M RODRIGUES', tax_id: '44.005.614/0001-31', address: 'Rua Manjerioba, nº1, Jorge Teixeira' },
        { name: 'RDS PLACE NEGÓCIOS IMOBILIÁRIOS E ADMINISTRADORES LTDA', tax_id: '52.841.370/0001-55', address: 'Rua Salvador, nº440, Ed. Soberane, sala 610, 6º andar, Adrianópolis' },
        { name: 'CHARLES ALBERTE DE ALMEIDA SANTOS ME (ÓTICA OFICINA DOS ÓCULOS)', tax_id: '84.126.598/0001-50', address: 'Rua Rui Barbosa, nº122' },
        { name: 'CLÁUDIA TEIXEIRA BRASIL', tax_id: '572.881.432-87', address: 'Avenida Jacira Reis, nº 700, São Jorge' },
        { name: 'VERA LÚCIA FERREIRA QUEIROZ', tax_id: '043.488.852-49', address: 'Av. Joaquim Nabuco, nº2157, Centro' }
    ];
    
    for (const proprietario of proprietarios) {
        try {
            // Inserir na tabela partners
            const { data: partner, error: partnerError } = await supabase
                .from('partners')
                .insert({
                    name: proprietario.name,
                    tipo_pessoa: proprietario.tax_id.includes('/') ? 'pj' : 'pf',
                    tax_id: proprietario.tax_id,
                    address: proprietario.address,
                    city: 'Manaus',
                    state: 'AM',
                    status: 'active'
                })
                .select()
                .single();
            
            if (partnerError) {
                console.log(`⚠️  ${proprietario.name}: ${partnerError.message}`);
            } else {
                // Adicionar role de supplier
                await supabase
                    .from('partner_roles')
                    .insert({
                        partner_id: partner.id,
                        role: 'supplier'
                    });
                
                // Atualizar segment_id
                await supabase
                    .from('partners')
                    .update({ segment_id: 'f5c2e105-4c05-4bbd-947a-575cf8877936' })
                    .eq('id', partner.id);
                
                console.log(`✅ ${proprietario.name} importado com sucesso!`);
            }
        } catch (error) {
            console.log(`❌ Erro ao importar ${proprietario.name}: ${error.message}`);
        }
    }
}

async function main() {
    console.log('🚀 Iniciando importação automática da RDS IMOBILIÁRIA...');
    
    await importarLocatarios();
    await importarProprietarios();
    
    console.log('\n🎉 Importação automática concluída!');
    console.log('📊 Resumo:');
    console.log('   • Locatários → clientes');
    console.log('   • Proprietários → fornecedores');
    console.log('   • Segmento: RDS IMOBILIÁRIO');
}

main().catch(console.error);
