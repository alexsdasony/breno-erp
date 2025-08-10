// Mapeamento entre IDs do menu e rotas do Next.js
export const routeMapping = {
  'receita': '/receita',
  'dashboard': '/dashboard',
  'financial': '/financial',
  'accountsPayable': '/accounts-payable',
  'billing': '/billing',
  'inventory': '/inventory',
  'sales': '/sales',
  'customers': '/customers',
  'suppliers': '/suppliers',
  'costCenters': '/cost-centers',
  'chartOfAccounts': '/chart-of-accounts',
  'segments': '/segments',
  'nfe': '/nfe',
  'reports': '/reports',
  'test': '/test',
  'schema': '/schema',
  'profile': '/profile'
};

// Função para obter a rota correta baseada no ID do menu
export const getRouteFromMenuId = (menuId) => {
  return routeMapping[menuId] || '/dashboard';
};

// Função para obter o ID do menu baseado na rota atual
export const getMenuIdFromRoute = (pathname) => {
  const route = pathname.replace(/^\/+/, ''); // Remove barras iniciais
  for (const [menuId, mappedRoute] of Object.entries(routeMapping)) {
    if (mappedRoute.replace(/^\/+/, '') === route) {
      return menuId;
    }
  }
  return 'dashboard'; // Fallback
};
