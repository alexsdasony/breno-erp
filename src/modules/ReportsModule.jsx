import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, PieChart, Filter, Download, Calendar, Building, BookOpen, Target, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppData } from '@/hooks/useAppData.jsx';

const ReportsModule = ({ toast }) => {
  const { data, activeSegmentId } = useAppData();
  const [dreData, setDreData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Início do ano
    endDate: new Date().toISOString().split('T')[0], // Hoje
    costCenterId: '',
    accountType: '',
    groupBy: 'account_type' // account_type, cost_center, month
  });
  const [costCenters, setCostCenters] = useState([]);
  const [chartOfAccounts, setChartOfAccounts] = useState([]);

  // Load data
  useEffect(() => {
    loadCostCenters();
    loadChartOfAccounts();
  }, [activeSegmentId]);

  useEffect(() => {
    if (filters.startDate && filters.endDate) {
      generateDRE();
    }
  }, [filters, activeSegmentId]);

  const loadCostCenters = async () => {
    try {
      const response = await fetch('/api/cost-centers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCostCenters(data);
      }
    } catch (error) {
      console.error('Error loading cost centers:', error);
    }
  };

  const loadChartOfAccounts = async () => {
    try {
      const response = await fetch('/api/chart-of-accounts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setChartOfAccounts(data);
      }
    } catch (error) {
      console.error('Error loading chart of accounts:', error);
    }
  };

  const generateDRE = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reports/dre?${new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        costCenterId: filters.costCenterId,
        accountType: filters.accountType,
        groupBy: filters.groupBy,
        segmentId: activeSegmentId || ''
      })}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDreData(data);
      } else {
        toast({
          title: "Erro",
          description: "Erro ao gerar DRE.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error generating DRE:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar DRE.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportDRE = async (format = 'pdf') => {
    try {
      const response = await fetch(`/api/reports/dre/export?${new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        costCenterId: filters.costCenterId,
        accountType: filters.accountType,
        groupBy: filters.groupBy,
        segmentId: activeSegmentId || '',
        format
      })}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `DRE_${filters.startDate}_${filters.endDate}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Sucesso",
          description: `DRE exportado em ${format.toUpperCase()}.`,
        });
      }
    } catch (error) {
      console.error('Error exporting DRE:', error);
      toast({
        title: "Erro",
        description: "Erro ao exportar DRE.",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const getAccountTypeColor = (type) => {
    switch (type) {
      case 'revenue': return 'text-green-600';
      case 'expense': return 'text-red-600';
      case 'asset': return 'text-blue-600';
      case 'liability': return 'text-orange-600';
      case 'equity': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getAccountTypeLabel = (type) => {
    switch (type) {
      case 'revenue': return 'Receitas';
      case 'expense': return 'Despesas';
      case 'asset': return 'Ativos';
      case 'liability': return 'Passivos';
      case 'equity': return 'Patrimônio Líquido';
      default: return type;
    }
  };

  const calculateNetIncome = () => {
    if (!dreData) return 0;
    const revenues = dreData.revenues?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
    const expenses = dreData.expenses?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
    return revenues - expenses;
  };

  const calculateMargin = () => {
    if (!dreData) return 0;
    const revenues = dreData.revenues?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
    const expenses = dreData.expenses?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
    return revenues > 0 ? ((revenues - expenses) / revenues) * 100 : 0;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Relatórios Contábeis
          </h1>
          <p className="text-muted-foreground mt-2">DRE baseado em centros de custo e contas contábeis.</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => exportDRE('pdf')} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button onClick={() => exportDRE('excel')} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-effect rounded-xl p-6 border">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Filtros do Relatório
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Data Inicial
            </label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              Data Final
            </label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="costCenter" className="block text-sm font-medium text-gray-700 mb-1">
              Centro de Custo
            </label>
            <select
              id="costCenter"
              name="costCenter"
              value={filters.costCenterId}
              onChange={(e) => setFilters({ ...filters, costCenterId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os Centros</option>
              {costCenters.map(center => (
                <option key={center.id} value={center.id}>
                  {center.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="accountType" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Conta
            </label>
            <select
              id="accountType"
              name="accountType"
              value={filters.accountType}
              onChange={(e) => setFilters({ ...filters, accountType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os Tipos</option>
              <option value="receita">Receita</option>
              <option value="despesa">Despesa</option>
              <option value="ativo">Ativo</option>
              <option value="passivo">Passivo</option>
              <option value="patrimonio">Patrimônio</option>
            </select>
          </div>
        </div>
        
        {/* Agrupamento */}
        <div className="mb-6">
          <label htmlFor="groupBy" className="block text-sm font-medium text-gray-700 mb-2">
            Agrupar por:
          </label>
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center">
              <input
                id="groupByAccount"
                name="groupBy"
                type="radio"
                value="account"
                checked={filters.groupBy === 'account'}
                onChange={(e) => setFilters({ ...filters, groupBy: e.target.value })}
                className="mr-2"
              />
              Conta Contábil
            </label>
            <label className="flex items-center">
              <input
                id="groupByCostCenter"
                name="groupBy"
                type="radio"
                value="costCenter"
                checked={filters.groupBy === 'costCenter'}
                onChange={(e) => setFilters({ ...filters, groupBy: e.target.value })}
                className="mr-2"
              />
              Centro de Custo
            </label>
            <label className="flex items-center">
              <input
                id="groupByBoth"
                name="groupBy"
                type="radio"
                value="both"
                checked={filters.groupBy === 'both'}
                onChange={(e) => setFilters({ ...filters, groupBy: e.target.value })}
                className="mr-2"
              />
              Ambos
            </label>
          </div>
        </div>
      </motion.div>

      {/* Botões de Ação */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Button
          onClick={generateDRE}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
          aria-label="Gerar relatório DRE"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <BarChart3 className="h-4 w-4" />
          )}
          {loading ? 'Gerando...' : 'Gerar DRE'}
        </Button>
        
        <Button
          onClick={() => exportDRE('pdf')}
          disabled={!dreData || loading}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
          aria-label="Exportar DRE para PDF"
        >
          <Download className="h-4 w-4" />
          Exportar PDF
        </Button>
        
        <Button
          onClick={() => exportDRE('excel')}
          disabled={!dreData || loading}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
          aria-label="Exportar DRE para Excel"
        >
          <Download className="h-4 w-4" />
          Exportar Excel
        </Button>
      </div>

      {/* Resumo Executivo */}
      {dreData && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-effect rounded-xl p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receitas Totais</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(dreData.revenues?.reduce((sum, item) => sum + (item.total || 0), 0) || 0)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="glass-effect rounded-xl p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Despesas Totais</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(dreData.expenses?.reduce((sum, item) => sum + (item.total || 0), 0) || 0)}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </div>
          
          <div className="glass-effect rounded-xl p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resultado Líquido</p>
                <p className={`text-2xl font-bold ${calculateNetIncome() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(calculateNetIncome())}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="glass-effect rounded-xl p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Margem de Lucro</p>
                <p className={`text-2xl font-bold ${calculateMargin() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {calculateMargin().toFixed(1)}%
                </p>
              </div>
              <Target className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </motion.div>
      )}

      {/* DRE Detalhado */}
      {dreData && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-effect rounded-xl p-6 border">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Demonstração do Resultado do Exercício
          </h3>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              <span className="ml-2">Gerando relatório...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Receitas */}
              {dreData.revenues && dreData.revenues.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-green-600 mb-3 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Receitas Operacionais
                  </h4>
                  <div className="space-y-2">
                    {dreData.revenues.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <div>
                          <p className="font-medium">{item.name || item.account_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.cost_center_name && `${item.cost_center_name} • `}
                            {item.account_code}
                          </p>
                        </div>
                        <p className="font-bold text-green-600">{formatCurrency(item.total)}</p>
                      </div>
                    ))}
                    <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg border-t-2 border-green-300">
                      <p className="font-bold">Total Receitas</p>
                      <p className="font-bold text-green-600">
                        {formatCurrency(dreData.revenues.reduce((sum, item) => sum + (item.total || 0), 0))}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Despesas */}
              {dreData.expenses && dreData.expenses.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-red-600 mb-3 flex items-center">
                    <TrendingDown className="w-4 h-4 mr-2" />
                    Custos e Despesas Operacionais
                  </h4>
                  <div className="space-y-2">
                    {dreData.expenses.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                        <div>
                          <p className="font-medium">{item.name || item.account_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.cost_center_name && `${item.cost_center_name} • `}
                            {item.account_code}
                          </p>
                        </div>
                        <p className="font-bold text-red-600">{formatCurrency(item.total)}</p>
                      </div>
                    ))}
                    <div className="flex justify-between items-center p-3 bg-red-100 rounded-lg border-t-2 border-red-300">
                      <p className="font-bold">Total Despesas</p>
                      <p className="font-bold text-red-600">
                        {formatCurrency(dreData.expenses.reduce((sum, item) => sum + (item.total || 0), 0))}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Resultado */}
              <div className="border-t-2 border-gray-300 pt-4">
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-lg font-bold">Resultado Líquido do Exercício</p>
                  <p className={`text-2xl font-bold ${calculateNetIncome() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(calculateNetIncome())}
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Análise por Centro de Custo */}
      {dreData && dreData.costCenterAnalysis && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-effect rounded-xl p-6 border">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Building className="w-5 h-5 mr-2" />
            Análise por Centro de Custo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dreData.costCenterAnalysis.map((center, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">{center.name}</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Receitas:</span>
                    <span className="text-green-600 font-medium">{formatCurrency(center.revenues || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Despesas:</span>
                    <span className="text-red-600 font-medium">{formatCurrency(center.expenses || 0)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1">
                    <span className="font-medium">Resultado:</span>
                    <span className={`font-bold ${(center.revenues - center.expenses) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(center.revenues - center.expenses)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Análise por Conta Contábil */}
      {dreData && dreData.accountAnalysis && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-effect rounded-xl p-6 border">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            Análise por Conta Contábil
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3">Código</th>
                  <th className="text-left p-3">Conta</th>
                  <th className="text-left p-3">Tipo</th>
                  <th className="text-left p-3">Centro de Custo</th>
                  <th className="text-right p-3">Valor</th>
                </tr>
              </thead>
              <tbody>
                {dreData.accountAnalysis.map((account, index) => (
                  <tr key={index} className="border-b border-border hover:bg-muted/50">
                    <td className="p-3 font-mono text-sm">{account.account_code}</td>
                    <td className="p-3 font-medium">{account.account_name}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAccountTypeColor(account.account_type)}`}>
                        {getAccountTypeLabel(account.account_type)}
                      </span>
                    </td>
                    <td className="p-3 text-sm">{account.cost_center_name || '-'}</td>
                    <td className={`p-3 text-right font-medium ${account.account_type === 'revenue' ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(account.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ReportsModule;
