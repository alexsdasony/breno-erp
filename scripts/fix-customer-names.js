import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixCustomerNames() {
  try {
    console.log('🔍 Buscando clientes com nome "CLIENTE"...');
    
    // Buscar clientes com nome "CLIENTE"
    const { data: customers, error } = await supabase
      .from('partners')
      .select(`
        id,
        name,
        email,
        phone,
        tax_id,
        created_at,
        partner_roles!inner(role)
      `)
      .eq('partner_roles.role', 'customer')
      .eq('name', 'CLIENTE');

    if (error) {
      console.error('❌ Erro ao buscar clientes:', error);
      return;
    }

    console.log(`📊 Encontrados ${customers.length} clientes com nome "CLIENTE"`);
    
    if (customers.length === 0) {
      console.log('✅ Nenhum cliente com nome "CLIENTE" encontrado');
      return;
    }

    // Mostrar informações dos clientes
    customers.forEach((customer, index) => {
      console.log(`\n${index + 1}. Cliente ID: ${customer.id}`);
      console.log(`   Nome atual: ${customer.name}`);
      console.log(`   Email: ${customer.email || 'N/A'}`);
      console.log(`   Telefone: ${customer.phone || 'N/A'}`);
      console.log(`   CPF/CNPJ: ${customer.tax_id || 'N/A'}`);
      console.log(`   Criado em: ${customer.created_at}`);
    });

    console.log('\n🔧 Para corrigir os nomes, você pode:');
    console.log('1. Editar manualmente cada cliente no sistema');
    console.log('2. Usar os dados de email/telefone para identificar o nome correto');
    console.log('3. Verificar registros de vendas associadas para identificar o cliente');

    // Sugestões de nomes baseados em email
    console.log('\n💡 Sugestões de nomes baseados em email:');
    customers.forEach((customer, index) => {
      if (customer.email) {
        const emailName = customer.email.split('@')[0];
        const suggestedName = emailName
          .replace(/[._-]/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        
        console.log(`${index + 1}. ${customer.email} → "${suggestedName}"`);
      }
    });

  } catch (error) {
    console.error('❌ Erro no script:', error);
  }
}

// Executar o script
fixCustomerNames();
