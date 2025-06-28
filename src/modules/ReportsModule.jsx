
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Download,
  TrendingUp,
  DollarSign,
  BarChart3,
  FileText,
  Users,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppData } from '@/hooks/useAppData.js';

const ReportsModule = () => {
  const { data, activeSegmentId } = useAppData();
  const segments = data.segments || [];

  const calculateDRE = (segmentId = null) => {
    const filterBySegment = (item) => !segmentId || item.segmentId === segmentId;
    const transactions = data.transactions.filter(filterBySegment);

    const receitaBruta = transactions
      .filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + t.amount, 0);

    const deducoesReceita = 0;
    const receitaLiquida = receitaBruta - deducoesReceita;

    const custoProdutosVendidos = transactions
      .filter(t => t.type === 'despesa' && (t.category === 'Compras' || t.category === 'Estoque'))
      .reduce((sum, t) => sum + t.amount, 0);
    
    const lucroBruto = receitaLiquida - custoProdutosVendidos;

    const despesasOperacionais = transactions
      .filter(t => t.type === 'despesa' && t.category !== 'Compras' && t.category !== 'Estoque')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const lucroOperacional = lucroBruto - despesasOperacionais;
    const lucroLiquido = lucroOperacional; 

    return { receitaLiquida, despesasOperacionais, lucroLiquido };
  };

  const dre = calculateDRE(activeSegmentId);

  const metricsBySegment = segments.map(segment => {
    const segmentSales = data.sales.filter(s => s.segmentId === segment.id);
    const customerIds = new Set(segmentSales.map(s => s.customerId));
    const segmentTransactions = data.transactions.filter(t => t.segmentId === segment.id);
    
    const faturamento = segmentTransactions.filter(t => t.type === 'receita').reduce((sum, t) => sum + t.amount, 0);
    const despesas = segmentTransactions.filter(t => t.type === 'despesa').reduce((sum, t) => sum + t.amount, 0);

    return {
      ...segment,
      totalClientes: customerIds.size,
      faturamento,
      despesas,
      saldo: faturamento - despesas,
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Relatórios e Análises
          </h1>
          <p className="text-muted-foreground mt-2">
            {activeSegmentId ? `Exibindo dados para o segmento: ${segments.find(s => s.id === activeSegmentId)?.name}` : 'Visão geral consolidada'}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Exportar</Button>
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-effect rounded-xl p-6 border"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-cyan-400" />
          Demonstrativo de Resultado (DRE)
        </h3>
        <div className="space-y-2 text-sm">
          <DREItem label="(=) Receita Líquida de Vendas" value={dre.receitaLiquida} bold positive />
          <DREItem label="(-) Despesas Operacionais" value={dre.despesasOperacionais} />
          <DREItem label="(=) Lucro Líquido do Exercício" value={dre.lucroLiquido} bold final positive={dre.lucroLiquido >= 0} />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-effect rounded-xl p-6 border"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Briefcase className="w-5 h-5 mr-2 text-purple-400" />
          Análise por Segmento
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3">Segmento</th>
                <th className="text-center p-3">Clientes Ativos</th>
                <th className="text-right p-3">Faturamento</th>
                <th className="text-right p-3">Despesas</th>
                <th className="text-right p-3">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {metricsBySegment.map(metric => (
                <motion.tr key={metric.id} className="border-b border-border/50 hover:bg-muted/50">
                  <td className="p-3 font-medium">{metric.name}</td>
                  <td className="p-3 text-center">{metric.totalClientes}</td>
                  <td className="p-3 text-right text-green-400">R$ {metric.faturamento.toLocaleString('pt-BR')}</td>
                  <td className="p-3 text-right text-red-400">R$ {metric.despesas.toLocaleString('pt-BR')}</td>
                  <td className={`p-3 text-right font-bold ${metric.saldo >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    R$ {metric.saldo.toLocaleString('pt-BR')}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

const DREItem = ({ label, value, bold = false, final = false, positive = false }) => (
  <div className={`flex justify-between py-2 ${final ? 'border-t-2 border-primary mt-2 pt-2' : 'border-b border-border/50'}`}>
    <span className={`${bold ? 'font-semibold' : ''} ${positive && value !== 0 ? 'text-green-400' : value < 0 ? 'text-red-400' : ''}`}>
      {label}
    </span>
    <span className={`${bold ? 'font-semibold' : ''} ${positive && value !== 0 ? 'text-green-400' : value < 0 ? 'text-red-400' : ''}`}>
      R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
  </div>
);

export default ReportsModule;
