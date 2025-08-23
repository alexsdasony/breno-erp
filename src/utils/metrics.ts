export interface MetricsData {
  transactions: any[];
  products: any[];
  sales: any[];
  customers: any[];
  billings: any[];
  [key: string]: any[];
}

export const calculateMetrics = (data: MetricsData, segmentId: number | null = null) => {
  const { transactions, products, sales, customers, billings } = data;

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

  // Cálculo de receitas
  const totalRevenue = filteredTransactions
    .filter((t: any) => t.type === 'receita')
    .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);

  // Cálculo de despesas
  const totalExpenses = filteredTransactions
    .filter((t: any) => t.type === 'despesa')
    .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);

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
    netIncome: totalRevenue - totalExpenses,
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