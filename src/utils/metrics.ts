export interface MetricsData {
  transactions: any[];
  products: any[];
  sales: any[];
  customers: any[];
  billings: any[];
  accountsPayable: any[];
  accountsReceivable: any[];
  financialDocuments: any[];
  [key: string]: any[];
}

export const calculateMetrics = (data: MetricsData, segmentId: number | null = null) => {
  const { transactions, products, sales, customers, billings, accountsPayable = [], accountsReceivable = [], financialDocuments = [] } = data;

  // Função para filtrar por segmento
  const filterBySegment = (item: any) => {
    if (!segmentId) return true;
    return item.segment_id === segmentId;
  };

  // Filtrar dados por segmento
  const filteredTransactions = transactions.filter(filterBySegment);
  const filteredProducts = products.filter(filterBySegment);
  const filteredSales = sales.filter(filterBySegment);
  const filteredCustomers = customers.filter(filterBySegment);
  const filteredBillings = billings.filter(filterBySegment);
  const filteredAccountsPayable = accountsPayable.filter(filterBySegment);
  const filteredAccountsReceivable = accountsReceivable.filter(filterBySegment);
  const filteredFinancialDocuments = financialDocuments.filter(filterBySegment);

  // Cálculo de receitas (financial_documents com direction='receivable')
  const totalRevenue = filteredFinancialDocuments
    .filter((fd: any) => fd.direction === 'receivable')
    .reduce((sum: number, fd: any) => sum + Number(fd.amount || 0), 0);

  // Cálculo de despesas (financial_documents com direction='payable')
  const totalExpenses = filteredFinancialDocuments
    .filter((fd: any) => fd.direction === 'payable')
    .reduce((sum: number, fd: any) => sum + Number(fd.amount || 0), 0);

  // Debug logs
  console.log('🔍 [METRICS DEBUG] Financial Documents:', {
    total: filteredFinancialDocuments.length,
    receivables: filteredFinancialDocuments.filter((fd: any) => fd.direction === 'receivable').length,
    payables: filteredFinancialDocuments.filter((fd: any) => fd.direction === 'payable').length,
    totalRevenue,
    totalExpenses,
    netProfit: totalRevenue - totalExpenses
  });

  // Lucro (Receita - Despesas)
  const netProfit = totalRevenue - totalExpenses;

  // Produtos com estoque baixo
  const lowStockProducts = filteredProducts.filter((p: any) => p.stock <= p.minStock).length;

  // Clientes únicos
  const customerIdsFromSales = new Set(filteredSales.map((s: any) => s.customerId));
  const uniqueCustomers = customerIdsFromSales.size;

  // Faturas vencidas
  const overdueBillings = filteredBillings.filter((b: any) => b.status === 'Vencida').length;

  // Total de faturas pendentes
  const pendingBillingsAmount = filteredBillings
    .filter((b: any) => b.status === 'Pendente' || b.status === 'Vencida')
    .reduce((sum: number, b: any) => sum + Number(b.amount || 0), 0);

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    lowStockProducts,
    uniqueCustomers,
    overdueBillings,
    pendingBillingsAmount,
    totalTransactions: filteredTransactions.length,
    totalProducts: filteredProducts.length,
    totalSales: filteredSales.length,
    totalBillings: filteredBillings.length,
  };
};