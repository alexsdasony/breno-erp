'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Package, 
  ShoppingCart,
  BarChart3,
  Activity,
  Calendar,
  Target,
  Award,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppData } from '@/hooks/useAppData';
import { formatCurrency } from '@/lib/utils.js';

const DashboardModule = () => {
  const { data, activeSegmentId, reloadDashboardData, metrics } = useAppData();

  useEffect(() => {
<<<<<<< HEAD
    // Buscar dados do backend filtrando por segmento
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Enviar segmentId apenas se for válido, senão enviar null para "todos os segmentos"
        const segmentId = activeSegmentId && activeSegmentId !== 0 ? activeSegmentId : null;
        const params = segmentId ? { segmentId } : {};
        console.log('🔍 Dashboard - Buscando dados para segmento:', segmentId);
        const result = await apiService.get('/dashboard', params);
        setDashboardData(result);
        console.log('✅ Dashboard - Dados recebidos:', result);
      } catch (error) {
        console.error('❌ Dashboard - Erro ao buscar dados:', error);
        setDashboardData(null);
      } finally {
        setLoading(false);
      }
    };
    
    // Forçar carregamento imediato
    fetchDashboardData();
  }, [activeSegmentId]);
=======
    const loadData = async () => {
      await reloadDashboardData(activeSegmentId);
    };
    loadData();
  }, [activeSegmentId, reloadDashboardData]);
>>>>>>> 8d8b27b5651436ba0f6f11b7ab9cc5b22b8662b6

  const dashboardMetrics = [
    {
      title: 'Receita Total',
      value: formatCurrency(metrics?.totalRevenue || 0),
      change: '+12.5%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/20'
    },
    {
      title: 'Vendas',
      value: metrics?.totalSales || 0,
      change: '+8.2%',
      changeType: 'positive',
      icon: ShoppingCart,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/20'
    },
    {
      title: 'Clientes',
      value: metrics?.totalCustomers || 0,
      change: '+15.3%',
      changeType: 'positive',
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/20'
    },
    {
      title: 'Produtos',
      value: metrics?.totalProducts || 0,
      change: '+5.7%',
      changeType: 'positive',
      icon: Package,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/20'
    }
  ];

<<<<<<< HEAD
  // Aplicar a mesma lógica de filtros do BillingModule
  let filteredBillings = (data.billings || [])
    .map(billing => ({ ...billing, status: getStatusWithDueDate(billing) }))
    .filter(b => !activeSegmentId || activeSegmentId === 0 || b.segment_id === activeSegmentId);

  // Cálculos usando a mesma lógica do módulo de cobranças
  const totalBillings = filteredBillings.length;
  const overdueBillings = filteredBillings.filter(b => b.status === 'Vencida').length;
  const defaultRate = totalBillings > 0 ? (overdueBillings / totalBillings) * 100 : 0;
  const totalPendingAmount = filteredBillings
    .filter(b => b.status === 'Pendente' || b.status === 'Vencida')
    .reduce((sum, b) => sum + Number(b.amount || 0), 0);

  // Calcular métricas gerais (sem filtro de segmento) para comparação
  const generalMetrics = calculateMetrics(data, 0);
  const filteredMetrics = calculateMetrics(data, activeSegmentId);

  // Obter nome do segmento ativo
  const activeSegment = (data.segments || []).find(s => s.id === activeSegmentId);
=======
  const recentTransactions = data.transactions?.slice(0, 5) || [];
  const recentSales = data.sales?.slice(0, 5) || [];
>>>>>>> 8d8b27b5651436ba0f6f11b7ab9cc5b22b8662b6

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">Visão geral do seu negócio</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Hoje
          </Button>
          <Button variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            Relatórios
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardMetrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-effect rounded-xl p-6 gradient-card border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{metric.title}</p>
                <p className="text-2xl font-bold">{metric.value}</p>
                <div className="flex items-center mt-2">
                  {metric.changeType === 'positive' ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${metric.changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`}>
                    {metric.change}
                  </span>
                </div>
              </div>
              <div className={`w-12 h-12 ${metric.bgColor} rounded-lg flex items-center justify-center`}>
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Gráficos e Tabelas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transações Recentes */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-effect rounded-xl p-6 border"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Transações Recentes</h3>
            <Button variant="outline" size="sm">
              Ver Todas
            </Button>
          </div>
          <div className="space-y-3">
            {recentTransactions.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Nenhuma transação recente</p>
            ) : (
              recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <Activity className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">{transaction.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-sm text-muted-foreground">{transaction.date}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Vendas Recentes */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-effect rounded-xl p-6 border"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Vendas Recentes</h3>
            <Button variant="outline" size="sm">
              Ver Todas
            </Button>
          </div>
          <div className="space-y-3">
            {recentSales.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Nenhuma venda recente</p>
            ) : (
              recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                      <ShoppingCart className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{sale.customer_name}</p>
                      <p className="text-sm text-muted-foreground">{sale.payment_method}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-500">{formatCurrency(sale.final_amount)}</p>
                    <p className="text-sm text-muted-foreground">{sale.sale_date}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Ações Rápidas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-effect rounded-xl p-6 border"
      >
        <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button className="bg-gradient-to-r from-blue-500 to-purple-600">
            <Users className="w-4 h-4 mr-2" />
            Novo Cliente
          </Button>
          <Button className="bg-gradient-to-r from-green-500 to-blue-600">
            <Package className="w-4 h-4 mr-2" />
            Novo Produto
          </Button>
          <Button className="bg-gradient-to-r from-purple-500 to-pink-600">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Nova Venda
          </Button>
          <Button className="bg-gradient-to-r from-orange-500 to-red-600">
            <DollarSign className="w-4 h-4 mr-2" />
            Nova Transação
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default DashboardModule;
