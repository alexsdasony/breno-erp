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
          const reportData = data.data;
          const reportTitle = reportData?.title || 'Relatório';
          const reportPeriod = reportData?.period || 'N/A';
          
          // Gerar HTML baseado no tipo de relatório
          let reportContent = '';
          
          if (moduleId === 'financial' && reportId === 'cash-flow') {
            reportContent = generateCashFlowHTML(reportData);
          } else if (moduleId === 'financial' && reportId === 'profit-loss') {
            reportContent = generateProfitLossHTML(reportData);
          } else if (moduleId === 'customers' && reportId === 'customer-list') {
            reportContent = generateCustomerListHTML(reportData);
          } else if (moduleId === 'suppliers' && reportId === 'supplier-list') {
            reportContent = generateSupplierListHTML(reportData);
          } else if (moduleId === 'accounts-payable') {
            reportContent = generateAccountsPayableHTML(reportData, reportId);
          } else if (moduleId === 'billing') {
            reportContent = generateBillingHTML(reportData, reportId);
          } else if (moduleId === 'inventory') {
            reportContent = generateInventoryHTML(reportData, reportId);
          } else if (moduleId === 'sales') {
            reportContent = generateSalesHTML(reportData, reportId);
          } else if (moduleId === 'customers') {
            reportContent = generateCustomersHTML(reportData, reportId);
          } else if (moduleId === 'suppliers') {
            reportContent = generateSuppliersHTML(reportData, reportId);
          } else if (moduleId === 'dashboard') {
            reportContent = generateDashboardHTML(reportData, reportId);
          } else if (moduleId === 'nfe') {
            reportContent = generateNfeHTML(reportData, reportId);
          } else {
            reportContent = generateGenericHTML(reportData);
          }
          
          newWindow.document.write(`
            <html>
              <head>
                <title>${reportTitle}</title>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                  * { margin: 0; padding: 0; box-sizing: border-box; }
                  body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    padding: 20px;
                  }
                  .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                    overflow: hidden;
                  }
                  .header { 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                  }
                  .header h1 { 
                    font-size: 2.5rem; 
                    font-weight: 700; 
                    margin-bottom: 10px;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                  }
                  .header .period { 
                    font-size: 1.1rem; 
                    opacity: 0.9;
                    font-weight: 300;
                  }
                  .content { 
                    padding: 40px; 
                  }
                  .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                  }
                  .stat-card {
                    background: #f8f9fa;
                    border-radius: 8px;
                    padding: 20px;
                    text-align: center;
                    border-left: 4px solid #667eea;
                    transition: transform 0.2s ease;
                  }
                  .stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                  }
                  .stat-value {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #667eea;
                    margin-bottom: 5px;
                  }
                  .stat-label {
                    color: #6c757d;
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                  }
                  .table-container {
                    background: white;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                  }
                  table { 
                    width: 100%; 
                    border-collapse: collapse; 
                  }
                  th { 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 15px;
                    text-align: left;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-size: 0.85rem;
                  }
                  td { 
                    padding: 15px; 
                    border-bottom: 1px solid #e9ecef;
                    color: #495057;
                  }
                  tr:hover {
                    background-color: #f8f9fa;
                  }
                  .empty-state {
                    text-align: center;
                    padding: 60px 20px;
                    color: #6c757d;
                  }
                  .empty-state .icon {
                    font-size: 4rem;
                    margin-bottom: 20px;
                    opacity: 0.5;
                  }
                  .empty-state h3 {
                    font-size: 1.5rem;
                    margin-bottom: 10px;
                    color: #495057;
                  }
                  .empty-state p {
                    font-size: 1rem;
                    line-height: 1.6;
                  }
                  .summary-section {
                    background: #f8f9fa;
                    border-radius: 8px;
                    padding: 20px;
                    margin-bottom: 20px;
                  }
                  .summary-title {
                    font-size: 1.2rem;
                    font-weight: 600;
                    color: #495057;
                    margin-bottom: 15px;
                    display: flex;
                    align-items: center;
                  }
                  .summary-title::before {
                    content: "📊";
                    margin-right: 10px;
                  }
                  .breakdown {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                    margin-top: 15px;
                  }
                  .breakdown-item {
                    background: white;
                    padding: 15px;
                    border-radius: 6px;
                    border-left: 3px solid #667eea;
                  }
                  .breakdown-label {
                    font-size: 0.9rem;
                    color: #6c757d;
                    margin-bottom: 5px;
                  }
                  .breakdown-value {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #495057;
                  }
                  .status-badge {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 500;
                  }
                  
                  .status-badge.normal {
                    background-color: #d1ecf1;
                    color: #0c5460;
                  }
                  
                  .status-badge.critical {
                    background-color: #f8d7da;
                    color: #721c24;
                  }
                  
                  .urgency-badge {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 500;
                  }
                  
                  .urgency-badge.critical {
                    background-color: #f8d7da;
                    color: #721c24;
                  }
                  
                  .urgency-badge.high {
                    background-color: #fff3cd;
                    color: #856404;
                  }
                  
                  .urgency-badge.low {
                    background-color: #d4edda;
                    color: #155724;
                  }
                  
                  .class-badge {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 500;
                  }
                  
                  .class-badge.class-A {
                    background-color: #d4edda;
                    color: #155724;
                  }
                  
                  .class-badge.class-B {
                    background-color: #fff3cd;
                    color: #856404;
                  }
                  
                  .class-badge.class-C {
                    background-color: #f8d7da;
                    color: #721c24;
                  }
                  
                  .trend-badge {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 500;
                  }
                  
                  .trend-badge.up {
                    background-color: #d4edda;
                    color: #155724;
                  }
                  
                  .trend-badge.down {
                    background-color: #f8d7da;
                    color: #721c24;
                  }
                  
                  .trend-badge.stable {
                    background-color: #d1ecf1;
                    color: #0c5460;
                  }
                  
                  .growth-badge {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 500;
                  }
                  
                  .growth-badge.positive {
                    background-color: #d4edda;
                    color: #155724;
                  }
                  
                  .growth-badge.negative {
                    background-color: #f8d7da;
                    color: #721c24;
                  }
                  
                  .segment-badge {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 500;
                  }
                  
                  .segment-badge.segment-vip {
                    background-color: #d4edda;
                    color: #155724;
                  }
                  
                  .segment-badge.segment-alto-valor {
                    background-color: #d1ecf1;
                    color: #0c5460;
                  }
                  
                  .segment-badge.segment-regular {
                    background-color: #fff3cd;
                    color: #856404;
                  }
                  
                  .segment-badge.segment-baixo-valor {
                    background-color: #f8d7da;
                    color: #721c24;
                  }
                  
                  .segment-badge.segment-inativos {
                    background-color: #e2e3e5;
                    color: #6c757d;
                  }
                  
                  @media (max-width: 768px) {
                    .stats-grid {
                      grid-template-columns: 1fr;
                    }
                    .header h1 {
                      font-size: 2rem;
                    }
                    .content {
                      padding: 20px;
                    }
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>${reportTitle}</h1>
                    <div class="period">Período: ${reportPeriod}</div>
                  </div>
                  <div class="content">
                    ${reportContent}
                  </div>
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

  // Funções para gerar HTML específico de cada relatório
  const generateCashFlowHTML = (data: any) => {
    const hasData = data?.data?.inflows > 0 || data?.data?.outflows > 0;
    
    if (!hasData) {
      return `
        <div class="empty-state">
          <div class="icon">💰</div>
          <h3>Nenhum movimento de caixa encontrado</h3>
          <p>Não foram encontradas transações de entrada ou saída de caixa no período selecionado.</p>
        </div>
        <div class="summary-section">
          <div class="summary-title">Resumo do Período</div>
          <div class="breakdown">
            <div class="breakdown-item">
              <div class="breakdown-label">Entradas</div>
              <div class="breakdown-value">R$ 0,00</div>
            </div>
            <div class="breakdown-item">
              <div class="breakdown-label">Saídas</div>
              <div class="breakdown-value">R$ 0,00</div>
            </div>
            <div class="breakdown-item">
              <div class="breakdown-label">Saldo</div>
              <div class="breakdown-value">R$ 0,00</div>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">R$ ${(data.data.inflows || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <div class="stat-label">Entradas</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">R$ ${(data.data.outflows || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <div class="stat-label">Saídas</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: ${(data.data.balance || 0) >= 0 ? '#28a745' : '#dc3545'}">
            R$ ${(data.data.balance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div class="stat-label">Saldo</div>
        </div>
      </div>
      ${data.data.breakdown ? `
        <div class="summary-section">
          <div class="summary-title">Detalhamento</div>
          <div class="breakdown">
            <div class="breakdown-item">
              <div class="breakdown-label">Vendas</div>
              <div class="breakdown-value">R$ ${(data.data.breakdown.sales || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="breakdown-item">
              <div class="breakdown-label">Contas a Receber</div>
              <div class="breakdown-value">R$ ${(data.data.breakdown.receivables || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="breakdown-item">
              <div class="breakdown-label">Contas a Pagar</div>
              <div class="breakdown-value">R$ ${(data.data.breakdown.payables || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>
        </div>
      ` : ''}
    `;
  };

  const generateProfitLossHTML = (data: any) => {
    const hasData = data?.data?.revenue > 0 || data?.data?.costs > 0;
    
    if (!hasData) {
      return `
        <div class="empty-state">
          <div class="icon">📊</div>
          <h3>Nenhuma receita ou custo encontrado</h3>
          <p>Não foram encontradas receitas ou custos no período selecionado.</p>
        </div>
        <div class="summary-section">
          <div class="summary-title">Resumo do Período</div>
          <div class="breakdown">
            <div class="breakdown-item">
              <div class="breakdown-label">Receitas</div>
              <div class="breakdown-value">R$ 0,00</div>
            </div>
            <div class="breakdown-item">
              <div class="breakdown-label">Custos</div>
              <div class="breakdown-value">R$ 0,00</div>
            </div>
            <div class="breakdown-item">
              <div class="breakdown-label">Lucro</div>
              <div class="breakdown-value">R$ 0,00</div>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">R$ ${(data.data.revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <div class="stat-label">Receitas</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">R$ ${(data.data.costs || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <div class="stat-label">Custos</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: ${(data.data.profit || 0) >= 0 ? '#28a745' : '#dc3545'}">
            R$ ${(data.data.profit || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div class="stat-label">Lucro</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${(data.data.profitMargin || 0).toFixed(1)}%</div>
          <div class="stat-label">Margem de Lucro</div>
        </div>
      </div>
    `;
  };

  const generateCustomerListHTML = (data: any) => {
    const customers = data?.data || [];
    
    if (customers.length === 0) {
      return `
        <div class="empty-state">
          <div class="icon">👥</div>
          <h3>Nenhum cliente encontrado</h3>
          <p>Não há clientes cadastrados no sistema.</p>
        </div>
      `;
    }

    return `
      <div class="summary-section">
        <div class="summary-title">Resumo</div>
        <div class="breakdown">
          <div class="breakdown-item">
            <div class="breakdown-label">Total de Clientes</div>
            <div class="breakdown-value">${customers.length}</div>
          </div>
        </div>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Cidade</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${customers.map((customer: any) => `
              <tr>
                <td>${customer.name || 'N/A'}</td>
                <td>${customer.email || 'N/A'}</td>
                <td>${customer.phone || 'N/A'}</td>
                <td>${customer.city || 'N/A'}</td>
                <td>
                  <span style="color: ${customer.status === 'active' ? '#28a745' : '#dc3545'}; font-weight: 600;">
                    ${customer.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  };

  const generateSupplierListHTML = (data: any) => {
    const suppliers = data?.data || [];
    
    if (suppliers.length === 0) {
      return `
        <div class="empty-state">
          <div class="icon">🏭</div>
          <h3>Nenhum fornecedor encontrado</h3>
          <p>Não há fornecedores cadastrados no sistema.</p>
        </div>
      `;
    }

    return `
      <div class="summary-section">
        <div class="summary-title">Resumo</div>
        <div class="breakdown">
          <div class="breakdown-item">
            <div class="breakdown-label">Total de Fornecedores</div>
            <div class="breakdown-value">${suppliers.length}</div>
          </div>
        </div>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Cidade</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${suppliers.map((supplier: any) => `
              <tr>
                <td>${supplier.name || 'N/A'}</td>
                <td>${supplier.email || 'N/A'}</td>
                <td>${supplier.phone || 'N/A'}</td>
                <td>${supplier.city || 'N/A'}</td>
                <td>
                  <span style="color: ${supplier.status === 'active' ? '#28a745' : '#dc3545'}; font-weight: 600;">
                    ${supplier.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  };

  const generateAccountsPayableHTML = (data: any, reportId: string) => {
    const hasData = data?.data && (Array.isArray(data.data) ? data.data.length > 0 : Object.keys(data.data).length > 0);
    
    if (!hasData) {
      return `
        <div class="empty-state">
          <div class="icon">💳</div>
          <h3>Nenhuma conta a pagar encontrada</h3>
          <p>Não há contas a pagar cadastradas no sistema.</p>
        </div>
      `;
    }

    if (reportId === 'payables-aging') {
      return `
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${data.data.current || 0}</div>
            <div class="stat-label">Em Dia</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${data.data.overdue30 || 0}</div>
            <div class="stat-label">Vencidas 30 dias</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${data.data.overdue60 || 0}</div>
            <div class="stat-label">Vencidas 60 dias</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${data.data.overdue90 || 0}</div>
            <div class="stat-label">Vencidas 90+ dias</div>
          </div>
        </div>
      `;
    }

    if (reportId === 'supplier-payments') {
      const suppliers = data.data || [];
      return `
        <div class="summary-section">
          <div class="summary-title">Pagamentos por Fornecedor</div>
          <div class="summary-stats">
            <div class="stat-item">
              <span class="stat-label">Total de Fornecedores:</span>
              <span class="stat-value">${suppliers.length}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Valor Total Pago:</span>
              <span class="stat-value">R$ ${suppliers.reduce((sum: number, s: any) => sum + (s.total_amount || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          <div class="table-container">
            <table class="report-table">
              <thead>
                <tr>
                  <th>Fornecedor</th>
                  <th>Total Pago</th>
                  <th>Qtd Pagamentos</th>
                  <th>Último Pagamento</th>
                </tr>
              </thead>
              <tbody>
                ${suppliers.map((supplier: any) => `
                  <tr>
                    <td>${supplier.supplier_name}</td>
                    <td>R$ ${(supplier.total_amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td>${supplier.payment_count || 0}</td>
                    <td>${supplier.last_payment ? new Date(supplier.last_payment).toLocaleDateString('pt-BR') : 'N/A'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    if (reportId === 'overdue-bills') {
      const bills = data.data || [];
      return `
        <div class="summary-section">
          <div class="summary-title">Contas em Atraso</div>
          <div class="summary-stats">
            <div class="stat-item">
              <span class="stat-label">Total de Contas:</span>
              <span class="stat-value">${bills.length}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Valor Total:</span>
              <span class="stat-value">R$ ${bills.reduce((sum: number, b: any) => sum + (b.amount || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          <div class="table-container">
            <table class="report-table">
              <thead>
                <tr>
                  <th>Fornecedor</th>
                  <th>Descrição</th>
                  <th>Valor</th>
                  <th>Vencimento</th>
                  <th>Dias em Atraso</th>
                </tr>
              </thead>
              <tbody>
                ${bills.map((bill: any) => `
                  <tr>
                    <td>${bill.supplier_name || 'N/A'}</td>
                    <td>${bill.description || 'N/A'}</td>
                    <td>R$ ${(bill.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td>${bill.due_date ? new Date(bill.due_date).toLocaleDateString('pt-BR') : 'N/A'}</td>
                    <td>${bill.days_overdue || 0} dias</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    return generateGenericHTML(data);
  };

  const generateBillingHTML = (data: any, reportId: string) => {
    const hasData = data?.data && (Array.isArray(data.data) ? data.data.length > 0 : Object.keys(data.data).length > 0);
    
    if (!hasData) {
      return `
        <div class="empty-state">
          <div class="icon">💳</div>
          <h3>Nenhuma conta a receber encontrada</h3>
          <p>Não há contas a receber cadastradas no sistema.</p>
        </div>
      `;
    }

    if (reportId === 'receivables-aging') {
      return `
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${data.data.current || 0}</div>
            <div class="stat-label">Em Dia</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${data.data.overdue30 || 0}</div>
            <div class="stat-label">Vencidas 30 dias</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${data.data.overdue60 || 0}</div>
            <div class="stat-label">Vencidas 60 dias</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${data.data.overdue90 || 0}</div>
            <div class="stat-label">Vencidas 90+ dias</div>
          </div>
        </div>
      `;
    }

    if (reportId === 'customer-receivables') {
      const customers = data.data || [];
      return `
        <div class="summary-section">
          <div class="summary-title">Recebíveis por Cliente</div>
          <div class="summary-stats">
            <div class="stat-item">
              <span class="stat-label">Total de Clientes:</span>
              <span class="stat-value">${customers.length}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Valor Total a Receber:</span>
              <span class="stat-value">R$ ${customers.reduce((sum: number, c: any) => sum + (c.total_amount || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          <div class="table-container">
            <table class="report-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Valor Total</th>
                  <th>Qtd Contas</th>
                  <th>Vencimento Mais Antigo</th>
                </tr>
              </thead>
              <tbody>
                ${customers.map((customer: any) => `
                  <tr>
                    <td>${customer.customer_name}</td>
                    <td>R$ ${(customer.total_amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td>${customer.account_count || 0}</td>
                    <td>${customer.oldest_due_date ? new Date(customer.oldest_due_date).toLocaleDateString('pt-BR') : 'N/A'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    return generateGenericHTML(data);
  };

  const generateInventoryHTML = (data: any, reportId: string) => {
    const hasData = data?.data && (Array.isArray(data.data) ? data.data.length > 0 : Object.keys(data.data).length > 0);
    
    if (!hasData) {
      return `
        <div class="empty-state">
          <div class="icon">📦</div>
          <h3>Nenhum produto encontrado</h3>
          <p>Não há produtos cadastrados no sistema.</p>
        </div>
      `;
    }

    if (reportId === 'stock-movement') {
      return `
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${data.data.entries || 0}</div>
            <div class="stat-label">Entradas</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${data.data.exits || 0}</div>
            <div class="stat-label">Saídas</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${data.data.balance || 0}</div>
            <div class="stat-label">Saldo</div>
          </div>
        </div>
      `;
    }

    if (reportId === 'stock-levels') {
      const products = data.data || [];
      return `
        <div class="summary-section">
          <div class="summary-title">Níveis de Estoque</div>
          <div class="summary-stats">
            <div class="stat-item">
              <span class="stat-label">Total de Produtos:</span>
              <span class="stat-value">${products.length}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Produtos com Estoque Baixo:</span>
              <span class="stat-value">${products.filter((p: any) => p.status === 'low_stock' || p.status === 'out_of_stock').length}</span>
            </div>
          </div>
          <div class="table-container">
            <table class="report-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Estoque Atual</th>
                  <th>Estoque Mínimo</th>
                  <th>Status</th>
                  <th>Preço</th>
                </tr>
              </thead>
              <tbody>
                ${products.map((product: any) => `
                  <tr>
                    <td>${product.name}</td>
                    <td>${product.stock_quantity || 0}</td>
                    <td>${product.minimum_stock || product.min_stock || 0}</td>
                    <td>
                      <span class="status-badge ${product.status === 'out_of_stock' ? 'critical' : product.status === 'low_stock' ? 'warning' : 'normal'}">
                        ${product.status === 'out_of_stock' ? 'Sem Estoque' : product.status === 'low_stock' ? 'Estoque Baixo' : 'Normal'}
                      </span>
                    </td>
                    <td>R$ ${(product.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    if (reportId === 'low-stock-alert') {
      const products = data.data || [];
      return `
        <div class="summary-section">
          <div class="summary-title">Produtos com Estoque Baixo</div>
          <div class="summary-stats">
            <div class="stat-item">
              <span class="stat-label">Total de Produtos:</span>
              <span class="stat-value">${products.length}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Críticos (Sem Estoque):</span>
              <span class="stat-value">${products.filter((p: any) => p.urgency === 'critical').length}</span>
            </div>
          </div>
          <div class="table-container">
            <table class="report-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Estoque Atual</th>
                  <th>Estoque Mínimo</th>
                  <th>Urgência</th>
                  <th>Dias Restantes</th>
                </tr>
              </thead>
              <tbody>
                ${products.map((product: any) => `
                  <tr>
                    <td>${product.name}</td>
                    <td>${product.stock_quantity || 0}</td>
                    <td>${product.minimum_stock || product.min_stock || 0}</td>
                    <td>
                      <span class="urgency-badge ${product.urgency}">
                        ${product.urgency === 'critical' ? 'Crítico' : product.urgency === 'high' ? 'Alto' : 'Baixo'}
                      </span>
                    </td>
                    <td>${product.days_remaining || 0} dias</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    return generateGenericHTML(data);
  };

  const generateSalesHTML = (data: any, reportId: string) => {
    const hasData = data?.data && (Array.isArray(data.data) ? data.data.length > 0 : Object.keys(data.data).length > 0);
    
    if (!hasData) {
      return `
        <div class="empty-state">
          <div class="icon">🛒</div>
          <h3>Nenhuma venda encontrada</h3>
          <p>Não há vendas registradas no sistema.</p>
        </div>
      `;
    }

    if (reportId === 'sales-performance') {
      return `
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">R$ ${(data.data.totalSales || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <div class="stat-label">Total de Vendas</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${(data.data.growth || 0).toFixed(1)}%</div>
            <div class="stat-label">Crescimento</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${data.data.topSeller || 'N/A'}</div>
            <div class="stat-label">Top Vendedor</div>
          </div>
        </div>
      `;
    }

    if (reportId === 'top-products') {
      const products = data.data || [];
      return `
        <div class="summary-section">
          <div class="summary-title">Top Produtos</div>
          <div class="summary-stats">
            <div class="stat-item">
              <span class="stat-label">Total de Produtos:</span>
              <span class="stat-value">${products.length}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Receita Total:</span>
              <span class="stat-value">R$ ${products.reduce((sum: number, p: any) => sum + (p.total_revenue || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          <div class="table-container">
            <table class="report-table">
              <thead>
                <tr>
                  <th>Posição</th>
                  <th>Produto</th>
                  <th>Quantidade Vendida</th>
                  <th>Receita Total</th>
                  <th>Ticket Médio</th>
                </tr>
              </thead>
              <tbody>
                ${products.map((product: any, index: number) => `
                  <tr>
                    <td>${index + 1}º</td>
                    <td>${product.name}</td>
                    <td>${product.quantity_sold || 0}</td>
                    <td>R$ ${(product.total_revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td>R$ ${(product.average_price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    if (reportId === 'abc-analysis') {
      const products = data.data || [];
      return `
        <div class="summary-section">
          <div class="summary-title">Análise ABC</div>
          <div class="summary-stats">
            <div class="stat-item">
              <span class="stat-label">Total de Produtos:</span>
              <span class="stat-value">${products.length}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Classe A (80%):</span>
              <span class="stat-value">${products.filter((p: any) => p.class === 'A').length}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Classe B (15%):</span>
              <span class="stat-value">${products.filter((p: any) => p.class === 'B').length}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Classe C (5%):</span>
              <span class="stat-value">${products.filter((p: any) => p.class === 'C').length}</span>
            </div>
          </div>
          <div class="table-container">
            <table class="report-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Classe</th>
                  <th>Valor Total</th>
                  <th>% Acumulado</th>
                  <th>Quantidade</th>
                </tr>
              </thead>
              <tbody>
                ${products.map((product: any) => `
                  <tr>
                    <td>${product.name}</td>
                    <td>
                      <span class="class-badge class-${product.class}">
                        Classe ${product.class}
                      </span>
                    </td>
                    <td>R$ ${(product.total_value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td>${(product.cumulative_percentage || 0).toFixed(1)}%</td>
                    <td>${product.quantity || 0}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    if (reportId === 'sales-forecast') {
      const forecastData = data.data || {};
      return `
        <div class="summary-section">
          <div class="summary-title">Previsão de Vendas</div>
          <div class="summary-stats">
            <div class="stat-item">
              <span class="stat-label">Previsão:</span>
              <span class="stat-value">R$ ${(forecastData.forecast || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Confiança:</span>
              <span class="stat-value">${(forecastData.confidence || 0).toFixed(1)}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Tendência:</span>
              <span class="stat-value">
                <span class="trend-badge ${forecastData.trend || 'stable'}">
                  ${forecastData.trend === 'up' ? '↗ Crescendo' : forecastData.trend === 'down' ? '↘ Decrescendo' : '→ Estável'}
                </span>
              </span>
            </div>
          </div>
          ${forecastData.historicalData && forecastData.historicalData.length > 0 ? `
            <div class="table-container">
              <table class="report-table">
                <thead>
                  <tr>
                    <th>Período</th>
                    <th>Vendas</th>
                    <th>Receita</th>
                    <th>Crescimento</th>
                  </tr>
                </thead>
                <tbody>
                  ${forecastData.historicalData.map((item: any, index: number) => `
                    <tr>
                      <td>${item.period || `Período ${index + 1}`}</td>
                      <td>${item.sales || 0}</td>
                      <td>R$ ${(item.revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td>
                        <span class="growth-badge ${(item.growth || 0) >= 0 ? 'positive' : 'negative'}">
                          ${(item.growth || 0) >= 0 ? '+' : ''}${(item.growth || 0).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : `
            <div class="empty-state">
              <div class="icon">📈</div>
              <h3>Dados históricos insuficientes</h3>
              <p>Não há dados históricos suficientes para gerar uma previsão precisa.</p>
            </div>
          `}
        </div>
      `;
    }

    return generateGenericHTML(data);
  };

  const generateDashboardHTML = (data: any, reportId: string) => {
    const hasData = data?.data && Object.keys(data.data).length > 0;
    
    if (!hasData) {
      return `
        <div class="empty-state">
          <div class="icon">📊</div>
          <h3>Nenhum dado disponível</h3>
          <p>Não há dados suficientes para gerar o relatório.</p>
        </div>
      `;
    }

    if (reportId === 'kpi-overview') {
      return `
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">R$ ${(data.data.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <div class="stat-label">Receita Total</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${data.data.totalCustomers || 0}</div>
            <div class="stat-label">Total de Clientes</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${data.data.totalSales || 0}</div>
            <div class="stat-label">Total de Vendas</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">R$ ${(data.data.averageTicket || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <div class="stat-label">Ticket Médio</div>
          </div>
        </div>
      `;
    }

    return generateGenericHTML(data);
  };

  const generateNfeHTML = (data: any, reportId: string) => {
    const hasData = data?.data && (Array.isArray(data.data) ? data.data.length > 0 : Object.keys(data.data).length > 0);
    
    if (!hasData) {
      return `
        <div class="empty-state">
          <div class="icon">📄</div>
          <h3>Nenhuma NFe encontrada</h3>
          <p>Não há notas fiscais cadastradas no sistema.</p>
        </div>
      `;
    }

    if (reportId === 'nfe-status') {
      return `
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value" style="color: #28a745">${data.data.authorized || 0}</div>
            <div class="stat-label">Autorizadas</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" style="color: #ffc107">${data.data.pending || 0}</div>
            <div class="stat-label">Pendentes</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" style="color: #dc3545">${data.data.rejected || 0}</div>
            <div class="stat-label">Rejeitadas</div>
          </div>
        </div>
      `;
    }

    return generateGenericHTML(data);
  };

  // Função para gerar HTML de relatórios de clientes
  const generateCustomersHTML = (data: any, reportId: string) => {
    const hasData = data?.data && (Array.isArray(data.data) ? data.data.length > 0 : Object.keys(data.data).length > 0);
    
    if (!hasData) {
      return `
        <div class="empty-state">
          <div class="icon">👥</div>
          <h3>Nenhum cliente encontrado</h3>
          <p>Não há clientes cadastrados no sistema.</p>
        </div>
      `;
    }

    if (reportId === 'customer-segmentation') {
      const segments = data.data.segments || [];
      return `
        <div class="summary-section">
          <div class="summary-title">Segmentação de Clientes</div>
          <div class="summary-stats">
            <div class="stat-item">
              <span class="stat-label">Total de Clientes:</span>
              <span class="stat-value">${data.data.totalCustomers || 0}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Clientes Ativos:</span>
              <span class="stat-value">${data.data.activeCustomers || 0}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Clientes Inativos:</span>
              <span class="stat-value">${data.data.inactiveCustomers || 0}</span>
            </div>
          </div>
          <div class="table-container">
            <table class="report-table">
              <thead>
                <tr>
                  <th>Segmento</th>
                  <th>Quantidade</th>
                  <th>% do Total</th>
                  <th>Descrição</th>
                </tr>
              </thead>
              <tbody>
                ${segments.map((segment: any) => `
                  <tr>
                    <td>
                      <span class="segment-badge segment-${segment.name.toLowerCase().replace(' ', '-')}">
                        ${segment.name}
                      </span>
                    </td>
                    <td>${segment.count || 0}</td>
                    <td>${data.data.totalCustomers > 0 ? ((segment.count / data.data.totalCustomers) * 100).toFixed(1) : 0}%</td>
                    <td>${segment.description || 'N/A'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    if (reportId === 'customer-lifetime-value') {
      const topCustomers = data.data.topCustomers || [];
      return `
        <div class="summary-section">
          <div class="summary-title">Valor Vitalício do Cliente (LTV)</div>
          <div class="summary-stats">
            <div class="stat-item">
              <span class="stat-label">LTV Médio:</span>
              <span class="stat-value">R$ ${(data.data.averageLTV || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Total de Clientes:</span>
              <span class="stat-value">${data.data.totalCustomers || 0}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Clientes Ativos:</span>
              <span class="stat-value">${data.data.activeCustomers || 0}</span>
            </div>
          </div>
          <div class="table-container">
            <table class="report-table">
              <thead>
                <tr>
                  <th>Posição</th>
                  <th>Cliente</th>
                  <th>LTV</th>
                  <th>Receita Total</th>
                  <th>Qtd Vendas</th>
                </tr>
              </thead>
              <tbody>
                ${topCustomers.map((customer: any) => `
                  <tr>
                    <td>${customer.rank || 'N/A'}</td>
                    <td>${customer.name}</td>
                    <td>R$ ${(customer.ltv || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td>R$ ${(customer.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td>${customer.salesCount || 0}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    return generateGenericHTML(data);
  };

  // Função para gerar HTML de relatórios de fornecedores
  const generateSuppliersHTML = (data: any, reportId: string) => {
    const hasData = data?.data && (Array.isArray(data.data) ? data.data.length > 0 : Object.keys(data.data).length > 0);
    
    if (!hasData) {
      return `
        <div class="empty-state">
          <div class="icon">🏭</div>
          <h3>Nenhum fornecedor encontrado</h3>
          <p>Não há fornecedores cadastrados no sistema.</p>
        </div>
      `;
    }

    if (reportId === 'supplier-list') {
      const suppliers = data.data || [];
      return `
        <div class="summary-section">
          <div class="summary-title">Lista de Fornecedores</div>
          <div class="summary-stats">
            <div class="stat-item">
              <span class="stat-label">Total de Fornecedores:</span>
              <span class="stat-value">${suppliers.length}</span>
            </div>
          </div>
          <div class="table-container">
            <table class="report-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>CNPJ/CPF</th>
                  <th>Email</th>
                  <th>Telefone</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${suppliers.map((supplier: any) => `
                  <tr>
                    <td>${supplier.name || 'N/A'}</td>
                    <td>${supplier.tax_id || 'N/A'}</td>
                    <td>${supplier.email || 'N/A'}</td>
                    <td>${supplier.phone || 'N/A'}</td>
                    <td>
                      <span class="status-badge ${supplier.status === 'active' || supplier.status === 'ativo' ? 'success' : 'danger'}">
                        ${supplier.status === 'active' || supplier.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    if (reportId === 'supplier-performance') {
      const suppliers = data.data.suppliers || [];
      return `
        <div class="summary-section">
          <div class="summary-title">Performance de Fornecedores</div>
          <div class="summary-stats">
            <div class="stat-item">
              <span class="stat-label">Total de Fornecedores:</span>
              <span class="stat-value">${data.data.totalSuppliers || 0}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Fornecedores Ativos:</span>
              <span class="stat-value">${data.data.activeSuppliers || 0}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Avaliação Média:</span>
              <span class="stat-value">${data.data.averageRating || 0} ⭐</span>
            </div>
          </div>
          <div class="table-container">
            <table class="report-table">
              <thead>
                <tr>
                  <th>Fornecedor</th>
                  <th>Avaliação</th>
                  <th>Entrega no Prazo</th>
                  <th>Qualidade</th>
                  <th>Total Pedidos</th>
                  <th>Último Pedido</th>
                </tr>
              </thead>
              <tbody>
                ${suppliers.map((supplier: any) => `
                  <tr>
                    <td>${supplier.name}</td>
                    <td>
                      <span class="rating-badge">
                        ${'⭐'.repeat(supplier.rating || 0)}
                      </span>
                    </td>
                    <td>${supplier.onTimeDelivery || 0}%</td>
                    <td>${supplier.qualityScore || 0}%</td>
                    <td>${supplier.totalOrders || 0}</td>
                    <td>${supplier.lastOrderDate ? new Date(supplier.lastOrderDate).toLocaleDateString('pt-BR') : 'N/A'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    if (reportId === 'purchase-analysis') {
      const topSuppliers = data.data.topSuppliers || [];
      return `
        <div class="summary-section">
          <div class="summary-title">Análise de Compras</div>
          <div class="summary-stats">
            <div class="stat-item">
              <span class="stat-label">Total de Compras:</span>
              <span class="stat-value">${data.data.totalPurchases || 0}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Valor Médio:</span>
              <span class="stat-value">R$ ${(data.data.averageValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          <div class="table-container">
            <table class="report-table">
              <thead>
                <tr>
                  <th>Posição</th>
                  <th>Fornecedor</th>
                  <th>Total de Compras</th>
                  <th>Valor Total</th>
                  <th>Valor Médio por Pedido</th>
                </tr>
              </thead>
              <tbody>
                ${topSuppliers.map((supplier: any) => `
                  <tr>
                    <td>${supplier.rank || 'N/A'}</td>
                    <td>${supplier.name}</td>
                    <td>${supplier.totalPurchases || 0}</td>
                    <td>R$ ${(supplier.totalValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td>R$ ${(supplier.averageOrderValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    return generateGenericHTML(data);
  };

  // Função para gerar HTML de relatórios de clientes
  const generateGenericHTML = (data: any) => {
    return `
      <div class="summary-section">
        <div class="summary-title">Dados do Relatório</div>
        <pre style="background: #f8f9fa; padding: 20px; border-radius: 8px; overflow-x: auto; font-family: 'Courier New', monospace; font-size: 0.9rem; line-height: 1.4;">
${JSON.stringify(data, null, 2)}
        </pre>
      </div>
    `;
  };
}
