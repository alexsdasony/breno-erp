import { menuItems } from './menuConfig';

// Mapeamento de IDs do menu para rotas
const routeMapping: Record<string, string> = {
  receita: '/receita',
  dashboard: '/dashboard',
  financial: '/financial',
  accountsPayable: '/accounts-payable',
  billing: '/billing',
  inventory: '/inventory',
  sales: '/sales',
  customers: '/customers',
  suppliers: '/suppliers',
  costCenters: '/cost-centers',
  chartOfAccounts: '/chart-of-accounts',
  segments: '/segments',
  nfe: '/nfe',
  reports: '/reports',
  profile: '/profile'
};

// Função para obter rota a partir do ID do menu
export const getRouteFromMenuId = (menuId: string): string => {
  return routeMapping[menuId] || '/dashboard';
};

// Função para obter ID do menu a partir da rota
export const getMenuIdFromRoute = (pathname: string): string => {
  const route = pathname.split('/')[1]; // Remove a primeira barra
  const menuId = Object.keys(routeMapping).find(key => routeMapping[key] === `/${route}`);
  return menuId || 'dashboard';
};

// Função para verificar se uma rota está ativa
export const isRouteActive = (currentPath: string, menuId: string): boolean => {
  const route = routeMapping[menuId];
  return currentPath === route || currentPath.startsWith(route + '/');
};

// Função para obter configuração do menu por ID
export const getMenuConfigById = (menuId: string) => {
  return menuItems.find((item: any) => item.id === menuId);
};

// Função para obter todos os itens do menu
export const getAllMenuItems = () => {
  return menuItems;
};
