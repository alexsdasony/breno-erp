'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Briefcase, LogOut, UserCircle, ShieldAlert, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu.jsx';

import { useAppData } from '@/hooks/useAppData.jsx';
import { menuItems as appMenuItems } from '@/config/menuConfig'; 
import { calculateMetrics } from '@/utils/metrics';

const ErpLayout = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [activeModule, setActiveModule] = useState(pathname.substring(1) || 'dashboard');
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
    const currentPath = pathname.substring(1);
    if (menuItems.some(item => item.id === currentPath)) {
      setActiveModule(currentPath);
    } else if (currentPath === '' || currentPath === '/') {
      setActiveModule('dashboard');
    }
  }, [pathname, menuItems]);

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
    router.push('/login');
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
  
  // TEMPORARY FIX - SAFE SEGMENT ACCESS
  const safeSegments = data.segments || [];
  const safeActiveSegmentId = activeSegmentId || 0;

  const ModuleLoadingFallback = () => (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">Carregando módulo...</p>
      </div>
    </div>
  );

  const renderModuleContent = (moduleName) => {
    return (
      <Suspense fallback={<ModuleLoadingFallback />}>
        {children}
      </Suspense>
    );
  };

  const handleNavigation = (moduleId) => {
    setActiveModule(moduleId);
    setSidebarOpen(false);
    
    // Navigate to the appropriate route
    if (moduleId === 'dashboard') {
      router.push('/dashboard');
    } else {
      router.push(`/${moduleId}`);
    }
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

          {/* User Info */}
          <div className="p-4 border-b border-slate-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <UserCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {currentUser?.name || 'Usuário'}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {currentUser?.email || 'usuario@exemplo.com'}
                </p>
              </div>
            </div>
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
              const isAdminOnly = item.id === 'schema' && !isAdmin;
              
              if (isAdminOnly) return null;

              return (
                <button
                  key={item.id}
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

          {/* Footer */}
          <div className="p-4 border-t border-slate-700/50">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-400 hover:text-white hover:bg-slate-800"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sair
            </Button>
          </div>
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
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderModuleContent(activeModule)}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default ErpLayout;
