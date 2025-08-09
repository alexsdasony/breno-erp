import React, { useState, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Briefcase, LogOut, UserCircle, ShieldAlert, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu.jsx';

import { useAppData } from '@/hooks/useAppData.jsx';
import { menuItems as appMenuItems } from '@/config/menuConfig'; 
import { calculateMetrics } from '@/utils/metrics';

// Lazy loading para todos os módulos
const DashboardModule = lazy(() => import('@/modules/DashboardModule'));
const FinancialModule = lazy(() => import('@/modules/FinancialModule'));
const InventoryModule = lazy(() => import('@/modules/InventoryModule'));
const SalesModule = lazy(() => import('@/modules/SalesModule'));
const ReportsModule = lazy(() => import('@/modules/ReportsModule'));
const CustomersModule = lazy(() => import('@/modules/CustomersModule'));
const SuppliersModule = lazy(() => import('@/modules/SuppliersModule'));
const NFeModule = lazy(() => import('@/modules/NFeModule'));
const IntegrationsModule = lazy(() => import('@/modules/IntegrationsModule'));
const BillingModule = lazy(() => import('@/modules/BillingModule'));
const CostCentersModule = lazy(() => import('@/modules/CostCentersModule'));
const ChartOfAccountsModule = lazy(() => import('@/modules/ChartOfAccountsModule'));
const SchemaViewerModule = lazy(() => import('@/modules/SchemaViewerModule'));
const ProfileModule = lazy(() => import('@/modules/ProfileModule'));
const AccountsPayableModule = lazy(() => import('@/modules/AccountsPayableModule'));
const SegmentsModule = lazy(() => import('@/modules/SegmentsModule'));
const ReceitaModule = lazy(() => import('@/modules/ReceitaModule'));
const TestModule = lazy(() => import('@/modules/TestModule'));

const ErpLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState(location.pathname.substring(1) || 'dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const appData = useAppData();
  const { currentUser, logoutUser, data, activeSegmentId, setActiveSegmentId, loading } = appData;
  const metrics = calculateMetrics(data, activeSegmentId);

  const isAdmin = currentUser?.role === 'admin';

  // TODOS OS HOOKS DEVEM SER CHAMADOS ANTES DE QUALQUER EARLY RETURN
  const menuItems = React.useMemo(() => [
    ...appMenuItems,
    { id: 'profile', label: 'Meu Perfil', icon: UserCircle } 
  ], []);

  React.useEffect(() => {
    const currentPath = location.pathname.substring(1);
    if (menuItems.some(item => item.id === currentPath)) {
      setActiveModule(currentPath);
    } else if (currentPath === '' || currentPath === '/') {
      setActiveModule('dashboard');
    }
  }, [location.pathname, menuItems]);

  // AGORA sim podemos fazer early returns
  // Show loading screen during initialization
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">ERP Pro</h2>
          <p className="text-gray-400">Carregando sistema...</p>
          <div className="mt-4 flex justify-center">
            <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Only redirect after loading is complete and user is not authenticated
  if (!currentUser) {
    navigate('/login');
    return null;
  }

  const handleSegmentChange = async (segmentId) => {
    console.log('🔄 Mudando segmento para:', segmentId);
    setActiveSegmentId(segmentId);
  };

  const handleLogout = () => {
    logoutUser();
    toast({ title: "Logout realizado", description: "Você foi desconectado." });
    navigate('/login');
  };
  
  // TEMPORARY FIX - SAFE SEGMENT ACCESS
  const activeSegment = (data.segments || []).find(s => s.id === activeSegmentId);

  // Componente de loading para módulos
  const ModuleLoadingFallback = () => (
    <div className="flex items-center justify-center h-[calc(100vh-200px)]">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 mx-auto animate-pulse">
          <Briefcase className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Carregando módulo...</h2>
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );

  const renderModuleContent = (moduleName) => {
    console.log(`🔍 renderModuleContent chamado para: ${moduleName}`);
    const moduleProps = { ...appData, metrics, toast, setActiveModule };
    
    // Verificar acesso restrito
    if (moduleName === 'schema' && !isAdmin) {
      console.log('🚫 Acesso negado ao módulo schema - usuário não é admin');
      return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center">
          <ShieldAlert className="w-16 h-16 text-yellow-400 mb-4" />
          <h2 className="text-2xl font-semibold text-yellow-300">Acesso Restrito</h2>
          <p className="text-gray-400 mt-2">Este módulo é exclusivo para administradores.</p>
        </div>
      );
    }

    // Mapeamento de módulos com lazy loading
    const moduleMap = {
      'receita': ReceitaModule,
      'dashboard': DashboardModule,
      'financial': FinancialModule,
      'accountsPayable': AccountsPayableModule,
      'billing': BillingModule,
      'inventory': InventoryModule,
      'sales': SalesModule,
      'customers': CustomersModule,
      'suppliers': SuppliersModule,
      'costCenters': CostCentersModule,
      'chartOfAccounts': ChartOfAccountsModule,
      'segments': SegmentsModule,
      'nfe': NFeModule,
      'reports': ReportsModule,
      'schema': SchemaViewerModule,
      'profile': ProfileModule,
      'test': TestModule,
    };

    const ModuleComponent = moduleMap[moduleName];
    
    if (!ModuleComponent) {
      console.error(`❌ Módulo não encontrado: ${moduleName}`);
      console.log('📋 Módulos disponíveis:', Object.keys(moduleMap));
      return <Navigate to="/dashboard" replace />;
    }

    console.log(`🔄 Renderizando módulo: ${moduleName}`);
    console.log('📦 Props passadas:', Object.keys(moduleProps));
    
    return (
      <Suspense fallback={<ModuleLoadingFallback />}>
        <ModuleComponent {...moduleProps} />
      </Suspense>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="flex">
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: sidebarOpen ? 0 : -250 }}
          className="fixed left-0 top-0 h-full w-64 sidebar-gradient backdrop-blur-xl border-r border-white/10 z-50 scrollbar-hide overflow-y-auto"
        >
          <div className="p-6 flex flex-col h-full">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">ERP Pro</h1>
                <p className="text-xs text-gray-400">Gestão Inteligente</p>
              </div>
            </div>

            <nav className="space-y-2 flex-grow">
              {menuItems.map((item) => {
                const Icon = item.icon;
                if (item.id === 'schema' && !isAdmin) {
                  return null; 
                }
                return (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      console.log(`🖱️ Clique no menu: ${item.id}`);
                      console.log(`📍 Navegando para: /${item.id}`);
                      setActiveModule(item.id);
                      navigate(`/${item.id}`);
                    }}
                    id={`menu-${item.id}`}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeModule === item.id
                        ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-blue-500/30 text-white'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </motion.button>
                );
              })}
            </nav>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors duration-200 mt-auto"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sair</span>
            </motion.button>
          </div>
        </motion.div>

        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-14'}`}>
          <motion.header
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="glass-effect border-b border-white/10 p-4 sticky top-0 z-40"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="text-white hover:bg-white/10"
                >
                  {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="bg-slate-800 hover:bg-slate-700 border-slate-700 w-48 justify-between">
                      <span className="truncate">{activeSegment ? activeSegment.name : 'Todos os Segmentos'}</span>
                      <ChevronsUpDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48">
                    <DropdownMenuLabel>Filtrar por Segmento</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => handleSegmentChange(0)}>
                      Todos os Segmentos
                    </DropdownMenuItem>
                    {data.segments.map(segment => (
                      <DropdownMenuItem key={segment.id} onSelect={() => handleSegmentChange(segment.id)}>
                        {segment.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{currentUser?.name || 'Usuário'}</p>
                  <p className="text-xs text-gray-400">
                    {currentUser?.email || 'Sistema ERP Pro'}
                    {isAdmin && <span className="ml-2 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">Admin</span>}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
              </div>
            </div>
          </motion.header>

          <main className="p-6">
            <AnimatePresence mode="wait">
              <Routes>
                {menuItems.map(item => {
                  console.log(`��️ Criando rota para: /${item.id}`);
                  return (
                    <Route 
                      key={item.id} 
                      path={`/${item.id}`} 
                      element={
                        <motion.div
                          key={`${item.id}-${activeSegmentId}`}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                          onAnimationStart={() => console.log(`🎬 Animação iniciada para: ${item.id}`)}
                          onAnimationComplete={() => console.log(`✅ Animação concluída para: ${item.id}`)}
                        >
                          {renderModuleContent(item.id)}
                        </motion.div>
                      } 
                    />
                  );
                })}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ErpLayout;
