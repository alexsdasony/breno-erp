import { LayoutDashboard, DollarSign, Package, ShoppingCart, BarChart3, Users, FileSpreadsheet, Zap, CreditCard, Building, Database, ListChecks, Briefcase } from 'lucide-react';

export const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'financial', label: 'Financeiro', icon: DollarSign },
  { id: 'accountsPayable', label: 'Contas a Pagar', icon: ListChecks },
  { id: 'billing', label: 'Cobranças', icon: CreditCard },
  { id: 'inventory', label: 'Estoque', icon: Package },
  { id: 'sales', label: 'Vendas', icon: ShoppingCart },
  { id: 'customers', label: 'Clientes', icon: Users },
  { id: 'costCenters', label: 'Centros de Custo', icon: Building },
  { id: 'segments', label: 'Segmentos', icon: Briefcase },
  { id: 'nfe', label: 'Emissão NF-e', icon: FileSpreadsheet },
  { id: 'integrations', label: 'Integrações', icon: Zap },
  { id: 'reports', label: 'Relatórios', icon: BarChart3 },
  { id: 'schema', label: 'Schema do Banco', icon: Database },
];