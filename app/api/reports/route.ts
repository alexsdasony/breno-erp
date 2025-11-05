import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    console.log('\n🚀 ============================================');
    console.log('🚀 INICIANDO API Route GET /api/reports');
    console.log('🚀 ============================================');
    
    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get('module');
    const reportId = searchParams.get('report');
    const format = searchParams.get('format') || 'json';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const segmentId = searchParams.get('segment_id');
    
    console.log('📝 Parâmetros recebidos:', { moduleId, reportId, format, startDate, endDate, segmentId });
    
    if (!moduleId || !reportId) {
      return NextResponse.json(
        { error: 'Módulo e relatório são obrigatórios' },
        { status: 400 }
      );
    }

    let data = null;
    
    // Preparar parâmetros com segment_id
    const params = { startDate, endDate, segmentId };
    
    // Gerar dados baseado no tipo de relatório
    console.log('🎯 Gerando relatório:', { moduleId, reportId });
    switch (moduleId) {
      case 'dashboard':
        data = await generateDashboardReport(reportId, params);
        break;
      case 'financial':
        data = await generateFinancialReport(reportId, params);
        break;
      case 'accounts-payable':
        console.log('💳 Chamando generateAccountsPayableReport...');
        data = await generateAccountsPayableReport(reportId, params);
        console.log('💳 Resultado de generateAccountsPayableReport:', data ? '✅ Dados retornados' : '❌ Sem dados');
        break;
      case 'billing':
        data = await generateBillingReport(reportId, params);
        break;
      case 'inventory':
        data = await generateInventoryReport(reportId, params);
        break;
      case 'sales':
        data = await generateSalesReport(reportId, params);
        break;
      case 'customers':
        console.log('🎯 Chamando generateCustomersReport para reportId:', reportId);
        data = await generateCustomersReport(reportId, params);
        break;
      case 'suppliers':
        data = await generateSuppliersReport(reportId, params);
        break;
      case 'nfe':
        data = await generateNfeReport(reportId, params);
        break;
      default:
        return NextResponse.json(
          { error: 'Módulo não encontrado' },
          { status: 404 }
        );
    }

    if (format === 'pdf') {
      // Implementar geração de PDF
      return NextResponse.json({
        success: true,
        message: 'PDF será implementado em breve',
        data: data
      });
    } else if (format === 'excel') {
      // Implementar geração de Excel
      return NextResponse.json({
        success: true,
        message: 'Excel será implementado em breve',
        data: data
      });
    } else {
      return NextResponse.json({
        success: true,
        data: data
      });
    }
    
  } catch (error) {
    console.error('❌ Erro na API de relatórios:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Funções para gerar relatórios específicos
async function generateDashboardReport(reportId: string, params: any) {
  switch (reportId) {
    case 'kpi-overview':
      return await getKpiOverviewData(params);
    case 'executive-summary':
      return await getExecutiveSummaryData(params);
    default:
      throw new Error('Relatório de dashboard não encontrado');
  }
}

async function generateFinancialReport(reportId: string, params: any) {
  switch (reportId) {
    case 'cash-flow':
      return await getCashFlowData(params);
    case 'profit-loss':
      return await getProfitLossData(params);
    case 'balance-sheet':
      return await getBalanceSheetData(params);
    case 'financial-analysis':
      return await getFinancialAnalysisData(params);
    default:
      throw new Error('Relatório financeiro não encontrado');
  }
}

async function generateCustomersReport(reportId: string, params: any) {
  switch (reportId) {
    case 'customer-list':
      return await getCustomerListData(params);
    case 'customer-segmentation':
      console.log('🎯 Chamando getCustomerSegmentationData com params:', params);
      return await getCustomerSegmentationData(params);
    case 'customer-lifetime-value':
      return await getCustomerLifetimeValueData(params);
    default:
      throw new Error('Relatório de clientes não encontrado');
  }
}

async function generateSuppliersReport(reportId: string, params: any) {
  switch (reportId) {
    case 'supplier-list':
      return await getSupplierListData(params);
    case 'supplier-performance':
      return await getSupplierPerformanceData(params);
    case 'purchase-analysis':
      return await getPurchaseAnalysisData(params);
    default:
      throw new Error('Relatório de fornecedores não encontrado');
  }
}

async function generateSalesReport(reportId: string, params: any) {
  switch (reportId) {
    case 'sales-performance':
      return await getSalesPerformanceData(params);
    case 'top-products':
      return await getTopProductsData(params);
    case 'sales-forecast':
      return await getSalesForecastData(params);
    case 'customer-analysis':
      return await getCustomerListData(params);
    default:
      throw new Error('Relatório de vendas não encontrado');
  }
}

async function generateProductsReport(reportId: string, params: any) {
  switch (reportId) {
    case 'product-list':
      return await getProductListData(params);
    case 'inventory-analysis':
      return await getInventoryAnalysisData(params);
    default:
      throw new Error('Relatório de produtos não encontrado');
  }
}

async function generateAccountsPayableReport(reportId: string, params: any) {
  console.log('💳 generateAccountsPayableReport chamado:', { reportId, params });
  switch (reportId) {
    case 'payables-aging':
      console.log('💳 Chamando getPayablesAgingData...');
      const result = await getPayablesAgingData(params);
      console.log('💳 Resultado de getPayablesAgingData:', {
        title: result.title,
        dataKeys: Object.keys(result.data || {}),
        total: result.data?.total || 0
      });
      return result;
    case 'supplier-payments':
      return await getSupplierPaymentsData(params);
    case 'overdue-bills':
      return await getOverdueBillsData(params);
    default:
      throw new Error('Relatório de contas a pagar não encontrado');
  }
}

async function generateBillingReport(reportId: string, params: any) {
  switch (reportId) {
    case 'receivables-aging':
      return await getReceivablesAgingData(params);
    case 'collection-efficiency':
      return await getCollectionEfficiencyData(params);
    case 'customer-receivables':
      return await getCustomerReceivablesData(params);
    default:
      throw new Error('Relatório de cobranças não encontrado');
  }
}

async function generateInventoryReport(reportId: string, params: any) {
  switch (reportId) {
    case 'stock-levels':
      return await getStockLevelsData(params);
    case 'stock-movement':
      return await getStockMovementData(params);
    case 'abc-analysis':
      return await getAbcAnalysisData(params);
    case 'low-stock-alert':
      return await getLowStockAlertData(params);
    default:
      throw new Error('Relatório de estoque não encontrado');
  }
}

async function generateAccountsReceivableReport(reportId: string, params: any) {
  switch (reportId) {
    case 'receivable-list':
      return await getAccountsReceivableData(params);
    case 'receivable-analysis':
      return await getAccountsReceivableAnalysisData(params);
    default:
      throw new Error('Relatório de contas a receber não encontrado');
  }
}

async function generateNfeReport(reportId: string, params: any) {
  switch (reportId) {
    case 'nfe-issued':
      return await getNfeIssuedData(params);
    case 'tax-summary':
      return await getTaxSummaryData(params);
    case 'nfe-status':
      return await getNfeStatusData(params);
    default:
      throw new Error('Relatório de NFe não encontrado');
  }
}

// Função helper para aplicar filtro de segmento
// Se segmentId for fornecido, busca apenas aquele segmento
// Se não for fornecido, busca todos (incluindo NULL)
function applySegmentFilter(query: any, segmentId: string | null | undefined) {
  // Não aplicar log aqui para evitar muito output, mas manter a lógica
  if (segmentId && segmentId !== 'null' && segmentId !== '0') {
    // Quando há filtro de segmento: buscar apenas documentos daquele segmento OU NULL (para compatibilidade)
    // Isso permite que registros gerais (sem segmento) também apareçam quando filtrado
    return query.or(`segment_id.eq.${segmentId},segment_id.is.null`);
  }
  
  // Se não há filtro: buscar todos (incluindo NULL)
  return query;
}

// Implementações das funções de dados

// === RELATÓRIOS DE CLIENTES ===
async function getCustomerListData(params: any) {
  try {
    let query = supabaseAdmin
      .from('partners')
      .select(`
        id,
        name,
        email,
        phone,
        tax_id,
        status,
        created_at,
        city,
        state,
        partner_roles!inner(role)
      `)
      .eq('partner_roles.role', 'customer')
      .eq('is_deleted', false);
    
    query = applySegmentFilter(query, params.segmentId);
    
    const { data: customers, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar clientes:', error);
      throw error;
    }

    // Filtrar por período se necessário
    let filteredCustomers = customers || [];
    if (params.startDate && params.endDate) {
      filteredCustomers = customers?.filter(customer => {
        const customerDate = new Date(customer.created_at);
        const startDate = new Date(params.startDate);
        const endDate = new Date(params.endDate);
        return customerDate >= startDate && customerDate <= endDate;
      }) || [];
    }

    const activeCustomers = filteredCustomers.filter(c => c.status === 'active' || c.status === 'ativo').length;
    const inactiveCustomers = filteredCustomers.filter(c => c.status === 'inactive' || c.status === 'inativo').length;

    console.log('👥 Clientes encontrados:', filteredCustomers.length);
    console.log('👥 Clientes ativos:', activeCustomers);
    console.log('👥 Clientes inativos:', inactiveCustomers);

    return {
      title: 'Lista de Clientes',
      period: `${params.startDate} a ${params.endDate}`,
      data: {
        customers: filteredCustomers,
        totalCustomers: filteredCustomers.length,
        activeCustomers,
        inactiveCustomers
      }
    };
  } catch (error) {
    console.error('Erro na lista de clientes:', error);
    return {
      title: 'Lista de Clientes',
      period: `${params.startDate} a ${params.endDate}`,
      data: {
        customers: [],
        totalCustomers: 0,
        activeCustomers: 0,
        inactiveCustomers: 0
      }
    };
  }
}

async function getCustomerSegmentationData(params: any) {
  try {
    // Buscar todos os clientes da tabela partners com type = 'customer'
    let query = supabaseAdmin
      .from('partners')
      .select('id, name, status, created_at, segment_id, partner_roles!inner(role)')
      .eq('partner_roles.role', 'customer')
      .eq('is_deleted', false);
    
    query = applySegmentFilter(query, params.segmentId);
    
    const { data: customers, error: customersError } = await query;

    if (customersError) {
      return {
        title: 'Segmentação de Clientes',
        period: `${params.startDate} a ${params.endDate}`,
        data: {
          segments: [],
          totalCustomers: 0,
          totalSegments: 0,
          error: 'Erro ao buscar clientes'
        }
      };
    }

    // Se não há clientes, retornar dados vazios
    if (!customers || customers.length === 0) {
      return {
        title: 'Segmentação de Clientes',
        period: `${params.startDate} a ${params.endDate}`,
        data: {
          segments: [],
          totalCustomers: 0,
          totalSegments: 0,
          error: 'Nenhum cliente encontrado'
        }
      };
    }

    // Buscar todos os segmentos disponíveis
    console.log('📊 Buscando segmentos da tabela segments...');
    const { data: segmentsData, error: segmentsError } = await supabaseAdmin
      .from('segments')
      .select('id, name');
    
    console.log('📊 Resultado da busca de segmentos:');
    console.log('- Segmentos encontrados:', segmentsData?.length || 0);
    console.log('- Erro:', segmentsError);
    console.log('- Primeiros segmentos:', segmentsData?.slice(0, 3));

    if (segmentsError) {
      // Continuar mesmo com erro nos segmentos
    }

    // Criar segmentos básicos baseados nos clientes
    const segments = [];
    let withoutSegment = 0;
    let withSegment = 0;

    customers.forEach(customer => {
      if (customer.segment_id && segmentsData) {
        const segment = segmentsData.find(s => s.id === customer.segment_id);
        if (segment) {
          withSegment++;
        } else {
          withoutSegment++;
        }
      } else {
        withoutSegment++;
      }
    });

    // Adicionar segmento "Sem Segmento" se houver clientes sem segmento
    if (withoutSegment > 0) {
      segments.push({
        id: 'sem-segmento',
        name: 'Sem Segmento',
        count: withoutSegment,
        activeCount: withoutSegment
      });
    }

    // Adicionar segmentos reais se existirem
    if (segmentsData && segmentsData.length > 0) {
      segmentsData.forEach(segment => {
        const segmentCustomers = customers.filter(c => c.segment_id === segment.id);
        if (segmentCustomers.length > 0) {
          segments.push({
            id: segment.id,
            name: segment.name,
            count: segmentCustomers.length,
            activeCount: segmentCustomers.filter(c => c.status === 'active' || c.status === 'ativo').length
          });
        }
      });
    }

    console.log('📊 Resultado final:', {
      segments: segments.length,
      totalCustomers: customers.length,
      totalSegments: segments.length
    });

    return {
      title: 'Segmentação de Clientes',
      period: `${params.startDate} a ${params.endDate}`,
      data: {
        segments,
        totalCustomers: customers.length,
        totalSegments: segments.length
      }
    };
  } catch (error) {
    console.error('Erro na segmentação de clientes:', error);
    return {
      title: 'Segmentação de Clientes',
      period: `${params.startDate} a ${params.endDate}`,
      data: {
        segments: [],
        totalCustomers: 0,
        totalSegments: 0
      }
    };
  }
}

async function getCustomerLifetimeValueData(params: any) {
  try {
    let customersQuery = supabaseAdmin
      .from('partners')
      .select('id, name, created_at, status, partner_roles!inner(role)')
      .eq('partner_roles.role', 'customer')
      .eq('is_deleted', false);
    
    customersQuery = applySegmentFilter(customersQuery, params.segmentId);
    
    const { data: customers, error: customersError } = await customersQuery;

    if (customersError) {
      console.error('❌ Erro ao buscar clientes:', customersError);
      throw customersError;
    }

    // Buscar vendas para calcular LTV
    let salesQuery = supabaseAdmin
      .from('sales')
      .select('customer_id, total, date, status')
      .in('status', ['Concluída', 'completed']);
    salesQuery = applySegmentFilter(salesQuery, params.segmentId);
    const { data: sales, error: salesError } = await salesQuery;

    if (salesError) {
      console.error('❌ Erro ao buscar vendas:', salesError);
    }

    const customerLtvData = customers?.map(customer => {
      const customerSales = sales?.filter(sale => sale.customer_id === customer.id) || [];
      const totalRevenue = customerSales.reduce((sum, sale) => sum + (parseFloat(sale.total) || 0), 0);
      const totalOrders = customerSales.length;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      // Calcular tempo de vida (em meses)
      const firstSale = customerSales.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
      const lastSale = customerSales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      
      let lifetimeMonths = 1;
      if (firstSale && lastSale && firstSale !== lastSale) {
        const diffTime = new Date(lastSale.date).getTime() - new Date(firstSale.date).getTime();
        lifetimeMonths = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24 * 30)));
      }

      const ltv = totalRevenue; // LTV simples baseado na receita total

      return {
        id: customer.id,
        name: customer.name,
        totalRevenue,
        totalOrders,
        avgOrderValue,
        lifetimeMonths,
        ltv
      };
    }) || [];

    const averageLtv = customerLtvData.length > 0 ? 
      customerLtvData.reduce((sum, c) => sum + c.ltv, 0) / customerLtvData.length : 0;
    
    const maxLtv = customerLtvData.length > 0 ? 
      Math.max(...customerLtvData.map(c => c.ltv)) : 0;

    console.log('💰 LTV calculado para:', customerLtvData.length, 'clientes');

    return {
      title: 'Lifetime Value de Clientes',
      period: `${params.startDate} a ${params.endDate}`,
      data: {
        customers: customerLtvData,
        averageLtv,
        maxLtv,
        totalCustomers: customerLtvData.length,
        averageLifetime: customerLtvData.length > 0 ? 
          customerLtvData.reduce((sum, c) => sum + c.lifetimeMonths, 0) / customerLtvData.length : 0
      }
    };
  } catch (error) {
    console.error('Erro no LTV de clientes:', error);
    return {
      title: 'Lifetime Value de Clientes',
      period: `${params.startDate} a ${params.endDate}`,
      data: {
        customers: [],
        averageLtv: 0,
        maxLtv: 0,
        totalCustomers: 0,
        averageLifetime: 0
      }
    };
  }
}

// === RELATÓRIOS DE FORNECEDORES ===
async function getSupplierListData(params: any) {
  try {
    let query = supabaseAdmin
      .from('partners')
      .select(`
        id,
        name,
        email,
        phone,
        tax_id,
        status,
        created_at,
        city,
        state,
        ramo_atividade,
        partner_roles!inner(role)
      `)
      .eq('partner_roles.role', 'supplier')
      .eq('is_deleted', false);
    
    query = applySegmentFilter(query, params.segmentId);
    
    const { data: suppliers, error } = await query
      .order('created_at', { ascending: false });
    
    // Filtrar por data no código se necessário
    let filteredSuppliers = suppliers || [];
    if (params.startDate && params.endDate) {
      filteredSuppliers = suppliers?.filter(supplier => {
        const supplierDate = new Date(supplier.created_at);
        const startDate = new Date(params.startDate);
        const endDate = new Date(params.endDate);
        return supplierDate >= startDate && supplierDate <= endDate;
      }) || [];
    }

    if (error) {
      console.error('❌ Erro ao buscar fornecedores:', error);
      throw error;
    }

    console.log('🏭 Fornecedores encontrados:', filteredSuppliers.length);

    return {
      title: 'Lista de Fornecedores',
      period: `${params.startDate} a ${params.endDate}`,
      data: {
        suppliers: filteredSuppliers,
        totalSuppliers: filteredSuppliers.length,
        activeSuppliers: filteredSuppliers.filter(s => s.status === 'active').length,
        inactiveSuppliers: filteredSuppliers.filter(s => s.status === 'inactive').length
      }
    };
  } catch (error) {
    console.error('Erro na lista de fornecedores:', error);
    return {
      title: 'Lista de Fornecedores',
      period: `${params.startDate} a ${params.endDate}`,
      data: {
        suppliers: [],
        totalSuppliers: 0,
        activeSuppliers: 0,
        inactiveSuppliers: 0
      }
    };
  }
}

async function getSupplierPerformanceData(params: any) {
  console.log('📊 Analisando performance de fornecedores...');
  
  try {
    const { data: suppliers, error } = await supabaseAdmin
      .from('partners')
      .select('id, name, status, created_at, partner_roles!inner(role)')
      .eq('partner_roles.role', 'supplier')
      .eq('is_deleted', false);

    if (error) {
      console.error('❌ Erro ao buscar fornecedores:', error);
      throw error;
    }

    // Buscar pagamentos para fornecedores (accounts_payable)
    const { data: payments, error: paymentsError } = await supabaseAdmin
      .from('accounts_payable')
      .select('supplier_id, valor, status, data_pagamento, data_vencimento')
      .gte('data_pagamento', params.startDate || '2024-01-01')
      .lte('data_pagamento', params.endDate || '2024-12-31');

    if (paymentsError) {
      console.error('❌ Erro ao buscar pagamentos:', paymentsError);
    }

    const suppliersWithPerformance = suppliers?.map(supplier => {
      const supplierPayments = payments?.filter(p => p.supplier_id === supplier.id) || [];
      const totalAmount = supplierPayments.reduce((sum, p) => sum + (parseFloat(p.valor) || 0), 0);
      const totalPayments = supplierPayments.length;
      const paidOnTime = supplierPayments.filter(p => 
        p.status === 'paga' && 
        p.data_pagamento && 
        p.data_vencimento && 
        new Date(p.data_pagamento) <= new Date(p.data_vencimento)
      ).length;
      const onTimeRate = totalPayments > 0 ? (paidOnTime / totalPayments) * 100 : 0;

      return {
        id: supplier.id,
        name: supplier.name,
        status: supplier.status,
        totalAmount,
        totalPayments,
        onTimeRate,
        rating: Math.round(onTimeRate / 20) // Rating de 0-5 baseado na performance
      };
    }) || [];

    console.log('📊 Performance calculada para:', suppliersWithPerformance.length, 'fornecedores');

    return {
      title: 'Performance de Fornecedores',
      period: `${params.startDate} a ${params.endDate}`,
      data: {
        suppliers: suppliersWithPerformance,
        totalSuppliers: suppliersWithPerformance.length,
        averageRating: suppliersWithPerformance.length > 0 ? 
          suppliersWithPerformance.reduce((sum, s) => sum + s.rating, 0) / suppliersWithPerformance.length : 0
      }
    };
  } catch (error) {
    console.error('Erro na performance de fornecedores:', error);
    return {
      title: 'Performance de Fornecedores',
      period: `${params.startDate} a ${params.endDate}`,
      data: {
        suppliers: [],
        totalSuppliers: 0,
        averageRating: 0
      }
    };
  }
}

async function getPurchaseAnalysisData(params: any) {
  console.log('💳 Analisando compras...');
  
  try {
    const { data: purchases, error } = await supabaseAdmin
      .from('accounts_payable')
      .select(`
        id,
        supplier_id,
        valor,
        status,
        data_vencimento,
        data_pagamento,
        descricao
      `)
      .gte('data_vencimento', params.startDate || '2024-01-01')
      .lte('data_vencimento', params.endDate || '2024-12-31');

    if (error) {
      console.error('❌ Erro ao buscar compras:', error);
      throw error;
    }

    const totalPurchases = purchases?.length || 0;
    const totalAmount = purchases?.reduce((sum, p) => sum + (parseFloat(p.valor) || 0), 0) || 0;
    const paidPurchases = purchases?.filter(p => p.status === 'paga').length || 0;
    const pendingPurchases = purchases?.filter(p => p.status === 'pendente').length || 0;
    const overduePurchases = purchases?.filter(p => 
      p.status !== 'paga' && new Date(p.data_vencimento) < new Date()
    ).length || 0;

    console.log('💳 Compras analisadas:', totalPurchases);

    return {
      title: 'Análise de Compras',
      period: `${params.startDate} a ${params.endDate}`,
      data: {
        totalPurchases,
        totalAmount,
        paidPurchases,
        pendingPurchases,
        overduePurchases,
        averagePurchase: totalPurchases > 0 ? totalAmount / totalPurchases : 0,
        paymentRate: totalPurchases > 0 ? (paidPurchases / totalPurchases) * 100 : 0
      }
    };
  } catch (error) {
    console.error('Erro na análise de compras:', error);
    return {
      title: 'Análise de Compras',
      period: `${params.startDate} a ${params.endDate}`,
      data: {
        totalPurchases: 0,
        totalAmount: 0,
        paidPurchases: 0,
        pendingPurchases: 0,
        overduePurchases: 0,
        averagePurchase: 0,
        paymentRate: 0
      }
    };
  }
}

async function getCashFlowData(params: any) {
  console.log('💰 Calculando fluxo de caixa...');
  
  // Buscar vendas (entradas de caixa)
  const startDate = params.startDate || '2024-01-01';
  const endDate = params.endDate || '2024-12-31';
  
  // Buscar todas as vendas primeiro (sem filtro de data na query, pois pode ter date ou sale_date)
  let salesQuery = supabaseAdmin
    .from('sales')
    .select('total, total_amount, date, sale_date, status')
    .eq('is_deleted', false)
    .in('status', ['Concluída', 'completed']);
  
  salesQuery = applySegmentFilter(salesQuery, params.segmentId);
  const { data: sales, error: salesError } = await salesQuery;
  
  // Filtrar por data no código (usando date ou sale_date)
  const filteredSales = (sales || []).filter(sale => {
    const saleDate = sale.sale_date || sale.date;
    if (!saleDate) return false;
    return saleDate >= startDate && saleDate <= endDate;
  });
  
  console.log('💰 Vendas encontradas:', { total: sales?.length || 0, filtradas: filteredSales.length, startDate, endDate });

  if (salesError) {
    console.error('Erro ao buscar vendas:', salesError);
  }

  // Buscar contas a receber pagas
  let receivablesQuery = supabaseAdmin
    .from('financial_documents')
    .select('amount, due_date, status')
    .eq('direction', 'receivable')
    .gte('due_date', params.startDate || '2024-01-01')
    .lte('due_date', params.endDate || '2024-12-31')
    .eq('status', 'paid');
  receivablesQuery = applySegmentFilter(receivablesQuery, params.segmentId);
  const { data: receivables, error: receivablesError } = await receivablesQuery;

  if (receivablesError) {
    console.error('Erro ao buscar contas a receber:', receivablesError);
  }

  // Buscar contas a pagar (saídas de caixa)
  let payablesQuery = supabaseAdmin
    .from('accounts_payable')
    .select('valor, data_pagamento, status')
    .gte('data_pagamento', params.startDate || '2024-01-01')
    .lte('data_pagamento', params.endDate || '2024-12-31')
    .eq('status', 'paga');
  payablesQuery = applySegmentFilter(payablesQuery, params.segmentId);
  const { data: payables, error: payablesError } = await payablesQuery;

  if (payablesError) {
    console.error('Erro ao buscar contas a pagar:', payablesError);
  }

  // Calcular entradas
  const salesInflows = filteredSales.reduce((sum, sale) => {
    const amount = parseFloat(sale.total_amount || sale.total || 0);
    return sum + amount;
  }, 0);
  const receivablesInflows = (receivables || []).reduce((sum, rec) => sum + (parseFloat(rec.amount) || 0), 0);
  const totalInflows = salesInflows + receivablesInflows;

  // Calcular saídas
  const totalOutflows = (payables || []).reduce((sum, pay) => sum + (parseFloat(pay.valor) || 0), 0);

  // Calcular saldo
  const balance = totalInflows - totalOutflows;

  console.log('💰 Fluxo de caixa calculado:', {
    salesInflows,
    receivablesInflows,
    totalInflows,
    totalOutflows,
    balance
  });

  return {
    title: 'Fluxo de Caixa',
    period: `${params.startDate} a ${params.endDate}`,
    data: {
      inflows: totalInflows,
      outflows: totalOutflows,
      balance: balance,
      breakdown: {
        sales: salesInflows,
        receivables: receivablesInflows,
        payables: totalOutflows
      },
      summary: {
        totalSales: filteredSales.length,
        totalReceivables: (receivables || []).length,
        totalPayables: (payables || []).length
      }
    }
  };
}

// === RELATÓRIOS DE VENDAS ===
async function getSalesPerformanceData(params: any) {
  console.log('📈 Analisando performance de vendas...', { params });
  
  try {
    // Buscar todas as vendas primeiro (filtrar por data no código)
    const startDate = params.startDate || '2024-01-01';
    const endDate = params.endDate || '2024-12-31';
    
    let query = supabaseAdmin
      .from('sales')
      .select('id, total, total_amount, date, sale_date, status, customer_id')
      .eq('is_deleted', false)
      .in('status', ['Concluída', 'completed']);
    
    query = applySegmentFilter(query, params.segmentId);
    
    console.log('🔍 Query de vendas:', { startDate, endDate, segmentId: params.segmentId });
    
    const { data: sales, error } = await query;
    
    console.log('📊 Vendas encontradas (antes do filtro de data):', sales?.length || 0);

    if (error) {
      console.error('❌ Erro ao buscar vendas:', error);
      throw error;
    }

    // Filtrar por data no código também
    const filteredSales = (sales || []).filter(sale => {
      const saleDate = sale.sale_date || sale.date;
      if (!saleDate) return false;
      return saleDate >= startDate && saleDate <= endDate;
    });
    
    console.log('📊 Vendas filtradas por data:', filteredSales.length);
    
    const completedSales = filteredSales.filter(s => s.status === 'Concluída' || s.status === 'completed');
    const totalSales = completedSales.length;
    const totalRevenue = completedSales.reduce((sum, s) => {
      const amount = parseFloat(s.total_amount || s.total || 0);
      return sum + amount;
    }, 0);
    const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Calcular crescimento (simples comparação com período anterior)
    const periodDays = Math.floor((new Date(params.endDate).getTime() - new Date(params.startDate).getTime()) / (1000 * 60 * 60 * 24));
    const previousStartDate = new Date(new Date(params.startDate).getTime() - (periodDays * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
    const previousEndDate = new Date(new Date(params.startDate).getTime() - (24 * 60 * 60 * 1000)).toISOString().split('T')[0];

    let previousSalesQuery = supabaseAdmin
      .from('sales')
      .select('total, status')
      .gte('date', previousStartDate)
      .lte('date', previousEndDate)
      .in('status', ['Concluída', 'completed']);
    previousSalesQuery = applySegmentFilter(previousSalesQuery, params.segmentId);
    const { data: previousSales } = await previousSalesQuery;

    const previousRevenue = previousSales?.reduce((sum, s) => sum + (parseFloat(s.total) || 0), 0) || 0;
    const growth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    console.log('📈 Performance de vendas:', { totalSales, totalRevenue, growth });

    return {
      title: 'Performance de Vendas',
      period: `${params.startDate} a ${params.endDate}`,
      data: {
        totalSales,
        totalRevenue,
        averageTicket,
        growth: Math.round(growth * 100) / 100,
        previousRevenue,
        salesByDay: completedSales.reduce((acc: {[key: string]: number}, sale) => {
          const day = sale.date.split('T')[0];
          acc[day] = (acc[day] || 0) + parseFloat(sale.total);
          return acc;
        }, {})
      }
    };
  } catch (error) {
    console.error('Erro na performance de vendas:', error);
    return {
      title: 'Performance de Vendas',
      period: `${params.startDate} a ${params.endDate}`,
      data: {
        totalSales: 0,
        totalRevenue: 0,
        averageTicket: 0,
        growth: 0,
        previousRevenue: 0,
        salesByDay: {}
      }
    };
  }
}

async function getTopProductsData(params: any) {
  console.log('🏆 Analisando produtos mais vendidos...');
  
  try {
    const { data: salesItems, error } = await supabaseAdmin
      .from('sale_items')
      .select(`
        product_id,
        quantity,
        total,
        sales!inner (
          date,
          status
        )
      `)
      .gte('sales.date', params.startDate || '2024-01-01')
      .lte('sales.date', params.endDate || '2024-12-31')
      .in('sales.status', ['Concluída', 'completed']);

    if (error) {
      console.error('❌ Erro ao buscar itens de venda:', error);
      throw error;
    }

    // Buscar informações dos produtos
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, name, price');

    if (productsError) {
      console.error('❌ Erro ao buscar produtos:', productsError);
    }

    // Agrupar por produto
    const productStats: {[key: string]: {id: string; name: string; price: number; totalQuantity: number; totalRevenue: number; salesCount: number}} = {};
    salesItems?.forEach(item => {
      if (!productStats[item.product_id]) {
        const product = products?.find(p => p.id === item.product_id);
        productStats[item.product_id] = {
          id: item.product_id,
          name: product?.name || 'Produto não identificado',
          price: product?.price || 0,
          totalQuantity: 0,
          totalRevenue: 0,
          salesCount: 0
        };
      }
      
      productStats[item.product_id].totalQuantity += parseInt(item.quantity) || 0;
      productStats[item.product_id].totalRevenue += parseFloat(item.total) || 0;
      productStats[item.product_id].salesCount += 1;
    });

    const topProducts = Object.values(productStats)
      .sort((a: any, b: any) => b.totalQuantity - a.totalQuantity)
      .slice(0, 10);

    console.log('🏆 Top produtos encontrados:', topProducts.length);

    return {
      title: 'Produtos Mais Vendidos',
      period: `${params.startDate} a ${params.endDate}`,
      data: {
        products: topProducts,
        totalProducts: Object.keys(productStats).length,
        topProduct: topProducts[0]?.name || 'N/A',
        totalQuantity: Object.values(productStats).reduce((sum: number, p: any) => sum + p.totalQuantity, 0)
      }
    };
  } catch (error) {
    console.error('Erro nos top produtos:', error);
    return {
      title: 'Produtos Mais Vendidos',
      period: `${params.startDate} a ${params.endDate}`,
      data: {
        products: [],
        totalProducts: 0,
        topProduct: 'N/A',
        totalQuantity: 0
      }
    };
  }
}

async function getSalesForecastData(params: any) {
  console.log('🔮 Calculando previsão de vendas...');
  
  try {
    let salesQuery = supabaseAdmin
      .from('sales')
      .select('total, date, status')
      .in('status', ['Concluída', 'completed']);
    salesQuery = applySegmentFilter(salesQuery, params.segmentId);
    const { data: sales, error } = await salesQuery.order('date', { ascending: true });

    if (error) {
      console.error('❌ Erro ao buscar vendas para previsão:', error);
      throw error;
    }

    const salesByMonth: {[key: string]: number} = {};
    sales?.forEach(sale => {
      const month = sale.date.substring(0, 7); // YYYY-MM
      salesByMonth[month] = (salesByMonth[month] || 0) + parseFloat(sale.total);
    });

    const months = Object.keys(salesByMonth).sort();
    const values = months.map(month => salesByMonth[month]);
    
    // Cálculo simples de tendência (média dos últimos 3 meses)
    const lastThreeMonths = values.slice(-3);
    const avgLastThreeMonths = lastThreeMonths.length > 0 ? 
      lastThreeMonths.reduce((sum, val) => sum + val, 0) / lastThreeMonths.length : 0;
    
    // Previsão simples baseada na média
    const forecast = avgLastThreeMonths;
    const trend = values.length >= 2 ? 
      values[values.length - 1] > values[values.length - 2] ? 'crescimento' : 
      values[values.length - 1] < values[values.length - 2] ? 'queda' : 'estável' : 'estável';

    const confidence = values.length >= 3 ? 75 : values.length >= 2 ? 50 : 25;

    console.log('🔮 Previsão calculada:', { forecast, trend, confidence });

    return {
      title: 'Previsão de Vendas',
      period: `${params.startDate} a ${params.endDate}`,
      data: {
        forecast: Math.round(forecast),
        confidence,
        trend,
        historicalData: months.map(month => ({
          month,
          value: salesByMonth[month]
        })),
        monthlyAverage: avgLastThreeMonths
      }
    };
  } catch (error) {
    console.error('Erro na previsão de vendas:', error);
    return {
      title: 'Previsão de Vendas',
      period: `${params.startDate} a ${params.endDate}`,
      data: {
        forecast: 0,
        confidence: 0,
        trend: 'estável',
        historicalData: [],
        monthlyAverage: 0
      }
    };
  }
}

async function getCustomerAnalysisData(params: any) {
  console.log('👤 Analisando clientes...');
  
  try {
    const { data: customers, error } = await supabaseAdmin
      .from('partners')
      .select('id, name, created_at, status, partner_roles!inner(role)')
      .eq('partner_roles.role', 'customer')
      .eq('is_deleted', false);

    if (error) {
      console.error('❌ Erro ao buscar clientes:', error);
      throw error;
    }

    let salesQuery = supabaseAdmin
      .from('sales')
      .select('customer_id, total, date, status')
      .in('status', ['Concluída', 'completed'])
      .gte('date', params.startDate || '2024-01-01')
      .lte('date', params.endDate || '2024-12-31');
    salesQuery = applySegmentFilter(salesQuery, params.segmentId);
    const { data: sales, error: salesError } = await salesQuery;

    if (salesError) {
      console.error('❌ Erro ao buscar vendas:', salesError);
    }

    const customerStats = customers?.map(customer => {
      const customerSales = sales?.filter(s => s.customer_id === customer.id) || [];
      const totalRevenue = customerSales.reduce((sum, s) => sum + (parseFloat(s.total) || 0), 0);
      const totalOrders = customerSales.length;
      
      return {
        id: customer.id,
        name: customer.name,
        status: customer.status,
        totalRevenue,
        totalOrders,
        avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        lastPurchase: customerSales.length > 0 ? 
          customerSales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date : null
      };
    }) || [];

    const totalCustomers = customerStats.length;
    const activeCustomers = customerStats.filter(c => c.totalOrders > 0).length;
    const avgRevenuePerCustomer = totalCustomers > 0 ? 
      customerStats.reduce((sum, c) => sum + c.totalRevenue, 0) / totalCustomers : 0;

    console.log('👤 Análise de clientes completa:', { totalCustomers, activeCustomers });

    return {
      title: 'Análise de Clientes',
      period: `${params.startDate} a ${params.endDate}`,
      data: {
        customers: customerStats.slice(0, 50), // Limitar a 50 para performance
        totalCustomers,
        activeCustomers,
        inactiveCustomers: totalCustomers - activeCustomers,
        avgRevenuePerCustomer,
        topCustomer: customerStats.sort((a, b) => b.totalRevenue - a.totalRevenue)[0]
      }
    };
  } catch (error) {
    console.error('Erro na análise de clientes:', error);
    return {
      title: 'Análise de Clientes',
      period: `${params.startDate} a ${params.endDate}`,
      data: {
        customers: [],
        totalCustomers: 0,
        activeCustomers: 0,
        inactiveCustomers: 0,
        avgRevenuePerCustomer: 0,
        topCustomer: null
      }
    };
  }
}

async function getProfitLossData(params: any) {
  console.log('📊 Calculando DRE...', { params });
  
  const startDate = params.startDate || '2024-01-01';
  const endDate = params.endDate || '2024-12-31';
  
  // Buscar receitas (vendas)
  let salesQuery = supabaseAdmin
    .from('sales')
    .select('total, total_amount, date, sale_date, status')
    .eq('is_deleted', false)
    .in('status', ['Concluída', 'completed']);
  salesQuery = applySegmentFilter(salesQuery, params.segmentId);
  const { data: sales, error: salesError } = await salesQuery;
  
  // Filtrar por data no código
  const filteredSales = (sales || []).filter(sale => {
    const saleDate = sale.sale_date || sale.date;
    if (!saleDate) return false;
    return saleDate >= startDate && saleDate <= endDate;
  });

  if (salesError) {
    console.error('Erro ao buscar vendas:', salesError);
  }

  // Buscar custos (compras de produtos)
  let purchasesQuery = supabaseAdmin
    .from('accounts_payable')
    .select('valor, descricao, data_pagamento, status')
    .gte('data_pagamento', params.startDate || '2024-01-01')
    .lte('data_pagamento', params.endDate || '2024-12-31')
    .eq('status', 'paga')
    .ilike('descricao', '%produto%');
  purchasesQuery = applySegmentFilter(purchasesQuery, params.segmentId);
  const { data: purchases, error: purchasesError } = await purchasesQuery;

  if (purchasesError) {
    console.error('Erro ao buscar compras:', purchasesError);
  }

  // Calcular receitas
  const totalRevenue = filteredSales.reduce((sum, sale) => {
    const amount = parseFloat(sale.total_amount || sale.total || 0);
    return sum + amount;
  }, 0);

  // Calcular custos
  const totalCosts = (purchases || []).reduce((sum, purchase) => sum + (parseFloat(purchase.valor) || 0), 0);

  // Calcular lucro
  const profit = totalRevenue - totalCosts;
  const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

  console.log('📊 DRE calculado:', {
    totalRevenue,
    totalCosts,
    profit,
    profitMargin
  });

  return {
    title: 'Demonstrativo de Resultados',
    period: `${params.startDate} a ${params.endDate}`,
    data: {
      revenue: totalRevenue,
      costs: totalCosts,
      profit: profit,
      profitMargin: profitMargin,
      breakdown: {
        sales: totalRevenue,
        purchases: totalCosts,
        otherCosts: 0
      },
      summary: {
        totalSales: filteredSales.length,
        totalPurchases: (purchases || []).length
      }
    }
  };
}

async function getBalanceSheetData(params: any) {
  console.log('📊 Calculando balanço patrimonial...');
  
  try {
    // Buscar dados reais para o balanço
    let salesQuery = supabaseAdmin
      .from('sales')
      .select('total')
      .in('status', ['Concluída', 'completed']);
    salesQuery = applySegmentFilter(salesQuery, params.segmentId);
    const { data: salesData } = await salesQuery;

    let payablesQuery = supabaseAdmin
      .from('accounts_payable')
      .select('valor')
      .eq('status', 'pendente');
    payablesQuery = applySegmentFilter(payablesQuery, params.segmentId);
    const { data: payablesData } = await payablesQuery;

    let receivablesQuery = supabaseAdmin
      .from('financial_documents')
      .select('amount')
      .eq('direction', 'receivable')
      .eq('status', 'open');
    receivablesQuery = applySegmentFilter(receivablesQuery, params.segmentId);
    const { data: receivablesData } = await receivablesQuery;

    let productsQuery = supabaseAdmin
      .from('products')
      .select('price, stock_quantity')
      .eq('is_deleted', false);
    productsQuery = applySegmentFilter(productsQuery, params.segmentId);
    const { data: productsData } = await productsQuery;

    // Calcular ativos
    const totalSales = salesData?.reduce((sum, sale) => sum + (parseFloat(sale.total) || 0), 0) || 0;
    const totalReceivables = receivablesData?.reduce((sum, rec) => sum + (parseFloat(rec.amount) || 0), 0) || 0;
    const totalInventory = productsData?.reduce((sum, product) => sum + ((parseFloat(product.price) || 0) * (product.stock_quantity || 0)), 0) || 0;
    
    const assets = totalSales + totalReceivables + totalInventory;

    // Calcular passivos
    const totalPayables = payablesData?.reduce((sum, pay) => sum + (parseFloat(pay.valor) || 0), 0) || 0;
    const liabilities = totalPayables;

    // Calcular patrimônio líquido
    const equity = assets - liabilities;

    return {
      title: 'Balanço Patrimonial',
      period: `${params.startDate} a ${params.endDate}`,
      data: {
        assets,
        liabilities,
        equity,
        breakdown: {
          cash: totalSales,
          receivables: totalReceivables,
          inventory: totalInventory,
          payables: totalPayables
        }
      }
    };
  } catch (error) {
    console.error('❌ Erro ao calcular balanço patrimonial:', error);
    return {
      title: 'Balanço Patrimonial',
      period: `${params.startDate} a ${params.endDate}`,
      data: {
        assets: 0,
        liabilities: 0,
        equity: 0,
        breakdown: {
          cash: 0,
          receivables: 0,
          inventory: 0,
          payables: 0
        }
      }
    };
  }
}

async function getFinancialAnalysisData(params: any) {
  console.log('📊 Calculando análise financeira...', { params });
  
  try {
    const startDate = params.startDate || '2024-01-01';
    const endDate = params.endDate || '2024-12-31';
    
    // Buscar dados reais para análise financeira
    let salesQuery = supabaseAdmin
      .from('sales')
      .select('total, total_amount, date, sale_date')
      .eq('is_deleted', false)
      .in('status', ['Concluída', 'completed']);
    salesQuery = applySegmentFilter(salesQuery, params.segmentId);
    const { data: salesData } = await salesQuery;
    
    // Filtrar por data no código
    const filteredSales = (salesData || []).filter(sale => {
      const saleDate = sale.sale_date || sale.date;
      if (!saleDate) return false;
      return saleDate >= startDate && saleDate <= endDate;
    });

    let payablesQuery = supabaseAdmin
      .from('accounts_payable')
      .select('valor, data_vencimento')
      .eq('status', 'pendente');
    payablesQuery = applySegmentFilter(payablesQuery, params.segmentId);
    const { data: payablesData } = await payablesQuery;

    let receivablesQuery = supabaseAdmin
      .from('financial_documents')
      .select('amount, due_date')
      .eq('direction', 'receivable')
      .eq('status', 'open');
    receivablesQuery = applySegmentFilter(receivablesQuery, params.segmentId);
    const { data: receivablesData } = await receivablesQuery;

    let productsQuery = supabaseAdmin
      .from('products')
      .select('price, stock_quantity, cost')
      .eq('is_deleted', false);
    productsQuery = applySegmentFilter(productsQuery, params.segmentId);
    const { data: productsData } = await productsQuery;

    // Calcular métricas financeiras
    const totalRevenue = filteredSales.reduce((sum, sale) => {
      const amount = parseFloat(sale.total_amount || sale.total || 0);
      return sum + amount;
    }, 0);
    const totalPayables = payablesData?.reduce((sum, pay) => sum + (parseFloat(pay.valor) || 0), 0) || 0;
    const totalReceivables = receivablesData?.reduce((sum, rec) => sum + (parseFloat(rec.amount) || 0), 0) || 0;
    const totalInventory = productsData?.reduce((sum, product) => sum + ((parseFloat(product.price) || 0) * (product.stock_quantity || 0)), 0) || 0;
    const totalCosts = productsData?.reduce((sum, product) => sum + ((parseFloat(product.cost) || 0) * (product.stock_quantity || 0)), 0) || 0;

    // Calcular índices financeiros
    const liquidity = totalPayables > 0 ? (totalReceivables + totalInventory) / totalPayables : 0;
    const profitability = totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue) * 100 : 0;
    const indebtedness = totalPayables > 0 ? (totalPayables / (totalReceivables + totalInventory)) * 100 : 0;

    return {
      title: 'Análise Financeira',
      period: `${params.startDate} a ${params.endDate}`,
      data: {
        liquidity,
        profitability,
        indebtedness,
        metrics: {
          totalRevenue,
          totalCosts,
          totalPayables,
          totalReceivables,
          totalInventory,
          netProfit: totalRevenue - totalCosts
        }
      }
    };
  } catch (error) {
    console.error('❌ Erro ao calcular análise financeira:', error);
    return {
      title: 'Análise Financeira',
      period: `${params.startDate} a ${params.endDate}`,
      data: {
        liquidity: 0,
        profitability: 0,
        indebtedness: 0,
        metrics: {
          totalRevenue: 0,
          totalCosts: 0,
          totalPayables: 0,
          totalReceivables: 0,
          totalInventory: 0,
          netProfit: 0
        }
      }
    };
  }
}






async function getSalesSummaryData(params: any) {
  const { data, error } = await supabaseAdmin
    .from('sales')
    .select('*')
    .gte('date', params.startDate || '2024-01-01')
    .lte('date', params.endDate || '2024-12-31')
    .order('date', { ascending: false });

  if (error) throw error;

  return {
    title: 'Resumo de Vendas',
    period: `${params.startDate} a ${params.endDate}`,
    data: data || []
  };
}

async function getSalesAnalysisData(params: any) {
  console.log('📊 Analisando dados de vendas...');
  
  try {
    // Buscar dados reais de vendas
    const { data: salesData, error: salesError } = await supabaseAdmin
      .from('sales')
      .select('total, date, status, items:sale_items(product_id, product_name, quantity)')
      .gte('date', params.startDate || '2024-01-01')
      .lte('date', params.endDate || '2024-12-31')
      .in('status', ['Concluída', 'completed']);

    if (salesError) {
      console.error('❌ Erro ao buscar vendas:', salesError);
      throw salesError;
    }

    const sales = salesData || [];
    const totalSales = sales.length;
    const totalValue = sales.reduce((sum, sale) => sum + (parseFloat(sale.total) || 0), 0);
    const averageValue = totalSales > 0 ? totalValue / totalSales : 0;

    // Calcular top produtos
    const productCounts: { [key: string]: number } = {};
    sales.forEach(sale => {
      if (sale.items) {
        sale.items.forEach((item: any) => {
          const productName = item.product_name || 'Produto não identificado';
          productCounts[productName] = (productCounts[productName] || 0) + (item.quantity || 0);
        });
      }
    });

    const topProducts = Object.entries(productCounts)
      .map(([name, quantity]) => ({ name, quantity: quantity as number }))
      .sort((a, b) => (b.quantity as number) - (a.quantity as number))
      .slice(0, 5);

    return {
      title: 'Análise de Vendas',
      period: `${params.startDate} a ${params.endDate}`,
      data: {
        totalSales,
        averageValue,
        topProducts,
        totalValue
      }
    };
  } catch (error) {
    console.error('❌ Erro ao analisar vendas:', error);
    return {
      title: 'Análise de Vendas',
      period: `${params.startDate} a ${params.endDate}`,
      data: {
        totalSales: 0,
        averageValue: 0,
        topProducts: [],
        totalValue: 0
      }
    };
  }
}

async function getProductListData(params: any) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return {
    title: 'Lista de Produtos',
    period: `${params.startDate} a ${params.endDate}`,
    data: data || []
  };
}

async function getInventoryAnalysisData(params: any) {
  console.log('📊 Analisando estoque...');
  
  try {
    // Buscar dados reais de produtos
    const { data: productsData, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, name, stock_quantity, min_stock, price')
      .eq('is_deleted', false);

    if (productsError) {
      console.error('❌ Erro ao buscar produtos:', productsError);
      throw productsError;
    }

    const products = productsData || [];
    const totalProducts = products.length;
    
    // Calcular produtos com estoque baixo
    const lowStock = products.filter(p => {
      const stock = p.stock_quantity || 0;
      const minStock = p.min_stock || 0;
      return stock > 0 && stock <= minStock;
    }).length;
    
    // Calcular produtos sem estoque
    const outOfStock = products.filter(p => (p.stock_quantity || 0) === 0).length;
    
    // Calcular valor total do estoque
    const totalValue = products.reduce((sum, product) => {
      return sum + ((parseFloat(product.price) || 0) * (product.stock_quantity || 0));
    }, 0);

    return {
      title: 'Análise de Estoque',
      period: `${params.startDate} a ${params.endDate}`,
      data: {
        totalProducts,
        lowStock,
        outOfStock,
        totalValue,
        averageStock: totalProducts > 0 ? products.reduce((sum, p) => sum + (p.stock_quantity || 0), 0) / totalProducts : 0
      }
    };
  } catch (error) {
    console.error('❌ Erro ao analisar estoque:', error);
    return {
      title: 'Análise de Estoque',
      period: `${params.startDate} a ${params.endDate}`,
      data: {
        totalProducts: 0,
        lowStock: 0,
        outOfStock: 0,
        totalValue: 0,
        averageStock: 0
      }
    };
  }
}

async function getAccountsPayableData(params: any) {
  console.log('💳 Buscando contas a pagar...');
  
  const { data, error } = await supabaseAdmin
    .from('accounts_payable')
    .select('*')
    .order('data_vencimento', { ascending: true });

  if (error) {
    console.error('Erro ao buscar contas a pagar:', error);
    throw error;
  }

  const accounts = data || [];
  const totalAmount = accounts.reduce((sum, account) => sum + (parseFloat(account.valor) || 0), 0);
  const overdueCount = accounts.filter(account => 
    account.data_vencimento && new Date(account.data_vencimento) < new Date() && account.status !== 'paga'
  ).length;
  const paidCount = accounts.filter(account => account.status === 'paga').length;

  console.log('💳 Contas a pagar encontradas:', {
    total: accounts.length,
    totalAmount,
    overdueCount,
    paidCount
  });

  return {
    title: 'Contas a Pagar',
    period: `${params.startDate} a ${params.endDate}`,
    data: accounts,
    summary: {
      total: accounts.length,
      totalAmount,
      overdueCount,
      paidCount,
      pendingCount: accounts.length - paidCount
    }
  };
}

async function getAccountsPayableAnalysisData(params: any) {
  console.log('📊 Analisando contas a pagar...');
  
  const { data, error } = await supabaseAdmin
    .from('accounts_payable')
    .select('*')
    .order('data_vencimento', { ascending: true });

  if (error) {
    console.error('Erro ao buscar contas a pagar para análise:', error);
    throw error;
  }

  const accounts = data || [];
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const totalPayable = accounts.reduce((sum, account) => sum + (parseFloat(account.valor) || 0), 0);
  const overdue = accounts.filter(account => 
    account.data_vencimento && new Date(account.data_vencimento) < now && account.status !== 'paga'
  ).length;
  const dueSoon = accounts.filter(account => 
    account.data_vencimento && new Date(account.data_vencimento) <= nextWeek && account.status !== 'paga'
  ).length;
  const paid = accounts.filter(account => account.status === 'paga').length;

  console.log('📊 Análise de contas a pagar:', {
    totalPayable,
    overdue,
    dueSoon,
    paid
  });

  return {
    title: 'Análise de Contas a Pagar',
    period: `${params.startDate} a ${params.endDate}`,
    data: {
      totalPayable,
      overdue,
      dueSoon,
      paid,
      pending: accounts.length - paid
    }
  };
}

async function getAccountsReceivableData(params: any) {
  const { data, error } = await supabaseAdmin
    .from('financial_documents')
    .select('*')
    .eq('direction', 'receivable')
    .order('due_date', { ascending: true });

  if (error) throw error;

  return {
    title: 'Contas a Receber',
    period: `${params.startDate} a ${params.endDate}`,
    data: data || []
  };
}

async function getAccountsReceivableAnalysisData(params: any) {
  console.log('📊 Analisando contas a receber...');
  
  try {
    // Buscar dados reais de contas a receber
    const { data: receivablesData, error: receivablesError } = await supabaseAdmin
      .from('financial_documents')
      .select('amount, due_date, status')
      .eq('direction', 'receivable')
      .order('due_date', { ascending: true });

    if (receivablesError) {
      console.error('❌ Erro ao buscar contas a receber:', receivablesError);
      throw receivablesError;
    }

    const receivables = receivablesData || [];
    const totalReceivable = receivables.reduce((sum, rec) => sum + (parseFloat(rec.amount) || 0), 0);
    
    // Calcular contas vencidas
    const today = new Date();
    const overdue = receivables.filter(rec => {
      const dueDate = new Date(rec.due_date);
      return dueDate < today && rec.status !== 'paid';
    }).length;
    
    // Calcular contas que vencem em breve (próximos 7 dias)
    const dueSoon = receivables.filter(rec => {
      const dueDate = new Date(rec.due_date);
      const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff >= 0 && daysDiff <= 7 && rec.status !== 'paid';
    }).length;

    return {
      title: 'Análise de Contas a Receber',
      period: `${params.startDate} a ${params.endDate}`,
      data: {
        totalReceivable,
        overdue,
        dueSoon,
        totalCount: receivables.length,
        paidCount: receivables.filter(rec => rec.status === 'paid').length
      }
    };
  } catch (error) {
    console.error('❌ Erro ao analisar contas a receber:', error);
    return {
      title: 'Análise de Contas a Receber',
      period: `${params.startDate} a ${params.endDate}`,
      data: {
        totalReceivable: 0,
        overdue: 0,
        dueSoon: 0,
        totalCount: 0,
        paidCount: 0
      }
    };
  }
}

async function getNfeIssuedData(params: any) {
  console.log('📄 Analisando NFes emitidas...');
  
  try {
    // Buscar dados reais de vendas para calcular NFes emitidas
    const { data: salesData, error: salesError } = await supabaseAdmin
      .from('sales')
      .select('total, date')
      .in('status', ['Concluída', 'completed'])
      .gte('date', params.startDate || '2024-01-01')
      .lte('date', params.endDate || '2024-12-31');

    if (salesError) {
      console.error('❌ Erro ao buscar vendas para NFes emitidas:', salesError);
      throw salesError;
    }

    const sales = salesData || [];
    const totalIssued = sales.length;
    const totalValue = sales.reduce((sum, sale) => sum + (parseFloat(sale.total) || 0), 0);
    
    // Agrupar por mês baseado em vendas reais
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const salesByMonth: { [key: string]: { count: number; value: number } } = {};
    
    sales.forEach(sale => {
      const date = new Date(sale.date);
      const monthIndex = date.getMonth();
      const monthName = monthNames[monthIndex];
      
      if (!salesByMonth[monthName]) {
        salesByMonth[monthName] = { count: 0, value: 0 };
      }
      
      salesByMonth[monthName].count += 1;
      salesByMonth[monthName].value += parseFloat(sale.total) || 0;
    });

    const byMonth = Object.entries(salesByMonth).map(([month, data]: [string, any]) => ({
      month,
      count: data.count,
      value: Math.round(data.value)
    }));

    console.log('📄 NFes emitidas:', {
      totalIssued,
      totalValue,
      byMonthCount: byMonth.length,
      basedOnSales: sales.length
    });

    return {
      title: 'NFes Emitidas',
      period: `${params.startDate} a ${params.endDate}`,
      data: {
        totalIssued,
        totalValue: Math.round(totalValue),
        byMonth
      }
    };
  } catch (error) {
    console.error('Erro nas NFes emitidas:', error);
    return {
      title: 'NFes Emitidas',
      period: `${params.startDate} a ${params.endDate}`,
      data: {
        totalIssued: 0,
        totalValue: 0,
        byMonth: []
      }
    };
  }
}

async function getTaxSummaryData(params: any) {
  console.log('💰 Analisando resumo de impostos...');
  
  try {
    // Buscar dados reais de vendas para calcular impostos
    const { data: salesData, error: salesError } = await supabaseAdmin
      .from('sales')
      .select('total, date')
      .in('status', ['Concluída', 'completed'])
      .gte('date', params.startDate || '2024-01-01')
      .lte('date', params.endDate || '2024-12-31');

    if (salesError) {
      console.error('❌ Erro ao buscar vendas para impostos:', salesError);
      throw salesError;
    }

    const sales = salesData || [];
    const totalRevenue = sales.reduce((sum, sale) => sum + (parseFloat(sale.total) || 0), 0);
    
    // Calcular impostos baseados na receita real
    const icms = totalRevenue * 0.18; // 18% ICMS
    const ipi = totalRevenue * 0.05;  // 5% IPI
    const pis = totalRevenue * 0.0165; // 1.65% PIS
    const cofins = totalRevenue * 0.076; // 7.6% COFINS
    const iss = totalRevenue * 0.05;  // 5% ISS
    
    const totalTaxes = icms + ipi + pis + cofins + iss;
    
    const byType = [
      { type: 'ICMS', amount: Math.round(icms), percentage: totalRevenue > 0 ? Math.round((icms / totalRevenue) * 100) : 0 },
      { type: 'IPI', amount: Math.round(ipi), percentage: totalRevenue > 0 ? Math.round((ipi / totalRevenue) * 100) : 0 },
      { type: 'PIS', amount: Math.round(pis), percentage: totalRevenue > 0 ? Math.round((pis / totalRevenue) * 100) : 0 },
      { type: 'COFINS', amount: Math.round(cofins), percentage: totalRevenue > 0 ? Math.round((cofins / totalRevenue) * 100) : 0 },
      { type: 'ISS', amount: Math.round(iss), percentage: totalRevenue > 0 ? Math.round((iss / totalRevenue) * 100) : 0 }
    ];

    console.log('💰 Resumo de impostos:', {
      totalRevenue,
      totalTaxes,
      byTypeCount: byType.length
    });

    return {
      title: 'Resumo de Impostos',
      period: `${params.startDate} a ${params.endDate}`,
      data: {
        totalTaxes: Math.round(totalTaxes),
        byType
      }
    };
  } catch (error) {
    console.error('Erro no resumo de impostos:', error);
    return {
      title: 'Resumo de Impostos',
      period: `${params.startDate} a ${params.endDate}`,
      data: {
        totalTaxes: 0,
        byType: []
      }
    };
  }
}

async function getNfeStatusData(params: any) {
  console.log('📊 Analisando status das NFes...');
  
  try {
    // Buscar dados reais de vendas para simular NFes baseadas em vendas
    const { data: salesData, error: salesError } = await supabaseAdmin
      .from('sales')
      .select('id, status, date')
      .in('status', ['Concluída', 'completed'])
      .gte('date', params.startDate || '2024-01-01')
      .lte('date', params.endDate || '2024-12-31');

    if (salesError) {
      console.error('❌ Erro ao buscar vendas para NFe status:', salesError);
      throw salesError;
    }

    const sales = salesData || [];
    const total = sales.length;
    
    // Calcular status baseado em vendas reais
    const authorized = Math.floor(total * 0.85); // 85% autorizadas
    const pending = Math.floor(total * 0.10);    // 10% pendentes
    const rejected = total - authorized - pending; // resto rejeitadas

    console.log('📊 Status das NFes:', {
      authorized,
      pending,
      rejected,
      total,
      basedOnSales: total
    });

    return {
      title: 'Status das NFes',
      period: `${params.startDate} a ${params.endDate}`,
      data: {
        authorized,
        pending,
        rejected,
        total
      }
    };
  } catch (error) {
    console.error('Erro no status das NFes:', error);
    return {
      title: 'Status das NFes',
      period: `${params.startDate} a ${params.endDate}`,
      data: {
        authorized: 0,
        pending: 0,
        rejected: 0,
        total: 0
      }
    };
  }
}

// Implementações para Dashboard
async function getKpiOverviewData(params: any) {
  console.log('📊 Analisando KPIs gerais...', { params });
  
  try {
    // Buscar dados reais com filtro de segmento
    let customersQuery = supabaseAdmin
      .from('partners')
      .select('id, partner_roles!inner(role)')
      .eq('partner_roles.role', 'customer')
      .eq('is_deleted', false);
    customersQuery = applySegmentFilter(customersQuery, params.segmentId);
    const { data: customersData } = await customersQuery;

    let salesQuery = supabaseAdmin
      .from('sales')
      .select('total, total_amount, date, sale_date, status')
      .eq('is_deleted', false)
      .in('status', ['Concluída', 'completed']);
    salesQuery = applySegmentFilter(salesQuery, params.segmentId);
    const { data: salesData } = await salesQuery;
    
    // Filtrar por data no código
    const startDate = params.startDate || '2024-01-01';
    const endDate = params.endDate || '2024-12-31';
    const filteredSales = (salesData || []).filter(sale => {
      const saleDate = sale.sale_date || sale.date;
      if (!saleDate) return false;
      return saleDate >= startDate && saleDate <= endDate;
    });

    const totalCustomers = customersData?.length || 0;
    const totalSales = filteredSales.length;
    const totalRevenue = filteredSales.reduce((sum, sale) => {
      const amount = parseFloat(sale.total_amount || sale.total || 0);
      return sum + amount;
    }, 0);
    const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

    console.log('📊 KPIs gerais:', {
      totalRevenue,
      totalCustomers,
      totalSales,
      averageTicket: averageTicket.toFixed(2)
    });

    return {
      title: 'Visão Geral de KPIs',
      period: `${params.startDate} a ${params.endDate}`,
      data: {
        totalRevenue,
        totalCustomers,
        totalSales,
        averageTicket: parseFloat(averageTicket.toFixed(2))
      }
    };
  } catch (error) {
    console.error('Erro nos KPIs gerais:', error);
    return {
      title: 'Visão Geral de KPIs',
      period: `${params.startDate} a ${params.endDate}`,
      data: {
        totalRevenue: 0,
        totalCustomers: 0,
        totalSales: 0,
        averageTicket: 0
      }
    };
  }
}

async function getExecutiveSummaryData(params: any) {
  console.log('📋 Gerando resumo executivo...', { params });
  
  try {
    // Buscar dados para o resumo com filtro de segmento
    let customersQuery = supabaseAdmin
      .from('partners')
      .select('id, status, partner_roles!inner(role)')
      .eq('partner_roles.role', 'customer')
      .eq('is_deleted', false);
    customersQuery = applySegmentFilter(customersQuery, params.segmentId);
    const { data: customersData } = await customersQuery;

    let salesQuery = supabaseAdmin
      .from('sales')
      .select('total, total_amount, status, date, sale_date')
      .eq('is_deleted', false)
      .in('status', ['Concluída', 'completed']);
    salesQuery = applySegmentFilter(salesQuery, params.segmentId);
    const { data: salesData } = await salesQuery;
    
    // Filtrar por data no código
    const startDate = params.startDate || '2024-01-01';
    const endDate = params.endDate || '2024-12-31';
    const filteredSales = (salesData || []).filter(sale => {
      const saleDate = sale.sale_date || sale.date;
      if (!saleDate) return false;
      return saleDate >= startDate && saleDate <= endDate;
    });

    const totalCustomers = customersData?.length || 0;
    const activeCustomers = customersData?.filter(c => c.status === 'active' || c.status === 'ativo').length || 0;
    const totalSales = filteredSales.length;
    const totalRevenue = filteredSales.reduce((sum, sale) => {
      const amount = parseFloat(sale.total_amount || sale.total || 0);
      return sum + amount;
    }, 0);

    const keyMetrics = {
      totalRevenue,
      totalCustomers,
      activeCustomers,
      totalSales,
      averageTicket: totalSales > 0 ? totalRevenue / totalSales : 0,
      customerRetention: totalCustomers > 0 ? (activeCustomers / totalCustomers) * 100 : 0
    };

    const recommendations = [
      'Aumentar o ticket médio através de estratégias de upselling',
      'Implementar programa de fidelidade para melhorar retenção',
      'Diversificar portfólio de produtos para aumentar receita',
      'Otimizar processos de vendas para melhorar conversão'
    ];

    console.log('📋 Resumo executivo:', {
      totalRevenue,
      totalCustomers,
      totalSales,
      recommendationsCount: recommendations.length
    });

    return {
      title: 'Resumo Executivo',
      period: `${params.startDate} a ${params.endDate}`,
      data: {
        summary: `Relatório executivo consolidado com ${totalCustomers} clientes e R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em receita.`,
        keyMetrics,
        recommendations
      }
    };
  } catch (error) {
    console.error('Erro no resumo executivo:', error);
    return {
      title: 'Resumo Executivo',
      period: `${params.startDate} a ${params.endDate}`,
      data: {
        summary: 'Relatório executivo consolidado',
        keyMetrics: {},
        recommendations: []
      }
    };
  }
}

// Implementações para Contas a Pagar
async function getPayablesAgingData(params: any) {
  console.log('📊 ===== INICIANDO getPayablesAgingData =====');
  console.log('📊 Parâmetros:', params);
  
  try {
    let data: any[] = [];
    
    // Buscar TODOS os dados primeiro (sem filtro de segmento) para debug
    console.log('🔍 Buscando TODOS os financial_documents (payable)...');
    const allFinancial = await supabaseAdmin
      .from('financial_documents')
      .select('id, amount, due_date, status, direction, segment_id')
      .eq('direction', 'payable')
      .limit(100);
    
    console.log('📊 Total financial_documents (payable):', allFinancial.data?.length || 0);
    if (allFinancial.data && allFinancial.data.length > 0) {
      console.log('📊 Amostra financial_documents:', allFinancial.data.slice(0, 3));
    }
    
    // Buscar TODOS os accounts_payable para debug
    console.log('🔍 Buscando TODOS os accounts_payable...');
    const allAccounts = await supabaseAdmin
      .from('accounts_payable')
      .select('id, valor, data_vencimento, status, segment_id')
      .limit(100);
    
    console.log('📊 Total accounts_payable:', allAccounts.data?.length || 0);
    if (allAccounts.data && allAccounts.data.length > 0) {
      console.log('📊 Amostra accounts_payable:', allAccounts.data.slice(0, 3));
    }
    
    // Agora buscar com filtro de segmento
    console.log('🔍 Buscando com filtro de segmento:', params.segmentId);
    
    // Tentar financial_documents primeiro
    let financialQuery = supabaseAdmin
      .from('financial_documents')
      .select('*')
      .eq('direction', 'payable');
    
    if (params.segmentId && params.segmentId !== 'null' && params.segmentId !== '0') {
      financialQuery = financialQuery.or(`segment_id.eq.${params.segmentId},segment_id.is.null`);
    }
    
    const financialResult = await financialQuery.order('due_date', { ascending: true });
    
    console.log('📊 Resultado com filtro financial_documents:', financialResult.data?.length || 0);
    
    if (financialResult.data && financialResult.data.length > 0) {
      // Filtrar contas pagas
      const filteredDocs = financialResult.data.filter((doc: any) => {
        const status = doc.status?.toLowerCase();
        return status !== 'paid' && status !== 'paga';
      });
      
      console.log(`📊 Após filtrar pagas: ${financialResult.data.length} -> ${filteredDocs.length}`);
      
      if (filteredDocs.length > 0) {
        data = filteredDocs.map((doc: any) => ({
          id: doc.id,
          valor: doc.amount,
          amount: doc.amount,
          data_vencimento: doc.due_date,
          due_date: doc.due_date,
          status: doc.status === 'paid' ? 'paga' : (doc.status === 'open' ? 'pendente' : doc.status),
          descricao: doc.description || doc.notes || '',
          segment_id: doc.segment_id,
          created_at: doc.created_at,
          updated_at: doc.updated_at
        }));
        console.log('✅ Usando dados de financial_documents:', data.length);
      }
    }
    
    // Se não encontrar, tentar accounts_payable
    if (data.length === 0) {
      console.log('⚠️ Tentando accounts_payable...');
      let query = supabaseAdmin
        .from('accounts_payable')
        .select('*');
      
      if (params.segmentId && params.segmentId !== 'null' && params.segmentId !== '0') {
        query = query.or(`segment_id.eq.${params.segmentId},segment_id.is.null`);
      }
      
      const result = await query.order('data_vencimento', { ascending: true });
      
      console.log('📊 Resultado accounts_payable:', result.data?.length || 0);
      
      if (result.data && result.data.length > 0) {
        data = result.data.filter((account: any) => {
          const status = account.status?.toLowerCase();
          return status !== 'paga' && status !== 'paid';
        });
        console.log(`📊 Após filtrar pagas: ${result.data.length} -> ${data.length}`);
      }
    }

    const accounts = data || [];
    console.log('📊 Contas encontradas:', {
      total: accounts.length,
      segmentId: params.segmentId,
      sample: accounts.slice(0, 2).map(a => ({
        id: a.id,
        valor: a.valor || a.amount,
        status: a.status,
        data_vencimento: a.data_vencimento || a.due_date,
        segment_id: a.segment_id
      }))
    });
    
    if (accounts.length === 0) {
      console.warn('⚠️ Nenhuma conta encontrada. Verificando se há dados sem filtro de segmento...');
      // Buscar sem filtro de segmento para debug
      const debugQuery = await supabaseAdmin
        .from('accounts_payable')
        .select('id, valor, status, data_vencimento, segment_id')
        .limit(5);
      console.log('🔍 Debug - Total sem filtro:', debugQuery.data?.length || 0, debugQuery.data);
    }
    
    const now = new Date();
    
    // Inicializar contadores e valores
    let current = 0;
    let currentAmount = 0;
    let overdue30 = 0;
    let overdue30Amount = 0;
    let overdue60 = 0;
    let overdue60Amount = 0;
    let overdue90 = 0;
    let overdue90Amount = 0;
    let totalAmount = 0;
    let overdueCount = 0;
    let overdueAmount = 0;
    let upcomingCount = 0;
    let upcomingAmount = 0;

    accounts.forEach(account => {
      // Usar data_vencimento ou due_date
      const dueDateStr = account.data_vencimento || account.due_date;
      if (!dueDateStr) return;
      
      const valor = parseFloat(account.valor || account.amount || 0);
      totalAmount += valor;
      
      const dueDate = new Date(dueDateStr);
      
      if (dueDate >= now) {
        // Contas a vencer
        current++;
        currentAmount += valor;
        upcomingCount++;
        upcomingAmount += valor;
      } else {
        // Contas vencidas
        overdueCount++;
        overdueAmount += valor;
        
        const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysOverdue <= 30) {
          overdue30++;
          overdue30Amount += valor;
        } else if (daysOverdue <= 60) {
          overdue60++;
          overdue60Amount += valor;
        } else {
          overdue90++;
          overdue90Amount += valor;
        }
      }
    });

    console.log('📊 Aging de contas a pagar:', {
      total: accounts.length,
      totalAmount,
      current,
      currentAmount,
      overdueCount,
      overdueAmount,
      overdue30,
      overdue30Amount,
      overdue60,
      overdue60Amount,
      overdue90,
      overdue90Amount
    });

    return {
      title: 'Aging de Contas a Pagar',
      period: `${params.startDate} a ${params.endDate}`,
      data: {
        // Formato para o frontend (aging-analysis)
        totalAmount,
        overdueCount,
        overdueAmount,
        upcomingCount,
        upcomingAmount,
        // Formato detalhado (aging)
        current,
        currentAmount,
        overdue30,
        overdue30Amount,
        overdue60,
        overdue60Amount,
        overdue90,
        overdue90Amount,
        total: accounts.length,
        // Detalhamento por faixa
        aging: [
          { label: 'A Vencer', count: current, amount: currentAmount },
          { label: '0-30 dias', count: overdue30, amount: overdue30Amount },
          { label: '31-60 dias', count: overdue60, amount: overdue60Amount },
          { label: 'Mais de 60 dias', count: overdue90, amount: overdue90Amount }
        ]
      }
    };
  } catch (error) {
    console.error('❌ Erro ao calcular aging de contas a pagar:', error);
    return {
      title: 'Aging de Contas a Pagar',
      period: `${params.startDate} a ${params.endDate}`,
      data: {
        totalAmount: 0,
        overdueCount: 0,
        overdueAmount: 0,
        upcomingCount: 0,
        upcomingAmount: 0,
        current: 0,
        currentAmount: 0,
        overdue30: 0,
        overdue30Amount: 0,
        overdue60: 0,
        overdue60Amount: 0,
        overdue90: 0,
        overdue90Amount: 0,
        total: 0,
        aging: []
      }
    };
  }
}

async function getSupplierPaymentsData(params: any) {
  console.log('📊 Analisando pagamentos por fornecedor...', { params });
  
  try {
    let query = supabaseAdmin
      .from('accounts_payable')
      .select(`
        *,
        partner:partners(name, id)
      `)
      .eq('status', 'paga');
    
    query = applySegmentFilter(query, params.segmentId);
    
    // Filtrar por período se fornecido
    const startDate = params.startDate;
    const endDate = params.endDate;
    if (startDate && endDate) {
      // Filtrar por data_pagamento se existir
      query = query.gte('data_pagamento', startDate).lte('data_pagamento', endDate);
    }
    
    const { data, error } = await query.order('updated_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar pagamentos por fornecedor:', error);
      throw error;
    }

    const payments = data || [];
    
    // Agrupar por fornecedor
    const supplierPayments: Record<string, any> = {};
    
    payments.forEach(payment => {
      const supplierId = payment.partner_id || payment.supplier_id || 'sem-fornecedor';
      const supplierName = payment.partner?.name || payment.supplier?.name || payment.fornecedor_nome || 'Fornecedor não identificado';
      
      if (!supplierPayments[supplierId]) {
        supplierPayments[supplierId] = {
          supplier_id: supplierId,
          supplier_name: supplierName,
          total_amount: 0,
          payment_count: 0,
          last_payment: null,
          payments: []
        };
      }
      
      supplierPayments[supplierId].total_amount += parseFloat(payment.valor || payment.amount || 0) || 0;
      supplierPayments[supplierId].payment_count++;
      supplierPayments[supplierId].last_payment = payment.data_pagamento || payment.payment_date || payment.updated_at;
      supplierPayments[supplierId].payments.push({
        id: payment.id,
        amount: payment.valor || payment.amount,
        description: payment.descricao || payment.description,
        payment_date: payment.data_pagamento || payment.payment_date || payment.updated_at
      });
    });

    const result = Object.values(supplierPayments).sort((a: any, b: any) => b.total_amount - a.total_amount);

    console.log('📊 Pagamentos por fornecedor:', {
      totalSuppliers: result.length,
      totalAmount: result.reduce((sum: number, s: any) => sum + s.total_amount, 0)
    });

    return {
      title: 'Pagamentos por Fornecedor',
      period: `${params.startDate} a ${params.endDate}`,
      data: result
    };
  } catch (error) {
    console.error('❌ Erro ao calcular pagamentos por fornecedor:', error);
    return {
      title: 'Pagamentos por Fornecedor',
      period: `${params.startDate} a ${params.endDate}`,
      data: []
    };
  }
}

async function getOverdueBillsData(params: any) {
  console.log('📊 Analisando contas em atraso...', { params });
  
  try {
    let query = supabaseAdmin
      .from('accounts_payable')
      .select(`
        *,
        partner:partners(name, id)
      `)
      .neq('status', 'paga');
    
    query = applySegmentFilter(query, params.segmentId);
    
    const { data, error } = await query.order('data_vencimento', { ascending: true });

    if (error) {
      console.error('Erro ao buscar contas em atraso:', error);
      throw error;
    }

    const accounts = data || [];
    const now = new Date();
    
    // Filtrar apenas contas vencidas
    const overdueAccounts = accounts.filter(account => {
      const dueDateStr = account.data_vencimento || account.due_date;
      if (!dueDateStr) return false;
      const dueDate = new Date(dueDateStr);
      return dueDate < now;
    });

    // Calcular dias de atraso
    const overdueWithDays = overdueAccounts.map(account => {
      const dueDateStr = account.data_vencimento || account.due_date;
      const dueDate = new Date(dueDateStr);
      const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        ...account,
        days_overdue: daysOverdue,
        supplier_name: account.partner?.name || account.fornecedor_nome || 'Fornecedor não identificado',
        valor: account.valor || account.amount || 0,
        descricao: account.descricao || account.description || ''
      };
    });

    // Ordenar por dias de atraso (maior atraso primeiro)
    overdueWithDays.sort((a, b) => b.days_overdue - a.days_overdue);

    console.log('📊 Contas em atraso:', {
      totalOverdue: overdueWithDays.length,
      totalAmount: overdueWithDays.reduce((sum, account) => sum + (parseFloat(account.valor) || 0), 0)
    });

    return {
      title: 'Contas em Atraso',
      period: `${params.startDate} a ${params.endDate}`,
      data: overdueWithDays
    };
  } catch (error) {
    console.error('❌ Erro ao calcular contas em atraso:', error);
    return {
      title: 'Contas em Atraso',
      period: `${params.startDate} a ${params.endDate}`,
      data: []
    };
  }
}

// Implementações para Cobranças
async function getReceivablesAgingData(params: any) {
  console.log('📊 Analisando aging de contas a receber...');
  
  const { data, error } = await supabaseAdmin
    .from('financial_documents')
    .select('*')
    .eq('direction', 'receivable')
    .order('due_date', { ascending: true });

  if (error) {
    console.error('Erro ao buscar contas a receber para aging:', error);
    throw error;
  }

  const accounts = data || [];
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  let current = 0;
  let overdue30 = 0;
  let overdue60 = 0;
  let overdue90 = 0;

  accounts.forEach(account => {
    if (account.due_date) {
      const dueDate = new Date(account.due_date);
      if (account.status === 'paid') return; // Pular contas pagas
      
      if (dueDate >= now) {
        current++;
      } else if (dueDate >= thirtyDaysAgo) {
        overdue30++;
      } else if (dueDate >= sixtyDaysAgo) {
        overdue60++;
      } else {
        overdue90++;
      }
    }
  });

  console.log('📊 Aging de contas a receber:', {
    current,
    overdue30,
    overdue60,
    overdue90
  });

  return {
    title: 'Aging de Contas a Receber',
    period: `${params.startDate} a ${params.endDate}`,
    data: {
      current,
      overdue30,
      overdue60,
      overdue90
    }
  };
}

async function getCollectionEfficiencyData(params: any) {
  console.log('📊 Analisando eficiência de cobrança...');
  
  const { data, error } = await supabaseAdmin
    .from('financial_documents')
    .select('*')
    .eq('direction', 'receivable');

  if (error) {
    console.error('Erro ao buscar dados de cobrança:', error);
    throw error;
  }

  const accounts = data || [];
  const totalAccounts = accounts.length;
  const paidAccounts = accounts.filter(account => account.status === 'paid').length;
  const overdueAccounts = accounts.filter(account => {
    if (!account.due_date || account.status === 'paid') return false;
    const dueDate = new Date(account.due_date);
    return dueDate < new Date();
  }).length;

  const efficiency = totalAccounts > 0 ? (paidAccounts / totalAccounts) * 100 : 0;
  const successRate = totalAccounts > 0 ? ((totalAccounts - overdueAccounts) / totalAccounts) * 100 : 0;

  console.log('📊 Eficiência de cobrança:', {
    totalAccounts,
    paidAccounts,
    overdueAccounts,
    efficiency: efficiency.toFixed(2),
    successRate: successRate.toFixed(2)
  });

  return {
    title: 'Eficiência de Cobrança',
    period: `${params.startDate} a ${params.endDate}`,
    data: {
      efficiency: parseFloat(efficiency.toFixed(2)),
      successRate: parseFloat(successRate.toFixed(2)),
      totalAccounts,
      paidAccounts,
      overdueAccounts
    }
  };
}

async function getCustomerReceivablesData(params: any) {
  console.log('📊 Analisando recebíveis por cliente...');
  
  const { data, error } = await supabaseAdmin
    .from('financial_documents')
    .select(`
      *,
      partner:partners(name, id)
    `)
    .eq('direction', 'receivable')
    .neq('status', 'paid')
    .order('due_date', { ascending: true });

  if (error) {
    console.error('Erro ao buscar recebíveis por cliente:', error);
    throw error;
  }

  const accounts = data || [];
  
  // Agrupar por cliente
  const customerReceivables: Record<string, any> = {};
  
  accounts.forEach(account => {
    const customerId = account.partner_id || 'sem-cliente';
    const customerName = account.partner?.name || 'Cliente não identificado';
    
    if (!customerReceivables[customerId]) {
      customerReceivables[customerId] = {
        customer_id: customerId,
        customer_name: customerName,
        total_amount: 0,
        account_count: 0,
        oldest_due_date: null,
        accounts: []
      };
    }
    
    customerReceivables[customerId].total_amount += parseFloat(account.amount) || 0;
    customerReceivables[customerId].account_count++;
    
    if (!customerReceivables[customerId].oldest_due_date || 
        new Date(account.due_date) < new Date(customerReceivables[customerId].oldest_due_date)) {
      customerReceivables[customerId].oldest_due_date = account.due_date;
    }
    
    customerReceivables[customerId].accounts.push({
      id: account.id,
      amount: account.amount,
      description: account.description,
      due_date: account.due_date,
      status: account.status
    });
  });

  const result = Object.values(customerReceivables).sort((a: any, b: any) => b.total_amount - a.total_amount);

  console.log('📊 Recebíveis por cliente:', {
    totalCustomers: result.length,
    totalAmount: result.reduce((sum: number, c: any) => sum + c.total_amount, 0)
  });

  return {
    title: 'Recebíveis por Cliente',
    period: `${params.startDate} a ${params.endDate}`,
    data: result
  };
}

// Implementações para Estoque
async function getStockLevelsData(params: any) {
  console.log('📊 Analisando níveis de estoque...');
  
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('is_deleted', false)
    .order('name', { ascending: true });

  if (error) {
    console.error('Erro ao buscar produtos para níveis de estoque:', error);
    throw error;
  }

  const products = data || [];
  
  // Calcular status do estoque
  const productsWithStatus = products.map(product => {
    const currentStock = product.stock_quantity || 0;
    const minStock = product.minimum_stock || product.min_stock || 0;
    
    let status = 'normal';
    if (currentStock === 0) {
      status = 'out_of_stock';
    } else if (currentStock <= minStock) {
      status = 'low_stock';
    }
    
    return {
      ...product,
      status,
      stock_percentage: minStock > 0 ? (currentStock / minStock) * 100 : 100
    };
  });

  console.log('📊 Níveis de estoque:', {
    totalProducts: products.length,
    outOfStock: productsWithStatus.filter(p => p.status === 'out_of_stock').length,
    lowStock: productsWithStatus.filter(p => p.status === 'low_stock').length,
    normalStock: productsWithStatus.filter(p => p.status === 'normal').length
  });

  return {
    title: 'Níveis de Estoque',
    period: `${params.startDate} a ${params.endDate}`,
    data: productsWithStatus
  };
}

async function getStockMovementData(params: any) {
  console.log('📊 Analisando movimentação de estoque...');
  
  // Buscar vendas para calcular saídas
  const { data: salesData, error: salesError } = await supabaseAdmin
    .from('sales')
    .select(`
      *,
      items:sale_items(
        product_id,
        quantity,
        unit_price,
        total_price
      )
    `)
    .eq('is_deleted', false)
    .in('status', ['Concluída', 'completed']);

  if (salesError) {
    console.error('Erro ao buscar vendas para movimentação:', salesError);
    throw salesError;
  }

  const sales = salesData || [];
  
  // Calcular saídas (vendas)
  let totalExits = 0;
  let totalExitValue = 0;
  
  sales.forEach(sale => {
    if (sale.items && Array.isArray(sale.items)) {
      sale.items.forEach((item: any) => {
        totalExits += item.quantity || 0;
        totalExitValue += parseFloat(item.total_price) || 0;
      });
    } else {
      // Para vendas antigas sem items
      totalExits += sale.quantity || 0;
      totalExitValue += parseFloat(sale.total) || 0;
    }
  });

  // Buscar produtos para calcular entradas (assumindo que entradas são ajustes manuais)
  const { data: productsData, error: productsError } = await supabaseAdmin
    .from('products')
    .select('stock_quantity, price')
    .eq('is_deleted', false);

  if (productsError) {
    console.error('Erro ao buscar produtos para movimentação:', productsError);
    throw productsError;
  }

  const products = productsData || [];
  
  // Calcular entradas (estoque atual - saídas)
  let totalEntries = 0;
  let totalEntryValue = 0;
  
  products.forEach(product => {
    const currentStock = product.stock_quantity || 0;
    totalEntries += currentStock;
    totalEntryValue += currentStock * (parseFloat(product.price) || 0);
  });

  const balance = totalEntries - totalExits;
  const balanceValue = totalEntryValue - totalExitValue;

  console.log('📊 Movimentação de estoque:', {
    entries: totalEntries,
    exits: totalExits,
    balance,
    entryValue: totalEntryValue,
    exitValue: totalExitValue,
    balanceValue
  });

  return {
    title: 'Movimentação de Estoque',
    period: `${params.startDate} a ${params.endDate}`,
    data: {
      entries: totalEntries,
      exits: totalExits,
      balance,
      entryValue: totalEntryValue,
      exitValue: totalExitValue,
      balanceValue
    }
  };
}

async function getAbcAnalysisData(params: any) {
  console.log('📊 Analisando classificação ABC...');
  
  // Buscar vendas para calcular valor por produto
  const { data: salesData, error: salesError } = await supabaseAdmin
    .from('sales')
    .select(`
      *,
      items:sale_items(
        product_id,
        quantity,
        unit_price,
        total_price
      )
    `)
    .eq('is_deleted', false)
    .in('status', ['Concluída', 'completed']);

  if (salesError) {
    console.error('Erro ao buscar vendas para análise ABC:', salesError);
    throw salesError;
  }

  const sales = salesData || [];
  
  // Calcular valor total por produto
  const productValues: Record<string, number> = {};
  
  sales.forEach(sale => {
    if (sale.items && Array.isArray(sale.items)) {
      sale.items.forEach((item: any) => {
        const productId = item.product_id || 'unknown';
        productValues[productId] = (productValues[productId] || 0) + (parseFloat(item.total_price) || 0);
      });
    } else {
      // Para vendas antigas sem items
      const productId = sale.product || 'unknown';
      productValues[productId] = (productValues[productId] || 0) + (parseFloat(sale.total) || 0);
    }
  });

  // Ordenar produtos por valor
  const sortedProducts = Object.entries(productValues)
    .map(([productId, value]) => ({ productId, value }))
    .sort((a, b) => b.value - a.value);

  const totalValue = sortedProducts.reduce((sum, p) => sum + p.value, 0);
  
  // Classificar em ABC (80-15-5)
  let cumulativeValue = 0;
  const categoryA: any[] = [];
  const categoryB: any[] = [];
  const categoryC: any[] = [];

  sortedProducts.forEach(product => {
    cumulativeValue += product.value;
    const percentage = (cumulativeValue / totalValue) * 100;
    
    if (percentage <= 80) {
      categoryA.push(product);
    } else if (percentage <= 95) {
      categoryB.push(product);
    } else {
      categoryC.push(product);
    }
  });

  console.log('📊 Análise ABC:', {
    totalProducts: sortedProducts.length,
    totalValue,
    categoryA: categoryA.length,
    categoryB: categoryB.length,
    categoryC: categoryC.length
  });

  return {
    title: 'Análise ABC',
    period: `${params.startDate} a ${params.endDate}`,
    data: {
      categoryA: categoryA.length,
      categoryB: categoryB.length,
      categoryC: categoryC.length,
      totalProducts: sortedProducts.length,
      totalValue,
      products: {
        A: categoryA,
        B: categoryB,
        C: categoryC
      }
    }
  };
}

async function getLowStockAlertData(params: any) {
  console.log('📊 Analisando produtos com estoque baixo...');
  
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('is_deleted', false)
    .order('name', { ascending: true });

  if (error) {
    console.error('Erro ao buscar produtos para alerta de estoque baixo:', error);
    throw error;
  }

  const products = data || [];
  
  // Filtrar produtos com estoque baixo ou zerado
  const lowStockProducts = products.filter(product => {
    const currentStock = product.stock_quantity || 0;
    const minStock = product.minimum_stock || product.min_stock || 0;
    
    return currentStock <= minStock;
  });

  // Adicionar informações de urgência
  const productsWithUrgency = lowStockProducts.map(product => {
    const currentStock = product.stock_quantity || 0;
    const minStock = product.minimum_stock || product.min_stock || 0;
    
    let urgency = 'low';
    if (currentStock === 0) {
      urgency = 'critical';
    } else if (currentStock <= minStock * 0.5) {
      urgency = 'high';
    }
    
    return {
      ...product,
      urgency,
      days_remaining: minStock > 0 ? Math.floor((currentStock / minStock) * 30) : 0
    };
  });

  // Ordenar por urgência e estoque
  productsWithUrgency.sort((a, b) => {
    const urgencyOrder = { critical: 3, high: 2, low: 1 };
    const aUrgency = urgencyOrder[a.urgency as keyof typeof urgencyOrder] || 0;
    const bUrgency = urgencyOrder[b.urgency as keyof typeof urgencyOrder] || 0;
    
    if (aUrgency !== bUrgency) {
      return bUrgency - aUrgency;
    }
    
    return (a.stock_quantity || 0) - (b.stock_quantity || 0);
  });

  console.log('📊 Produtos com estoque baixo:', {
    totalProducts: products.length,
    lowStockProducts: lowStockProducts.length,
    critical: productsWithUrgency.filter(p => p.urgency === 'critical').length,
    high: productsWithUrgency.filter(p => p.urgency === 'high').length,
    low: productsWithUrgency.filter(p => p.urgency === 'low').length
  });

  return {
    title: 'Produtos com Estoque Baixo',
    period: `${params.startDate} a ${params.endDate}`,
    data: productsWithUrgency
  };
}
