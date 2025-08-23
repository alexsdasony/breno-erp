'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Briefcase, LogOut, UserCircle, ShieldAlert, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

import { useAppData } from '@/hooks/useAppData';
import { menuItems as appMenuItems } from '@/config/menuConfig'; 
import { getRouteFromMenuId, getMenuIdFromRoute } from '@/config/routeConfig';

const ErpLayout = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const { currentUser, logoutUser, segments, activeSegmentId, setActiveSegmentId, authLoading, metrics } = useAppData();

  const isAdmin = currentUser?.role === 'admin';

  const menuItems = React.useMemo(() => [
    ...appMenuItems,
    { id: 'profile', label: 'Meu Perfil', icon: UserCircle } 
  ], []);

  // Determinar o módulo ativo baseado na rota atual
  const activeModule = React.useMemo(() => {
    return getMenuIdFromRoute(pathname);
  }, [pathname]);

  React.useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <div className="w-8 h-8 text-white">🚀</div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Breno ERP</h2>
          <p className="text-gray-400">Carregando...</p>
          <div className="mt-4 flex justify-center">
            <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  const handleSegmentChange = async (segmentId) => {
    console.log('🔄 Mudando segmento para:', segmentId);
    setActiveSegmentId(segmentId);
  };

  const handleLogout = () => {
    logoutUser();
    toast({ title: "Logout realizado", description: "Você foi desconectado." });
    router.push('/login');
  };

  const safeSegments = segments || [];
  const safeActiveSegmentId = activeSegmentId || 0;

  const ModuleLoadingFallback = () => (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">Carregando módulo...</p>
      </div>
        </div>
      );

  const handleNavigation = (moduleId) => {
    setSidebarOpen(false);
    
    // Usar o mapeamento de rotas correto
    const route = getRouteFromMenuId(moduleId);
    console.log(`🔄 Navegando para: ${moduleId} -> ${route}`);
    
    // Navegar para a rota correta
    router.push(route);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:relative lg:flex-shrink-0`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Breno ERP</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-gray-400 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>



          {/* Segment Selector */}
          {safeSegments.length > 0 && (
            <div className="p-4 border-b border-slate-700/50">
              <label className="block text-xs font-medium text-gray-400 mb-2">
                Segmento
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between text-left">
                    <span className="truncate">
                      {safeSegments.find(s => s.id === safeActiveSegmentId)?.name || 'Todos os Segmentos'}
                    </span>
                    <ChevronsUpDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full min-w-[200px]">
                  <DropdownMenuLabel>Selecionar Segmento</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleSegmentChange(0)}>
                    Todos os Segmentos
                  </DropdownMenuItem>
                  {safeSegments.map((segment) => (
                    <DropdownMenuItem
                      key={segment.id}
                      onClick={() => handleSegmentChange(segment.id)}
                    >
                      {segment.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
              const isActive = activeModule === item.id;
              const isAdminOnly = false; // Removido schema viewer
              
              if (isAdminOnly) return null;

                return (
                <button
                    key={item.id}
                  id={`menu-${item.id}`}
                  onClick={() => handleNavigation(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
                );
              })}
            </nav>


        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50 p-4">
            <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                className="lg:hidden text-gray-400 hover:text-white"
                onClick={() => setSidebarOpen(true)}
                >
                <Menu className="w-5 h-5" />
                </Button>
              <h2 className="text-lg font-semibold text-white">
                {menuItems.find(item => item.id === activeModule)?.label || 'Dashboard'}
              </h2>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Quick Stats */}
              <div className="hidden md:flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-xs text-gray-400">Receita Total</p>
                  <p className="text-sm font-semibold text-green-400">
                    R$ {metrics?.totalRevenue?.toLocaleString('pt-BR') || '0'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Despesas</p>
                  <p className="text-sm font-semibold text-red-400">
                    R$ {metrics?.totalExpenses?.toLocaleString('pt-BR') || '0'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Lucro</p>
                  <p className="text-sm font-semibold text-blue-400">
                    R$ {metrics?.netProfit?.toLocaleString('pt-BR') || '0'}
                  </p>
                </div>
              </div>

              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 text-white hover:bg-slate-700/50">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <UserCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium truncate">
                        {currentUser?.name || 'Usuário'}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {currentUser?.email || 'usuario@exemplo.com'}
                      </p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <UserCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{currentUser?.name || 'Usuário'}</p>
                        <p className="text-xs text-gray-500">{currentUser?.email || 'usuario@exemplo.com'}</p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
                    <UserCircle className="w-4 h-4 mr-2" />
                    Meu Perfil
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <Suspense fallback={<ModuleLoadingFallback />}>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeModule}-${pathname}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default ErpLayout;
