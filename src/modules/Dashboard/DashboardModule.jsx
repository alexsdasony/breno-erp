'use client';

import { TrendingUp, ShoppingCart, Wallet, AlertCircle } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { KpiCard } from './components/KpiCard.jsx';
import { ChartCard } from './components/ChartCard.jsx';
import { TopCustomersTable } from './components/TopCustomersTable.jsx';
import { LowStockTable } from './components/LowStockTable.jsx';
import { useDashboardMock } from './hooks/useDashboardMock.js';
import { formatMonthYear } from '@/utils/format.js';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const DashboardSkeleton = () => (
  <div className="space-y-6">
    {/* KPIs Skeleton */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      ))}
    </div>
    
    {/* Charts Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-80 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      ))}
    </div>
    
    {/* Tables Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      ))}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {label}
        </p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm text-gray-600 dark:text-gray-400">
            {entry.name}: {entry.value.toLocaleString('pt-BR')}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const DashboardModule = () => {
  const { data, loading } = useDashboardMock();

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!data) {
    return <div>Erro ao carregar dados do dashboard</div>;
  }

  return (
    <div className="space-y-6">
      {/* KPIs Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          title="Receita MTD"
          value={data.revenueMTD}
          delta={data.mtdDelta}
          icon={<TrendingUp className="w-6 h-6" />}
          formatAsCurrency
        />
        <KpiCard
          title="Pedidos MTD"
          value={data.ordersMTD}
          icon={<ShoppingCart className="w-6 h-6" />}
          formatAsNumber
        />
        <KpiCard
          title="Ticket Médio"
          value={data.avgTicketMTD}
          icon={<Wallet className="w-6 h-6" />}
          formatAsCurrency
        />
        <KpiCard
          title="Recebíveis"
          value={data.openReceivables}
          subtitle={`R$ ${data.overdueReceivables.toLocaleString('pt-BR')} vencidos`}
          icon={<AlertCircle className="w-6 h-6" />}
          formatAsCurrency
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Receita - Últimos 12 Meses"
          description="Evolução da receita mensal"
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.areaRevenueSeries}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis
                dataKey="month"
                tickFormatter={(value) => formatMonthYear(value)}
                className="text-xs text-gray-600 dark:text-gray-400"
              />
              <YAxis
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                className="text-xs text-gray-600 dark:text-gray-400"
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Pedidos - Últimos 12 Meses"
          description="Quantidade de pedidos mensais"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.barOrdersSeries}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis
                dataKey="month"
                tickFormatter={(value) => formatMonthYear(value)}
                className="text-xs text-gray-600 dark:text-gray-400"
              />
              <YAxis className="text-xs text-gray-600 dark:text-gray-400" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Participação por Segmento"
          description="Distribuição da receita por segmento"
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.pieSegmentsSeries}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.pieSegmentsSeries.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Funil de Conversão"
          description="Leads → Propostas → Pedidos → Faturados"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data.funnelSeries}
              layout="horizontal"
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis type="number" className="text-xs text-gray-600 dark:text-gray-400" />
              <YAxis dataKey="name" type="category" className="text-xs text-gray-600 dark:text-gray-400" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopCustomersTable customers={data.topCustomers} />
        <LowStockTable products={data.lowStockProducts} />
      </div>
    </div>
  );
};

export default DashboardModule;
