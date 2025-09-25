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
          <div class="stat-value" style="color: ${(data.data.balance || 0) >= 0 ? '#10b981' : '#ef4444'}">
            R$ ${(data.data.balance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div class="stat-label">Saldo</div>
        </div>
      </div>
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
          <div class="stat-value" style="color: ${(data.data.profit || 0) >= 0 ? '#10b981' : '#ef4444'}">
            R$ ${(data.data.profit || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div class="stat-label">Lucro</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${(data.data.profitMargin || 0).toFixed(1)}%</div>
          <div class="stat-label">Margem</div>
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
        <div class="table-container">
          <table class="report-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${customers.map((customer: any) => `
                <tr>
                  <td>${customer.name || 'N/A'}</td>
                  <td>${customer.email || 'N/A'}</td>
                  <td>${customer.phone || 'N/A'}</td>
                  <td>
                    <span class="status-badge ${customer.status === 'active' ? 'active' : 'inactive'}">
                      ${customer.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
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
        <div class="table-container">
          <table class="report-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${suppliers.map((supplier: any) => `
                <tr>
                  <td>${supplier.name || 'N/A'}</td>
                  <td>${supplier.email || 'N/A'}</td>
                  <td>${supplier.phone || 'N/A'}</td>
                  <td>
                    <span class="status-badge ${supplier.status === 'active' ? 'active' : 'inactive'}">
                      ${supplier.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  };

  const generateGenericHTML = (data: any) => {
    const hasData = data?.data && Object.keys(data.data).length > 0;
    
    if (!hasData || (data.data && Object.values(data.data).every(val => val === 0 || val === null || val === '' || (Array.isArray(val) && val.length === 0)))) {
      return `
        <div class="empty-state">
          <div class="icon">📊</div>
          <h3>Nenhum dado encontrado</h3>
          <p>Não foram encontrados dados para o período selecionado.</p>
        </div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">0</div>
            <div class="stat-label">Total de Registros</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">R$ 0,00</div>
            <div class="stat-label">Valor Total</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">0</div>
            <div class="stat-label">Itens Processados</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">0%</div>
            <div class="stat-label">Taxa de Sucesso</div>
          </div>
        </div>
      `;
    }

    // Se há dados, mostrar em formato elegante
    let content = '<div class="stats-grid">';
    
    const dataObj = data.data || {};
    let cardCount = 0;
    
    Object.entries(dataObj).forEach(([key, value]: [string, any]) => {
      if (cardCount >= 8) return; // Limitar a 8 cards
      
      let displayValue = value;
      let label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      
      if (typeof value === 'number') {
        if (key.toLowerCase().includes('value') || key.toLowerCase().includes('amount') || key.toLowerCase().includes('total')) {
          displayValue = `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        } else if (key.toLowerCase().includes('percentage') || key.toLowerCase().includes('rate')) {
          displayValue = `${value}%`;
        } else {
          displayValue = value.toLocaleString('pt-BR');
        }
      } else if (Array.isArray(value)) {
        displayValue = value.length;
        label = `Total de ${label}`;
      } else if (typeof value === 'string') {
        displayValue = value;
      } else if (typeof value === 'object' && value !== null) {
        displayValue = Object.keys(value).length;
        label = `Itens em ${label}`;
      }
      
      content += `
        <div class="stat-card">
          <div class="stat-value">${displayValue}</div>
          <div class="stat-label">${label}</div>
        </div>
      `;
      cardCount++;
    });
    
    content += '</div>';
    
    return content;
  };

  // Funções específicas para outros tipos de relatórios
  const generateCustomerSegmentationHTML = (data: any) => {
    const hasData = data?.data?.segments && data.data.segments.length > 0;
    
    if (!hasData) {
      return `
        <div class="empty-state">
          <div class="icon">👥</div>
          <h3>Nenhuma segmentação encontrada</h3>
          <p>Não há clientes para segmentar no período selecionado.</p>
        </div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">0</div>
            <div class="stat-label">Total de Clientes</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">0</div>
            <div class="stat-label">Segmentos Ativos</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">0</div>
            <div class="stat-label">Clientes Premium</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">0</div>
            <div class="stat-label">Novos Clientes</div>
          </div>
        </div>
      `;
    }

    return `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${data.data.totalCustomers || 0}</div>
          <div class="stat-label">Total de Clientes</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${data.data.segments.length}</div>
          <div class="stat-label">Segmentos</div>
        </div>
      </div>
      <div class="summary-section">
        <div class="summary-title">Segmentos de Clientes</div>
        <div class="summary-stats">
          ${data.data.segments.map((segment: any) => `
            <div class="stat-item">
              <span class="stat-label">${segment.name}</span>
              <span class="stat-value">${segment.count} clientes</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  };
  
  const generateCustomerLifetimeValueHTML = (data: any) => {
    const hasData = data?.data?.customers && data.data.customers.length > 0;
    
    if (!hasData) {
      return `
        <div class="empty-state">
          <div class="icon">💰</div>
          <h3>Nenhum LTV calculado</h3>
          <p>Não há dados suficientes para calcular o Lifetime Value dos clientes.</p>
        </div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">R$ 0,00</div>
            <div class="stat-label">LTV Médio</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">R$ 0,00</div>
            <div class="stat-label">Maior LTV</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">0</div>
            <div class="stat-label">Clientes Analisados</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">0 meses</div>
            <div class="stat-label">Tempo Médio</div>
          </div>
        </div>
      `;
    }

    return `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">R$ ${(data.data.averageLtv || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <div class="stat-label">LTV Médio</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">R$ ${(data.data.maxLtv || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <div class="stat-label">Maior LTV</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${data.data.customers.length}</div>
          <div class="stat-label">Clientes Analisados</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${data.data.averageLifetime || 0} meses</div>
          <div class="stat-label">Tempo Médio</div>
        </div>
      </div>
    `;
  };
  
  const generateSupplierPerformanceHTML = (data: any) => {
    const hasData = data?.data?.suppliers && data.data.suppliers.length > 0;
    
    if (!hasData) {
      return `
        <div class="empty-state">
          <div class="icon">🏭</div>
          <h3>Nenhuma performance encontrada</h3>
          <p>Não há dados de performance de fornecedores no período.</p>
        </div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">0</div>
            <div class="stat-label">Fornecedores Ativos</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">0%</div>
            <div class="stat-label">Taxa de Entrega</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">R$ 0,00</div>
            <div class="stat-label">Volume Total</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">0</div>
            <div class="stat-label">Pedidos Realizados</div>
          </div>
        </div>
      `;
    }

    return `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${data.data.suppliers.length}</div>
          <div class="stat-label">Fornecedores Ativos</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${data.data.averageRating || 0}⭐</div>
          <div class="stat-label">Avaliação Média</div>
        </div>
      </div>
    `;
  };
  const generateAccountsPayableHTML = (data: any, reportId: string) => {
    if (reportId === 'aging-analysis') {
      const hasData = data?.data && Object.keys(data.data).length > 0;
      
      if (!hasData) {
        return `
          <div class="empty-state">
            <div class="icon">📋</div>
            <h3>Nenhuma conta a pagar encontrada</h3>
            <p>Não há contas em aberto no período selecionado.</p>
          </div>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">R$ 0,00</div>
              <div class="stat-label">Total em Aberto</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">0</div>
              <div class="stat-label">Contas Vencidas</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">R$ 0,00</div>
              <div class="stat-label">Valor Vencido</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">0</div>
              <div class="stat-label">Contas a Vencer</div>
            </div>
          </div>
        `;
      }

      return `
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">R$ ${(data.data.totalAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <div class="stat-label">Total em Aberto</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${data.data.overdueCount || 0}</div>
            <div class="stat-label">Contas Vencidas</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">R$ ${(data.data.overdueAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <div class="stat-label">Valor Vencido</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${data.data.upcomingCount || 0}</div>
            <div class="stat-label">Contas a Vencer</div>
          </div>
        </div>
      `;
    }
    
    return generateGenericHTML(data);
  };
  
  const generateBillingHTML = (data: any, reportId: string) => {
    if (reportId === 'collection-efficiency') {
      const hasData = data?.data?.efficiency !== undefined;
      
      if (!hasData) {
        return `
          <div class="empty-state">
            <div class="icon">💳</div>
            <h3>Nenhum dado de cobrança encontrado</h3>
            <p>Não há informações de eficiência de cobrança no período.</p>
          </div>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">0%</div>
              <div class="stat-label">Eficiência</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">0</div>
              <div class="stat-label">Contas Pagas</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">0</div>
              <div class="stat-label">Total de Contas</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">0%</div>
              <div class="stat-label">Taxa de Sucesso</div>
            </div>
          </div>
        `;
      }

      return `
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${data.data.efficiency}%</div>
            <div class="stat-label">Eficiência</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${data.data.paidAccounts || 0}</div>
            <div class="stat-label">Contas Pagas</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${data.data.totalAccounts || 0}</div>
            <div class="stat-label">Total de Contas</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${data.data.successRate}%</div>
            <div class="stat-label">Taxa de Sucesso</div>
          </div>
        </div>
      `;
    }
    
    return generateGenericHTML(data);
  };
  const generateInventoryHTML = (data: any, reportId: string) => {
    if (reportId === 'stock-levels') {
      const hasData = data?.data?.totalProducts > 0;
      
      if (!hasData) {
        return `
          <div class="empty-state">
            <div class="icon">📦</div>
            <h3>Nenhum produto no estoque</h3>
            <p>Não há produtos cadastrados no sistema.</p>
          </div>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">0</div>
              <div class="stat-label">Total de Produtos</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">0</div>
              <div class="stat-label">Estoque Normal</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">0</div>
              <div class="stat-label">Estoque Baixo</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">0</div>
              <div class="stat-label">Sem Estoque</div>
            </div>
          </div>
        `;
      }

      return `
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${data.data.totalProducts}</div>
            <div class="stat-label">Total de Produtos</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${data.data.normalStock || 0}</div>
            <div class="stat-label">Estoque Normal</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${data.data.lowStock || 0}</div>
            <div class="stat-label">Estoque Baixo</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${data.data.outOfStock || 0}</div>
            <div class="stat-label">Sem Estoque</div>
          </div>
        </div>
      `;
    }
    
    return generateGenericHTML(data);
  };
  
  const generateSalesHTML = (data: any, reportId: string) => {
    if (reportId === 'sales-performance') {
      const hasData = data?.data?.totalSales > 0;
      
      if (!hasData) {
        return `
          <div class="empty-state">
            <div class="icon">📈</div>
            <h3>Nenhuma venda encontrada</h3>
            <p>Não há vendas registradas no período selecionado.</p>
          </div>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">0</div>
              <div class="stat-label">Total de Vendas</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">R$ 0,00</div>
              <div class="stat-label">Receita Total</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">R$ 0,00</div>
              <div class="stat-label">Ticket Médio</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">0%</div>
              <div class="stat-label">Crescimento</div>
            </div>
          </div>
        `;
      }

      return `
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${data.data.totalSales}</div>
            <div class="stat-label">Total de Vendas</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">R$ ${(data.data.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <div class="stat-label">Receita Total</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">R$ ${(data.data.averageTicket || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <div class="stat-label">Ticket Médio</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${data.data.growth || 0}%</div>
            <div class="stat-label">Crescimento</div>
          </div>
        </div>
      `;
    }
    
    return generateGenericHTML(data);
  };
  
  const generateDashboardHTML = (data: any, reportId: string) => {
    if (reportId === 'kpi-overview') {
      const hasData = data?.data && Object.keys(data.data).length > 0;
      
      if (!hasData) {
        return `
          <div class="empty-state">
            <div class="icon">📊</div>
            <h3>Nenhum KPI disponível</h3>
            <p>Não há dados suficientes para calcular os KPIs no período.</p>
          </div>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">R$ 0,00</div>
              <div class="stat-label">Receita Total</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">0</div>
              <div class="stat-label">Vendas Realizadas</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">0</div>
              <div class="stat-label">Novos Clientes</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">R$ 0,00</div>
              <div class="stat-label">Ticket Médio</div>
            </div>
          </div>
        `;
      }

      return `
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">R$ ${(data.data.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <div class="stat-label">Receita Total</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${data.data.totalSales || 0}</div>
            <div class="stat-label">Vendas Realizadas</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${data.data.newCustomers || 0}</div>
            <div class="stat-label">Novos Clientes</div>
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
    if (reportId === 'nfe-issued') {
      const hasData = data?.data?.totalIssued > 0;
      
      if (!hasData) {
        return `
          <div class="empty-state">
            <div class="icon">📄</div>
            <h3>Nenhuma NFe emitida</h3>
            <p>Não há NFes emitidas no período selecionado.</p>
          </div>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">0</div>
              <div class="stat-label">NFes Emitidas</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">R$ 0,00</div>
              <div class="stat-label">Valor Total</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">0</div>
              <div class="stat-label">Autorizadas</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">0</div>
              <div class="stat-label">Rejeitadas</div>
            </div>
          </div>
        `;
      }

      return `
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${data.data.totalIssued}</div>
            <div class="stat-label">NFes Emitidas</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">R$ ${(data.data.totalValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <div class="stat-label">Valor Total</div>
          </div>
        </div>
      `;
    } else if (reportId === 'nfe-status') {
      const hasData = data?.data?.total > 0;
      
      if (!hasData) {
        return `
          <div class="empty-state">
            <div class="icon">📊</div>
            <h3>Nenhuma NFe para análise</h3>
            <p>Não há NFes com status para análise no período.</p>
          </div>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">0</div>
              <div class="stat-label">Total de NFes</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">0</div>
              <div class="stat-label">Autorizadas</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">0</div>
              <div class="stat-label">Pendentes</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">0</div>
              <div class="stat-label">Rejeitadas</div>
            </div>
          </div>
        `;
      }

      return `
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${data.data.total}</div>
            <div class="stat-label">Total de NFes</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${data.data.authorized || 0}</div>
            <div class="stat-label">Autorizadas</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${data.data.pending || 0}</div>
            <div class="stat-label">Pendentes</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${data.data.rejected || 0}</div>
            <div class="stat-label">Rejeitadas</div>
          </div>
        </div>
      `;
    }
    
    return generateGenericHTML(data);
  };

  const handleGenerateReport = async (moduleId: string, reportId: string, action: 'view' | 'download') => {
    try {
      console.log(`Gerando relatório ${reportId} do módulo ${moduleId} - Ação: ${action}`);
      
      // Definir período padrão (últimos 30 dias)
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      // Determinar formato baseado na ação
      const format = action === 'download' ? 'pdf' : 'json';
      
      const response = await fetch(`/api/reports?module=${moduleId}&report=${reportId}&format=${format}&startDate=${startDate}&endDate=${endDate}`);
      
      console.log('📊 Response status:', response.status);
      console.log('📊 Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro na resposta:', errorText);
        throw new Error(`Erro ao gerar relatório: ${response.status} - ${errorText}`);
      }
      
      const responseData = await response.json();
      console.log('📊 Dados recebidos:', responseData);
      
      // Extrair dados da resposta da API
      const data = responseData.data || responseData;
      console.log('📊 Dados extraídos:', data);
      
      if (action === 'view') {
        // Gerar HTML específico baseado no módulo e relatório
        let reportContent = '';
        const reportTitle = data.title || 'Relatório';
        const reportPeriod = data.period || 'N/A';
        
        if (moduleId === 'financial') {
          if (reportId === 'cash-flow') {
            reportContent = generateCashFlowHTML(data);
          } else if (reportId === 'profit-loss') {
            reportContent = generateProfitLossHTML(data);
          } else {
            reportContent = generateGenericHTML(data);
          }
        } else if (moduleId === 'customers') {
          if (reportId === 'customer-list') {
            reportContent = generateCustomerListHTML(data);
          } else if (reportId === 'customer-segmentation') {
            reportContent = generateCustomerSegmentationHTML(data);
          } else if (reportId === 'customer-lifetime-value') {
            reportContent = generateCustomerLifetimeValueHTML(data);
          } else {
            reportContent = generateGenericHTML(data);
          }
        } else if (moduleId === 'suppliers') {
          if (reportId === 'supplier-list') {
            reportContent = generateSupplierListHTML(data);
          } else if (reportId === 'supplier-performance') {
            reportContent = generateSupplierPerformanceHTML(data);
          } else {
            reportContent = generateGenericHTML(data);
          }
        } else if (moduleId === 'payables') {
          reportContent = generateAccountsPayableHTML(data, reportId);
        } else if (moduleId === 'billing') {
          reportContent = generateBillingHTML(data, reportId);
        } else if (moduleId === 'inventory') {
          reportContent = generateInventoryHTML(data, reportId);
        } else if (moduleId === 'sales') {
          reportContent = generateSalesHTML(data, reportId);
        } else if (moduleId === 'dashboard') {
          reportContent = generateDashboardHTML(data, reportId);
        } else if (moduleId === 'nfe') {
          reportContent = generateNfeHTML(data, reportId);
        } else {
          reportContent = generateGenericHTML(data);
        }
        
        // Abrir relatório em nova aba para visualização
        const newWindow = window.open('', '_blank');
        if (newWindow) {
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
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                  }
                  .stat-card {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 20px;
                    border-radius: 12px;
                    text-align: center;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                  }
                  .stat-value {
                    font-size: 2rem;
                    font-weight: 700;
                    margin-bottom: 5px;
                  }
                  .stat-label {
                    font-size: 0.9rem;
                    opacity: 0.9;
                  }
                  .summary-section {
                    margin-bottom: 30px;
                  }
                  .summary-title {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 20px;
                    padding-bottom: 10px;
                    border-bottom: 2px solid #667eea;
                  }
                  .summary-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 15px;
                    margin-bottom: 20px;
                  }
                  .stat-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    border-left: 4px solid #667eea;
                  }
                  .stat-label {
                    font-weight: 500;
                    color: #666;
                  }
                  .stat-value {
                    font-weight: 600;
                    color: #333;
                    font-size: 1.1rem;
                  }
                  .table-container {
                    overflow-x: auto;
                    margin-top: 20px;
                  }
                  .report-table {
                    width: 100%;
                    border-collapse: collapse;
                    background: white;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                  }
                  .report-table th {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 15px;
                    text-align: left;
                    font-weight: 600;
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                  }
                  .report-table td {
                    padding: 15px;
                    border-bottom: 1px solid #eee;
                    color: #333;
                  }
                  .report-table tr:hover {
                    background: #f8f9fa;
                  }
                  .empty-state {
                    text-align: center;
                    padding: 60px 20px;
                    color: #666;
                  }
                  .empty-state .icon {
                    font-size: 4rem;
                    margin-bottom: 20px;
                  }
                  .empty-state h3 {
                    font-size: 1.5rem;
                    margin-bottom: 10px;
                    color: #333;
                  }
                  .empty-state p {
                    font-size: 1rem;
                    line-height: 1.6;
                  }
                  .status-badge {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 0.8rem;
                    font-weight: 500;
                  }
                  .status-badge.active {
                    background: #d4edda;
                    color: #155724;
                  }
                  .status-badge.inactive {
                    background: #f8d7da;
                    color: #721c24;
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
