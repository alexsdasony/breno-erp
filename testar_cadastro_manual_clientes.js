#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://qerubjitetqwfqqydhzv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDU5NDUsImV4cCI6MjA2OTU4MTk0NX0.eP6QxQI1oerd5HxPxYpHF8mhKLK6bwnuIyw_aKFjuwU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testarCadastroManualClientes() {
    console.log('🧪 Testando cadastro manual de clientes...');
    
    try {
        // 1. Verificar se os segmentos existem
        console.log('\n1️⃣ Verificando segmentos disponíveis...');
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
            } else {
                console.log('⚠️  Nenhum segmento encontrado na tabela segments');
            }
        }
        
        // 2. Verificar segmentos na tabela partners
        console.log('\n2️⃣ Verificando segmentos na tabela partners...');
        const { data: partners, error: partnersError } = await supabase
            .from('partners')
            .select('segment_id')
            .not('segment_id', 'is', null)
            .limit(5);
        
        if (partnersError) {
            console.error('❌ Erro ao buscar partners:', partnersError);
        } else {
            const segmentIds = [...new Set(partners.map(p => p.segment_id))];
            console.log(`📊 Encontrados ${segmentIds.length} segment_ids únicos na tabela partners:`);
            segmentIds.forEach(id => {
                console.log(`   - ${id}`);
            });
        }
        
        // 3. Testar criação de um cliente manual
        console.log('\n3️⃣ Testando criação de cliente manual...');
        
        const clienteTeste = {
            name: 'CLIENTE TESTE MANUAL',
            tipo_pessoa: 'pf',
            tax_id: '123.456.789-00',
            email: 'teste@exemplo.com',
            phone: '(11) 99999-9999',
            address: 'Rua Teste, 123',
            city: 'São Paulo',
            state: 'SP',
            status: 'active',
            segment_id: 'f5c2e105-4c05-4bbd-947a-575cf8877936' // RDS IMOBILIÁRIO
        };
        
        console.log('📝 Dados do cliente teste:', clienteTeste);
        
        // Inserir o cliente na tabela partners
        const { data: newPartner, error: partnerError } = await supabase
            .from('partners')
            .insert([clienteTeste])
            .select()
            .single();
        
        if (partnerError) {
            console.error('❌ Erro ao criar partner:', partnerError);
        } else {
            console.log('✅ Partner criado com sucesso:', newPartner.id);
            
            // Adicionar role de customer
            const { error: roleError } = await supabase
                .from('partner_roles')
                .insert([{
                    partner_id: newPartner.id,
                    role: 'customer'
                }]);
            
            if (roleError) {
                console.error('❌ Erro ao adicionar role:', roleError);
            } else {
                console.log('✅ Role de customer adicionado com sucesso!');
            }
        }
        
        // 4. Verificar se o cliente foi criado corretamente
        console.log('\n4️⃣ Verificando cliente criado...');
        const { data: clienteCriado, error: clienteError } = await supabase
            .from('partners')
            .select(`
                *,
                partner_roles!inner(role)
            `)
            .eq('partner_roles.role', 'customer')
            .eq('name', 'CLIENTE TESTE MANUAL')
            .single();
        
        if (clienteError) {
            console.error('❌ Erro ao buscar cliente criado:', clienteError);
        } else {
            console.log('✅ Cliente encontrado:');
            console.log(`   - Nome: ${clienteCriado.name}`);
            console.log(`   - Segment ID: ${clienteCriado.segment_id}`);
            console.log(`   - Status: ${clienteCriado.status}`);
            console.log(`   - Email: ${clienteCriado.email}`);
            console.log(`   - Phone: ${clienteCriado.phone}`);
        }
        
        // 5. Limpar o cliente teste
        console.log('\n5️⃣ Limpando cliente teste...');
        if (newPartner) {
            const { error: deleteError } = await supabase
                .from('partners')
                .delete()
                .eq('id', newPartner.id);
            
            if (deleteError) {
                console.error('❌ Erro ao deletar cliente teste:', deleteError);
            } else {
                console.log('✅ Cliente teste removido com sucesso!');
            }
        }
        
        console.log('\n🎉 Teste de cadastro manual concluído!');
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

testarCadastroManualClientes().catch(console.error);
