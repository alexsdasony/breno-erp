import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  FileText,
  Download,
  Calendar,
  DollarSign,
  Users,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppData } from '@/hooks/useAppData';
import { formatCurrency } from '@/lib/utils.js';

<<<<<<< HEAD
const ReportsModule = ({ toast }) => {
  const { data, activeSegmentId, loadCostCenters, loadChartOfAccounts } = useAppData();
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
    loadCostCentersData();
    loadChartOfAccountsData();
  }, [activeSegmentId]);

  useEffect(() => {
    if (filters.startDate && filters.endDate) {
      generateDRE();
=======
const ReportsModule = () => {
  const { data, activeSegmentId } = useAppData();

  const reports = [
    {
      id: 1,
      title: 'Relatório de Vendas',
      description: 'Análise detalhada das vendas por período',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500',
      type: 'sales'
    },
    {
      id: 2,
      title: 'Relatório Financeiro',
      description: 'Receitas, despesas e lucros',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500',
      type: 'financial'
    },
    {
      id: 3,
      title: 'Relatório de Clientes',
      description: 'Análise do comportamento dos clientes',
      icon: <Users className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500',
      type: 'customers'
    },
    {
      id: 4,
      title: 'Relatório de Estoque',
      description: 'Status do inventário e produtos',
      icon: <Package className="w-6 h-6" />,
      color: 'from-orange-500 to-red-500',
      type: 'inventory'
    },
    {
      id: 5,
      title: 'Relatório de NF-e',
      description: 'Documentos fiscais emitidos',
      icon: <FileText className="w-6 h-6" />,
      color: 'from-indigo-500 to-purple-500',
      type: 'nfe'
    },
    {
      id: 6,
      title: 'Relatório de Cobranças',
      description: 'Status das cobranças e recebimentos',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'from-teal-500 to-green-500',
      type: 'billing'
>>>>>>> 8d8b27b5651436ba0f6f11b7ab9cc5b22b8662b6
    }
  ];

<<<<<<< HEAD
  const loadCostCentersData = async () => {
    try {
      const result = await loadCostCenters();
      setCostCenters(result.costCenters || []);
    } catch (error) {
      console.error('Error loading cost centers:', error);
      setCostCenters([]); // Fallback para array vazio
    }
  };

  const loadChartOfAccountsData = async () => {
    try {
      const result = await loadChartOfAccounts();
      setChartOfAccounts(result.chartOfAccounts || []);
    } catch (error) {
      console.error('Error loading chart of accounts:', error);
      setChartOfAccounts([]); // Fallback para array vazio
    }
  };

  const generateDRE = async () => {
    setLoading(true);
    try {
      const params = {
        startDate: filters.startDate,
        endDate: filters.endDate,
        costCenterId: filters.costCenterId,
        accountType: filters.accountType,
        groupBy: filters.groupBy,
        segmentId: activeSegmentId || ''
      };

      const data = await apiService.get('/reports/dre', params);
      setDreData(data);
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
      const params = {
        startDate: filters.startDate,
        endDate: filters.endDate,
        costCenterId: filters.costCenterId,
        accountType: filters.accountType,
        groupBy: filters.groupBy,
        segmentId: activeSegmentId || '',
        format
      };

      const response = await fetch(`${apiService.baseURL}/reports/dre/export?${new URLSearchParams(params)}`, {
        headers: {
          'Authorization': `Bearer ${apiService.getToken()}`
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
=======
  const handleGenerateReport = (reportType) => {
    console.log(`Gerando relatório: ${reportType}`);
    // Implementar geração de relatório
  };

  const handleExportReport = (reportType) => {
    console.log(`Exportando relatório: ${reportType}`);
    // Implementar exportação
>>>>>>> 8d8b27b5651436ba0f6f11b7ab9cc5b22b8662b6
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Relatórios
          </h1>
          <p className="text-muted-foreground mt-2">Gere e visualize relatórios do seu negócio</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Período
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar Todos
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-effect rounded-xl p-6 border hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-r ${report.color} rounded-lg flex items-center justify-center text-white`}>
                {report.icon}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleGenerateReport(report.type)}
                >
                  Gerar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportReport(report.type)}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">{report.title}</h3>
            <p className="text-muted-foreground text-sm mb-4">{report.description}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Última atualização:</span>
              <span>Hoje</span>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-effect rounded-xl p-6 border"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Relatórios Rápidos</h3>
          <Button variant="outline" size="sm">
            Ver Todos
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{formatCurrency(data.transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0)}</p>
            <p className="text-sm text-muted-foreground">Receita Total</p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{data.customers?.length || 0}</p>
            <p className="text-sm text-muted-foreground">Total Clientes</p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <Package className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{data.products?.length || 0}</p>
            <p className="text-sm text-muted-foreground">Total Produtos</p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <FileText className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{data.nfeList?.length || 0}</p>
            <p className="text-sm text-muted-foreground">NF-es Emitidas</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ReportsModule;
