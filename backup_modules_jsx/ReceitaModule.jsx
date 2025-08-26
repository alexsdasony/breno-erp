import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  PieChart,
  Calendar,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppData } from '@/hooks/useAppData';
import { formatCurrency } from '@/lib/utils.js';

const ReceitaModule = () => {
  const { data, activeSegmentId } = useAppData();

  const revenueData = {
    totalRevenue: data.transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0,
    monthlyRevenue: data.transactions?.filter(t => {
      const date = new Date(t.date || t.created_at);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).reduce((sum, t) => sum + (t.amount || 0), 0) || 0,
    growthRate: 12.5, // Mock data
    topProducts: [
      { name: 'Produto A', revenue: 15000 },
      { name: 'Produto B', revenue: 12000 },
      { name: 'Produto C', revenue: 8000 }
    ]
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            Gestão de Receita
          </h1>
          <p className="text-muted-foreground mt-2">Acompanhe e analise suas receitas</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Período
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div whileHover={{ scale: 1.02 }} className="glass-effect rounded-xl p-6 gradient-card border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Receita Total</p>
              <p className="text-2xl font-bold text-green-400">
                {formatCurrency(revenueData.totalRevenue)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="glass-effect rounded-xl p-6 gradient-card border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Receita Mensal</p>
              <p className="text-2xl font-bold text-blue-400">
                {formatCurrency(revenueData.monthlyRevenue)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-400" />
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="glass-effect rounded-xl p-6 gradient-card border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Crescimento</p>
              <p className="text-2xl font-bold text-purple-400">
                +{revenueData.growthRate}%
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-400" />
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="glass-effect rounded-xl p-6 gradient-card border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Meta Atingida</p>
              <p className="text-2xl font-bold text-orange-400">
                85%
              </p>
            </div>
            <PieChart className="w-8 h-8 text-orange-400" />
          </div>
        </motion.div>
      </div>

      {/* Gráficos e Análises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-effect rounded-xl p-6 border"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Receita por Período</h3>
            <Button variant="outline" size="sm">
              <BarChart3 className="w-4 h-4 mr-2" />
              Ver Detalhes
            </Button>
          </div>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-2xl font-bold">{formatCurrency(revenueData.monthlyRevenue)}</p>
              <p className="text-muted-foreground">Este mês</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-effect rounded-xl p-6 border"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Top Produtos</h3>
            <Button variant="outline" size="sm">
              <PieChart className="w-4 h-4 mr-2" />
              Ver Detalhes
            </Button>
          </div>
          <div className="space-y-3">
            {revenueData.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${
                    index === 0 ? 'from-green-500 to-emerald-500' :
                    index === 1 ? 'from-blue-500 to-cyan-500' :
                    'from-purple-500 to-pink-500'
                  }`} />
                  <span className="text-sm">{product.name}</span>
                </div>
                <span className="text-sm font-medium">
                  {formatCurrency(product.revenue)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Resumo Detalhado */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-effect rounded-xl p-6 border"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Análise de Receita</h3>
          <Button variant="outline" size="sm">
            Ver Relatório Completo
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Receita Média</p>
            <p className="text-xl font-bold text-green-600">
              {formatCurrency(revenueData.totalRevenue / 12)}
            </p>
            <p className="text-xs text-muted-foreground">por mês</p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Projeção Anual</p>
            <p className="text-xl font-bold text-blue-600">
              {formatCurrency(revenueData.totalRevenue * 1.15)}
            </p>
            <p className="text-xs text-muted-foreground">+15% vs ano anterior</p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Margem de Lucro</p>
            <p className="text-xl font-bold text-purple-600">32%</p>
            <p className="text-xs text-muted-foreground">média do setor</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ReceitaModule; 