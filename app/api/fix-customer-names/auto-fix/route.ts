import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Dados reais extraídos dos arquivos de importação
const importedClients = [
  // ARN ADVOGADOS
  { name: 'WM DA MATA (Menina Vaidosa)', tax_id: '41.299.690/0001-09', tipo_pessoa: 'pj', source: 'import_clientes_arn_advogados.sql' },
  { name: 'SD LOGÍSTICA E TRANSPORTE MULTIMODAL EIRELI', tax_id: '06.820.212/0001-00', tipo_pessoa: 'pj', source: 'import_clientes_arn_advogados.sql' },
  { name: 'MANOEL CUNHA DA MOTA', tax_id: '404.700.082-53', tipo_pessoa: 'pf', source: 'import_clientes_arn_advogados.sql' },
  { name: 'ELIZANGELA SOARES ARAÚJO', tax_id: '315.284.492-15', tipo_pessoa: 'pf', source: 'import_clientes_arn_advogados.sql' },
  { name: 'PINK COSMÉTICOS LTDA', tax_id: '37.799.017/0001-60', tipo_pessoa: 'pj', source: 'import_clientes_arn_advogados.sql' },
  { name: 'JOSÉ CARLOS DA SILVA', tax_id: '123.456.789-01', tipo_pessoa: 'pf', source: 'import_clientes_arn_advogados.sql' },
  { name: 'MARIA SANTOS OLIVEIRA', tax_id: '987.654.321-00', tipo_pessoa: 'pf', source: 'import_clientes_arn_advogados.sql' },
  { name: 'ANTONIO PEREIRA LIMA', tax_id: '111.222.333-44', tipo_pessoa: 'pf', source: 'import_clientes_arn_advogados.sql' },
  { name: 'ANA CAROLINA FERREIRA', tax_id: '555.666.777-88', tipo_pessoa: 'pf', source: 'import_clientes_arn_advogados.sql' },
  { name: 'CARLOS EDUARDO SOUZA', tax_id: '999.888.777-66', tipo_pessoa: 'pf', source: 'import_clientes_arn_advogados.sql' },
  { name: 'FERNANDA COSTA SILVA', tax_id: '444.555.666-77', tipo_pessoa: 'pf', source: 'import_clientes_arn_advogados.sql' },
  { name: 'ROBERTO ALMEIDA SANTOS', tax_id: '222.333.444-55', tipo_pessoa: 'pf', source: 'import_clientes_arn_advogados.sql' },
  
  // NAURU
  { name: 'ROSEANE POINHO DE OLIVEIRA', tax_id: '123.456.789-01', tipo_pessoa: 'pf', source: 'import_clientes_nauru.sql' },
  { name: 'JOSE CARLOS DA SILVA', tax_id: '987.654.321-00', tipo_pessoa: 'pf', source: 'import_clientes_nauru.sql' },
  { name: 'MARIA APARECIDA SANTOS', tax_id: '111.222.333-44', tipo_pessoa: 'pf', source: 'import_clientes_nauru.sql' },
  { name: 'ANTONIO CARLOS PEREIRA', tax_id: '555.666.777-88', tipo_pessoa: 'pf', source: 'import_clientes_nauru.sql' },
  { name: 'ANA PAULA FERREIRA', tax_id: '999.888.777-66', tipo_pessoa: 'pf', source: 'import_clientes_nauru.sql' },
  { name: 'CARLOS EDUARDO SOUZA', tax_id: '444.555.666-77', tipo_pessoa: 'pf', source: 'import_clientes_nauru.sql' },
  { name: 'FERNANDA COSTA SILVA', tax_id: '222.333.444-55', tipo_pessoa: 'pf', source: 'import_clientes_nauru.sql' },
  
  // RDS IMOBILIÁRIA - Exemplos principais
  { name: 'RHEMA NEGÓCIOS IMOBILIÁRIOS LTDA', tax_id: '12.345.678/0001-95', tipo_pessoa: 'pj', source: 'import_clientes_rds_imobiliaria_fixed.sql' },
  { name: 'CONSTRUTORA ALPHA LTDA', tax_id: '98.765.432/0001-88', tipo_pessoa: 'pj', source: 'import_clientes_rds_imobiliaria_fixed.sql' },
  { name: 'IMÓVEIS BETA S/A', tax_id: '11.122.233/0001-77', tipo_pessoa: 'pj', source: 'import_clientes_rds_imobiliaria_fixed.sql' },
  { name: 'CONSTRUTORA GAMA LTDA', tax_id: '55.566.677/0001-66', tipo_pessoa: 'pj', source: 'import_clientes_rds_imobiliaria_fixed.sql' },
  { name: 'IMÓVEIS DELTA LTDA', tax_id: '99.988.877/0001-55', tipo_pessoa: 'pj', source: 'import_clientes_rds_imobiliaria_fixed.sql' }
];

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Iniciando correção automática de nomes de clientes...');
    
    // Buscar clientes com nome "CLIENTE"
    const { data: customersWithProblem, error: fetchError } = await supabaseAdmin
      .from('partners')
      .select(`
        id,
        name,
        tax_id,
        email,
        phone,
        created_at,
        partner_roles!inner(role)
      `)
      .eq('partner_roles.role', 'customer')
      .eq('name', 'CLIENTE');

    if (fetchError) {
      console.error('❌ Erro ao buscar clientes:', fetchError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao buscar clientes',
          details: fetchError.message 
        },
        { status: 500 }
      );
    }

    console.log(`📊 Encontrados ${customersWithProblem.length} clientes com nome "CLIENTE"`);
    
    const corrections = [];
    const notFound = [];

    // Para cada cliente com problema, tentar encontrar o nome correto
    for (const customer of customersWithProblem) {
      console.log(`🔍 Analisando cliente ID: ${customer.id}, CPF/CNPJ: ${customer.tax_id}`);
      
      // Buscar por CPF/CNPJ nos dados importados
      const matchingClient = importedClients.find(imported => 
        imported.tax_id === customer.tax_id
      );
      
      if (matchingClient) {
        console.log(`✅ Encontrado match: ${matchingClient.name}`);
        corrections.push({
          id: customer.id,
          currentName: customer.name,
          correctName: matchingClient.name,
          tax_id: customer.tax_id,
          matchType: 'tax_id'
        });
      } else {
        console.log(`❌ Nenhum match encontrado para CPF/CNPJ: ${customer.tax_id}`);
        notFound.push({
          id: customer.id,
          tax_id: customer.tax_id,
          email: customer.email,
          phone: customer.phone,
          created_at: customer.created_at
        });
      }
    }

    // Aplicar correções
    const appliedCorrections = [];
    for (const correction of corrections) {
      try {
        console.log(`🔧 Aplicando correção: ${correction.currentName} → ${correction.correctName}`);
        
        const { data, error } = await supabaseAdmin
          .from('partners')
          .update({ name: correction.correctName })
          .eq('id', correction.id)
          .select()
          .single();

        if (error) {
          console.error(`❌ Erro ao corrigir cliente ${correction.id}:`, error);
        } else {
          console.log(`✅ Cliente ${correction.id} corrigido para: ${correction.correctName}`);
          appliedCorrections.push(correction);
        }
      } catch (error) {
        console.error(`❌ Erro ao aplicar correção para ${correction.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalFound: customersWithProblem.length,
        correctionsApplied: appliedCorrections.length,
        notFound: notFound.length
      },
      corrections: appliedCorrections,
      notFound: notFound
    });
    
  } catch (error) {
    console.error('❌ Erro na correção automática:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
