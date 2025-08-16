// TODO: futuro → trocar mocks por services reais (supabase functions)

import { useState, useEffect } from 'react';
import {
  salesLast12Months,
  receivablesByStatus,
  payablesNext30d,
  topCustomers,
  lowStockProducts,
  segmentsShare,
  conversionFunnel,
} from '../mocks/dashboard.mock.js';

export const useDashboardMock = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      // Simular delay de carregamento
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Calcular KPIs
      const currentMonth = salesLast12Months[salesLast12Months.length - 1];
      const previousMonth = salesLast12Months[salesLast12Months.length - 2];
      
      const revenueMTD = currentMonth.revenue;
      const revenueLastMonth = previousMonth.revenue;
      const mtdDelta = ((revenueMTD - revenueLastMonth) / revenueLastMonth) * 100;
      
      const openReceivables = receivablesByStatus.find(r => r.status === 'Aberto')?.amount || 0;
      const overdueReceivables = receivablesByStatus.find(r => r.status === 'Vencido')?.amount || 0;
      
      const ordersMTD = currentMonth.orders;
      const avgTicketMTD = currentMonth.ticket;
      
      // Preparar séries para gráficos
      const areaRevenueSeries = salesLast12Months.map(item => ({
        month: item.month,
        revenue: item.revenue,
      }));
      
      const barOrdersSeries = salesLast12Months.map(item => ({
        month: item.month,
        orders: item.orders,
      }));
      
      const pieSegmentsSeries = segmentsShare.map(item => ({
        name: item.segment,
        value: item.revenue,
      }));
      
      const funnelSeries = conversionFunnel.map(item => ({
        name: item.stage,
        value: item.value,
      }));
      
      // Ordenar produtos por estoque crítico
      const sortedLowStockProducts = [...lowStockProducts].sort(
        (a, b) => (a.stock - a.minStock) - (b.stock - b.minStock)
      );
      
      setData({
        revenueMTD,
        revenueLastMonth,
        mtdDelta,
        openReceivables,
        overdueReceivables,
        ordersMTD,
        avgTicketMTD,
        areaRevenueSeries,
        barOrdersSeries,
        pieSegmentsSeries,
        funnelSeries,
        topCustomers,
        lowStockProducts: sortedLowStockProducts,
        receivablesByStatus,
        payablesNext30d,
      });
      
      setLoading(false);
    };
    
    loadData();
  }, []);

  return { data, loading };
};
