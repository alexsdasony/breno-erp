import { LayoutDashboard, DollarSign, Package, ShoppingCart, BarChart3, Users, FileSpreadsheet, Zap, CreditCard, Building, Database, ListChecks, Briefcase, BookOpen, Search, Factory } from 'lucide-react';

export const menuItems = [
  { id: 'receita', label: 'Receita Federal', icon: Search },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'financial', label: 'Financeiro', icon: DollarSign },
  { id: 'accountsPayable', label: 'Contas a Pagar', icon: ListChecks },
  { id: 'billing', label: 'Cobranças', icon: CreditCard },
  { id: 'inventory', label: 'Estoque', icon: Package },
  { id: 'sales', label: 'Vendas', icon: ShoppingCart },
  { id: 'customers', label: 'Clientes', icon: Users },
  { id: 'suppliers', label: 'Fornecedores', icon: Factory },
  { id: 'costCenters', label: 'Centros de Custo', icon: Building },
  { id: 'chartOfAccounts', label: 'Plano de Contas', icon: BookOpen },
  { id: 'segments', label: 'Segmentos', icon: Briefcase },
  { id: 'nfe', label: 'Emissão NF-e', icon: FileSpreadsheet },
  // { id: 'integrations', label: 'Integrações', icon: Zap }, // REMOVED - causing issues
  { id: 'reports', label: 'Relatórios', icon: BarChart3 },
  { id: 'schema', label: 'Schema do Banco', icon: Database },
];