import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Download,
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  Users,
  AlertTriangle,
  FileSpreadsheet,
  CreditCard,
  Clock,
  DollarSign,
  Send,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppData } from '@/hooks/useAppData.jsx';
import { formatCurrency } from '@/lib/utils.js';
import { formatDate } from '@/lib/utils.js';

const DashboardModule = ({ metrics, setActiveModule }) => {
  const { data, activeSegmentId } = useAppData();

  // Reactivated segment filtering - problem was data.segments access fixed
  const filteredProducts = (data.products || []).filter(p => !activeSegmentId || activeSegmentId === 0 || p.segmentId === activeSegmentId);
  const filteredNFeList = (data.nfeList || []).filter(n => !activeSegmentId || activeSegmentId === 0 || n.segmentId === activeSegmentId);

  // Função para calcular status dinâmico baseado na data de vencimento (mesma lógica do BillingModule)
  function getStatusWithDueDate(billing) {
    if (billing.status === 'Pendente') {
      const dueStr = billing.dueDate || billing.due_date;
      if (!dueStr) return billing.status;
      const due = new Date(dueStr);
      if (isNaN(due.getTime())) return billing.status;
      const today = new Date();
      today.setHours(0,0,0,0);
      if (due < today) {
        return 'Vencida';
      }
    }
    return billing.status;
  }

  // Aplicar a mesma lógica de filtros do BillingModule
  let filteredBillings = (data.billings || [])
    .map(billing => ({ ...billing, status: getStatusWithDueDate(billing) }))
    .filter(b => !activeSegmentId || activeSegmentId === 0 || b.segmentId === activeSegmentId);

  // Cálculos usando a mesma lógica do módulo de cobranças
  const totalBillings = filteredBillings.length;
  const overdueBillings = filteredBillings.filter(b => b.status === 'Vencida').length;
  const defaultRate = totalBillings > 0 ? (overdueBillings / totalBillings) * 100 : 0;
  const totalPendingAmount = filteredBillings
    .filter(b => b.status === 'Pendente' || b.status === 'Vencida')
    .reduce((sum, b) => sum + Number(b.amount || 0), 0);

  // Cálculos para NF-e
  const totalNFe = filteredNFeList.length;
  const nfeEmitidas = filteredNFeList.filter(nfe => nfe.status === 'Emitida').length;
  const nfePendentes = filteredNFeList.filter(nfe => nfe.status === 'Pendente').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Dashboard Principal
          </h1>
          <p className="text-muted-foreground mt-2">
            {/* Fixed segment access - now works correctly */}
            {activeSegmentId && activeSegmentId !== 0 ? `Exibindo dados para o segmento: ${(data.segments || []).find(s => s.id === activeSegmentId)?.name}` : 'Visão geral consolidada do seu negócio'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Hoje
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Primeira linha de painéis - Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass-effect rounded-xl p-6 gradient-card border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Receita Total</p>
              <p className="text-2xl font-bold text-green-400">
                {formatCurrency(metrics.totalRevenue || 0)}
              </p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass-effect rounded-xl p-6 gradient-card border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Despesas</p>
              <p className="text-2xl font-bold text-red-400">
                {formatCurrency(metrics.totalExpenses || 0)}
              </p>
            </div>
            <div className="p-3 bg-red-500/20 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass-effect rounded-xl p-6 gradient-card border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Produtos</p>
              <p className="text-2xl font-bold text-blue-400">{metrics.totalProducts}</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Package className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <AlertTriangle className="w-4 h-4 text-yellow-400 mr-1" />
            <span className="text-yellow-400">{metrics.lowStockProducts}</span>
            <span className="text-muted-foreground ml-2">estoque baixo</span>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass-effect rounded-xl p-6 gradient-card border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Vendas</p>
              <p className="text-2xl font-bold text-purple-400">{metrics.totalSales}</p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Users className="w-4 h-4 text-blue-400 mr-1" />
            <span className="text-blue-400">{metrics.totalCustomers}</span>
            <span className="text-muted-foreground ml-2">clientes</span>
          </div>
        </motion.div>
      </div>

      {/* Segunda linha de painéis - NF-e e Cobranças */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass-effect rounded-xl p-6 gradient-card border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total NF-es</p>
              <p className="text-2xl font-bold text-indigo-400">{totalNFe}</p>
            </div>
            <div className="p-3 bg-indigo-500/20 rounded-lg">
              <FileSpreadsheet className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="flex items-center">
              <Send className="w-4 h-4 text-green-400 mr-1" />
              <span className="text-green-400">{nfeEmitidas}</span>
              <span className="text-muted-foreground ml-1">emitidas</span>
            </div>
            <div className="flex items-center">
              <FileText className="w-4 h-4 text-yellow-400 mr-1" />
              <span className="text-yellow-400">{nfePendentes}</span>
              <span className="text-muted-foreground ml-1">pendentes</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass-effect rounded-xl p-6 gradient-card border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Índice de Inadimplência</p>
              <p className={`text-2xl font-bold ${defaultRate > 10 ? 'text-red-400' : 'text-green-400'}`}>
                {defaultRate.toFixed(2)}%
              </p>
            </div>
            <div className="p-3 bg-red-500/20 rounded-lg">
              <AlertTriangle className={`w-6 h-6 ${defaultRate > 10 ? 'text-red-400' : 'text-green-400'}`} />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass-effect rounded-xl p-6 gradient-card border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Cobranças Vencidas</p>
              <p className="text-2xl font-bold text-red-400">{overdueBillings}</p>
            </div>
            <div className="p-3 bg-red-500/20 rounded-lg">
              <Clock className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass-effect rounded-xl p-6 gradient-card border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total a Receber</p>
              <p className="text-2xl font-bold text-yellow-400">
                {formatCurrency(totalPendingAmount)}
              </p>
            </div>
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-effect rounded-xl p-6 border"
        >
          <h3 className="text-lg font-semibold mb-4">Receitas vs Despesas</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Receitas</span>
              <span className="text-green-400 font-medium">
                {formatCurrency(metrics.totalRevenue || 0)}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                style={{ width: `${metrics.totalRevenue > 0 ? (metrics.totalRevenue / (metrics.totalRevenue + metrics.totalExpenses)) * 100 : 0}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Despesas</span>
              <span className="text-red-400 font-medium">
                {formatCurrency(metrics.totalExpenses || 0)}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-red-400 to-red-600 h-2 rounded-full"
                style={{ width: `${metrics.totalExpenses > 0 ? (metrics.totalExpenses / (metrics.totalRevenue + metrics.totalExpenses)) * 100 : 0}%` }}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-effect rounded-xl p-6 border"
        >
          <h3 className="text-lg font-semibold mb-4">Produtos com Estoque Baixo</h3>
          <div className="space-y-3 max-h-60 overflow-y-auto scrollbar-hide">
            {filteredProducts
              .filter(p => p.stock <= p.minStock)
              .slice(0, 3)
              .map(product => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-400 font-medium">{product.stock} unidades</p>
                    <p className="text-xs text-muted-foreground">Mín: {product.minStock}</p>
                  </div>
                </div>
              ))}
            {filteredProducts.filter(p => p.stock <= p.minStock).length === 0 && (
              <p className="text-muted-foreground text-sm">Nenhum produto com estoque baixo.</p>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-effect rounded-xl p-6 border"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Transações Recentes</h3>
          <Button variant="outline" size="sm" onClick={() => setActiveModule('financial')}>
            Ver Todas
          </Button>
        </div>
        <div className="space-y-3 max-h-72 overflow-y-auto scrollbar-hide">
          {data.transactions.filter(t => !activeSegmentId || activeSegmentId === 0 || t.segmentId === activeSegmentId).slice(0, 5).map(transaction => (
            <div key={transaction.id} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  transaction.type === 'receita' ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  {transaction.type === 'receita' ? 
                    <TrendingUp className="w-4 h-4 text-green-400" /> : 
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  }
                </div>
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">{transaction.category} {transaction.costCenter ? `(${transaction.costCenter})` : ''}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-medium ${
                  transaction.type === 'receita' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {transaction.type === 'receita' ? '+' : '-'}{formatCurrency(transaction.amount || 0)}
                </p>
                <p className="text-sm text-muted-foreground">{formatDate(transaction.date)}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DashboardModule;
