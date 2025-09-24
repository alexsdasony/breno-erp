'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  FileSpreadsheet,
  CreditCard,
  Building,
  BookOpen,
  Briefcase,
  Factory,
  ListChecks,
  Search,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  PieChart,
  BarChart3,
  FileText,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Report {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  type: 'chart' | 'table' | 'pdf';
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
}

interface ReportModule {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  reports: Report[];
}

const reportModules: ReportModule[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: LayoutDashboard,
    color: 'from-blue-500 to-blue-600',
    reports: [
      {
        id: 'kpi-overview',
        name: 'Visão Geral de KPIs',
        description: 'Principais indicadores de performance do negócio',
        icon: TrendingUp,
        type: 'chart',
        frequency: 'daily'
      },
      {
        id: 'executive-summary',
        name: 'Resumo Executivo',
        description: 'Relatório consolidado para tomada de decisões',
        icon: FileText,
        type: 'pdf',
        frequency: 'monthly'
      }
    ]
  },
  {
    id: 'financial',
    name: 'Financeiro',
    icon: DollarSign,
    color: 'from-green-500 to-green-600',
    reports: [
      {
        id: 'cash-flow',
        name: 'Fluxo de Caixa',
        description: 'Entradas e saídas de caixa por período',
        icon: TrendingUp,
        type: 'chart',
        frequency: 'daily'
      },
      {
        id: 'profit-loss',
        name: 'Demonstrativo de Resultados (DRE)',
        description: 'Receitas, custos e lucros por período',
        icon: BarChart3,
        type: 'table',
        frequency: 'monthly'
      },
      {
        id: 'balance-sheet',
        name: 'Balanço Patrimonial',
        description: 'Ativos, passivos e patrimônio líquido',
        icon: FileText,
        type: 'pdf',
        frequency: 'monthly'
      },
      {
        id: 'financial-analysis',
        name: 'Análise Financeira',
        description: 'Indicadores de liquidez, rentabilidade e endividamento',
        icon: PieChart,
        type: 'chart',
        frequency: 'monthly'
      }
    ]
  },
  {
    id: 'accounts-payable',
    name: 'Contas a Pagar',
    icon: ListChecks,
    color: 'from-red-500 to-red-600',
    reports: [
      {
        id: 'payables-aging',
        name: 'Aging de Contas a Pagar',
        description: 'Vencimentos por faixa de dias',
        icon: Calendar,
        type: 'table',
        frequency: 'weekly'
      },
      {
        id: 'supplier-payments',
        name: 'Pagamentos por Fornecedor',
        description: 'Histórico de pagamentos realizados',
        icon: Factory,
        type: 'table',
        frequency: 'monthly'
      },
      {
        id: 'overdue-bills',
        name: 'Contas em Atraso',
        description: 'Títulos vencidos e não pagos',
        icon: TrendingUp,
        type: 'table',
        frequency: 'daily'
      }
    ]
  },
  {
    id: 'billing',
    name: 'Cobranças',
    icon: CreditCard,
    color: 'from-purple-500 to-purple-600',
    reports: [
      {
        id: 'receivables-aging',
        name: 'Aging de Contas a Receber',
        description: 'Recebimentos por faixa de vencimento',
        icon: Calendar,
        type: 'table',
        frequency: 'weekly'
      },
      {
        id: 'collection-efficiency',
        name: 'Eficiência de Cobrança',
        description: 'Taxa de sucesso nas cobranças',
        icon: TrendingUp,
        type: 'chart',
        frequency: 'monthly'
      },
      {
        id: 'customer-receivables',
        name: 'Recebíveis por Cliente',
        description: 'Valores a receber por cliente',
        icon: Users,
        type: 'table',
        frequency: 'monthly'
      }
    ]
  },
  {
    id: 'inventory',
    name: 'Estoque',
    icon: Package,
    color: 'from-orange-500 to-orange-600',
    reports: [
      {
        id: 'stock-levels',
        name: 'Níveis de Estoque',
        description: 'Quantidade atual por produto',
        icon: Package,
        type: 'table',
        frequency: 'daily'
      },
      {
        id: 'stock-movement',
        name: 'Movimentação de Estoque',
        description: 'Entradas e saídas por período',
        icon: TrendingUp,
        type: 'chart',
        frequency: 'weekly'
      },
      {
        id: 'abc-analysis',
        name: 'Análise ABC',
        description: 'Classificação de produtos por importância',
        icon: BarChart3,
        type: 'chart',
        frequency: 'monthly'
      },
      {
        id: 'low-stock-alert',
        name: 'Produtos com Estoque Baixo',
        description: 'Itens próximos ao estoque mínimo',
        icon: TrendingUp,
        type: 'table',
        frequency: 'daily'
      }
    ]
  },
  {
    id: 'sales',
    name: 'Vendas',
    icon: ShoppingCart,
    color: 'from-indigo-500 to-indigo-600',
    reports: [
      {
        id: 'sales-performance',
        name: 'Performance de Vendas',
        description: 'Vendas por período e vendedor',
        icon: TrendingUp,
        type: 'chart',
        frequency: 'monthly'
      },
      {
        id: 'top-products',
        name: 'Produtos Mais Vendidos',
        description: 'Ranking de produtos por volume',
        icon: Package,
        type: 'table',
        frequency: 'monthly'
      },
      {
        id: 'sales-forecast',
        name: 'Previsão de Vendas',
        description: 'Projeção baseada em histórico',
        icon: TrendingUp,
        type: 'chart',
        frequency: 'monthly'
      },
      {
        id: 'customer-analysis',
        name: 'Análise de Clientes',
        description: 'Comportamento e segmentação',
        icon: Users,
        type: 'chart',
        frequency: 'monthly'
      }
    ]
  },
  {
    id: 'customers',
    name: 'Clientes',
    icon: Users,
    color: 'from-teal-500 to-teal-600',
    reports: [
      {
        id: 'customer-list',
        name: 'Lista de Clientes',
        description: 'Cadastro completo de clientes',
        icon: Users,
        type: 'table',
        frequency: 'custom'
      },
      {
        id: 'customer-segmentation',
        name: 'Segmentação de Clientes',
        description: 'Clientes por segmento e região',
        icon: PieChart,
        type: 'chart',
        frequency: 'monthly'
      },
      {
        id: 'customer-lifetime-value',
        name: 'Valor Vitalício do Cliente (LTV)',
        description: 'Valor total por cliente ao longo do tempo',
        icon: TrendingUp,
        type: 'chart',
        frequency: 'monthly'
      }
    ]
  },
  {
    id: 'suppliers',
    name: 'Fornecedores',
    icon: Factory,
    color: 'from-gray-500 to-gray-600',
    reports: [
      {
        id: 'supplier-list',
        name: 'Lista de Fornecedores',
        description: 'Cadastro completo de fornecedores',
        icon: Factory,
        type: 'table',
        frequency: 'custom'
      },
      {
        id: 'supplier-performance',
        name: 'Performance de Fornecedores',
        description: 'Avaliação de prazo e qualidade',
        icon: TrendingUp,
        type: 'chart',
        frequency: 'monthly'
      },
      {
        id: 'purchase-analysis',
        name: 'Análise de Compras',
        description: 'Volume e valor por fornecedor',
        icon: BarChart3,
        type: 'chart',
        frequency: 'monthly'
      }
    ]
  },
  {
    id: 'nfe',
    name: 'Notas Fiscais',
    icon: FileSpreadsheet,
    color: 'from-yellow-500 to-yellow-600',
    reports: [
      {
        id: 'nfe-issued',
        name: 'NFes Emitidas',
        description: 'Relatório de notas fiscais por período',
        icon: FileSpreadsheet,
        type: 'table',
        frequency: 'monthly'
      },
      {
        id: 'tax-summary',
        name: 'Resumo de Impostos',
        description: 'Impostos recolhidos por tipo',
        icon: PieChart,
        type: 'chart',
        frequency: 'monthly'
      },
      {
        id: 'nfe-status',
        name: 'Status das NFes',
        description: 'Situação das notas na SEFAZ',
        icon: TrendingUp,
        type: 'table',
        frequency: 'daily'
      }
    ]
  }
];

const frequencyLabels = {
  daily: 'Diário',
  weekly: 'Semanal',
  monthly: 'Mensal',
  yearly: 'Anual',
  custom: 'Personalizado'
};

const typeLabels = {
  chart: 'Gráfico',
  table: 'Tabela',
  pdf: 'PDF'
};

export default function ReportsView() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredModules = reportModules.filter(module =>
    module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.reports.some(report => 
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleGenerateReport = async (moduleId: string, reportId: string, action: 'view' | 'download') => {
    try {
      console.log(`Gerando relatório ${reportId} do módulo ${moduleId} - Ação: ${action}`);
      
      // Definir período padrão (últimos 30 dias)
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      // Determinar formato baseado na ação
      const format = action === 'download' ? 'pdf' : 'json';
      
      const response = await fetch(`/api/reports?module=${moduleId}&report=${reportId}&format=${format}&startDate=${startDate}&endDate=${endDate}`);
      
      if (!response.ok) {
        throw new Error('Erro ao gerar relatório');
      }
      
      const data = await response.json();
      
      if (action === 'view') {
        // Abrir relatório em nova aba para visualização
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head>
                <title>Relatório - ${data.data?.title || reportId}</title>
                <style>
                  body { font-family: Arial, sans-serif; margin: 20px; }
                  .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                  .content { margin: 20px 0; }
                  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                  th { background-color: #f2f2f2; }
                </style>
              </head>
              <body>
                <div class="header">
                  <h1>${data.data?.title || 'Relatório'}</h1>
                  <p>Período: ${data.data?.period || 'N/A'}</p>
                </div>
                <div class="content">
                  <pre>${JSON.stringify(data.data, null, 2)}</pre>
                </div>
              </body>
            </html>
          `);
          newWindow.document.close();
        }
      } else {
        // Implementar download
        if (format === 'pdf') {
          // Para PDF, implementar download
          const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `relatorio_${moduleId}_${reportId}_${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        } else {
          // Para outros formatos
          const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `relatorio_${moduleId}_${reportId}_${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }
      }
      
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      alert('Erro ao gerar relatório. Tente novamente.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Relatórios</h1>
          <p className="text-gray-400 mt-1">Gere relatórios detalhados dos seus dados</p>
        </div>
        
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar relatórios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total de Relatórios</p>
              <p className="text-xl font-semibold text-white">{reportModules.reduce((acc, module) => acc + module.reports.length, 0)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Módulos Ativos</p>
              <p className="text-xl font-semibold text-white">{reportModules.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Relatórios Diários</p>
              <p className="text-xl font-semibold text-white">
                {reportModules.reduce((acc, module) => 
                  acc + module.reports.filter(r => r.frequency === 'daily').length, 0
                )}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <FileText className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Relatórios PDF</p>
              <p className="text-xl font-semibold text-white">
                {reportModules.reduce((acc, module) => 
                  acc + module.reports.filter(r => r.type === 'pdf').length, 0
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Report Modules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredModules.map((module) => {
          const IconComponent = module.icon;
          return (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:bg-white/10 transition-all duration-200"
            >
              {/* Module Header */}
              <div className={`bg-gradient-to-r ${module.color} p-4`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{module.name}</h3>
                    <p className="text-white/80 text-sm">{module.reports.length} relatórios disponíveis</p>
                  </div>
                </div>
              </div>

              {/* Reports List */}
              <div className="p-4 space-y-3">
                {module.reports.map((report) => {
                  const ReportIcon = report.icon;
                  return (
                    <div
                      key={report.id}
                      className="flex items-start justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-1.5 bg-white/10 rounded">
                          <ReportIcon className="h-4 w-4 text-gray-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white truncate">{report.name}</h4>
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{report.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
                              {typeLabels[report.type]}
                            </span>
                            <span className="text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded">
                              {frequencyLabels[report.frequency]}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10"
                          onClick={() => handleGenerateReport(module.id, report.id, 'view')}
                          title="Visualizar relatório"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10"
                          onClick={() => handleGenerateReport(module.id, report.id, 'download')}
                          title="Baixar relatório"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredModules.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Nenhum relatório encontrado</h3>
          <p className="text-gray-400">Tente ajustar os termos de busca</p>
        </div>
      )}
    </div>
  );
}
