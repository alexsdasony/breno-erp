export const calculateMetrics = (data, segmentId = null) => {
  
  // Corrigir filtro por segmento - lidar com ambos os nomes de campo
  const filterBySegment = (item) => {
    // Se não há segmento ativo ou é "Todos os Segmentos" (0), incluir todas
    if (!segmentId || segmentId === 0) {
      return true;
    }
    // Se há segmento ativo, incluir apenas itens do segmento específico
    // Lidar com ambos os nomes de campo (segment_id do backend e segmentId do frontend)
    const itemSegmentId = item.segmentId || item.segment_id;
    return itemSegmentId === segmentId;
  };

  // Safe array access with fallbacks
  const transactions = (data.transactions || []).filter(filterBySegment);
  const products = (data.products || []).filter(filterBySegment);
  const sales = (data.sales || []).filter(filterBySegment);
  const billings = (data.billings || []).filter(filterBySegment);
  const nfeList = (data.nfeList || []).filter(filterBySegment);
  
  const totalRevenue = transactions
    .filter(t => t.type === 'receita')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'despesa')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock <= p.minStock).length;
  const totalSales = sales.length;
  
  const customerIdsFromSales = new Set(sales.map(s => s.customerId));
  const totalCustomers = segmentId && segmentId !== 0 ? customerIdsFromSales.size : (data.customers || []).length;

  const totalNFe = nfeList.length;

  const totalBillings = billings.length;
  const overdueBillings = billings.filter(b => b.status === 'Vencida').length;
  const defaultRate = totalBillings > 0 ? (overdueBillings / totalBillings) * 100 : 0;
  const totalPendingAmount = billings
    .filter(b => b.status === 'Pendente' || b.status === 'Vencida')
    .reduce((sum, b) => sum + Number(b.amount || 0), 0);

  return {
    totalRevenue,
    totalExpenses,
    profit: totalRevenue - totalExpenses,
    totalProducts,
    lowStockProducts,
    totalSales,
    totalCustomers,
    totalNFe,
    totalBillings,
    overdueBillings,
    defaultRate,
    totalPendingAmount
  };
};