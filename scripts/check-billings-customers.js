import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkBillingsCustomers() {
  try {
    // Buscar todas as cobranças ativas
    const { data: billings, error: billingsError } = await supabase
      .from('billings')
      .select('id, customer_id, customer_name')
      .eq('is_deleted', false);

    if (billingsError) {
      console.error('❌ Erro ao buscar cobranças:', billingsError);
      return;
    }

    console.log(`📊 Total de cobranças: ${billings?.length || 0}\n`);

    if (!billings || billings.length === 0) {
      console.log('✅ Nenhuma cobrança encontrada');
      return;
    }

    // Buscar todos os clientes cadastrados
    const { data: customers, error: customersError } = await supabase
      .from('partners')
      .select('id, name')
      .eq('is_deleted', false);

    if (customersError) {
      console.error('❌ Erro ao buscar clientes:', customersError);
      return;
    }

    const customerIds = new Set(customers?.map(c => c.id) || []);

    // Verificar quais cobranças têm clientes cadastrados
    let cadastrados = 0;
    let naoCadastrados = 0;

    console.log('📋 Análise das cobranças:\n');

    billings.forEach((billing, index) => {
      const isRegistered = billing.customer_id && customerIds.has(billing.customer_id);
      if (isRegistered) {
        cadastrados++;
        console.log(`✅ ${index + 1}. ${billing.customer_name || 'N/A'} - CADASTRADO`);
      } else {
        naoCadastrados++;
        console.log(`❌ ${index + 1}. ${billing.customer_name || 'N/A'} - NÃO CADASTRADO (ID: ${billing.customer_id || 'N/A'})`);
      }
    });

    console.log('\n📊 Resultado:');
    console.log(`   ✅ Cobranças com clientes cadastrados: ${cadastrados}`);
    console.log(`   ❌ Cobranças com clientes NÃO cadastrados: ${naoCadastrados}`);

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

checkBillingsCustomers()
  .then(() => {
    console.log('\n✅ Verificação concluída');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Erro:', error);
    process.exit(1);
  });





