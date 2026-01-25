import React, { createContext, useState, useEffect, useContext, useCallback, ReactNode } from 'react';
import { toast } from '@/components/ui/use-toast';
import apiService from '@/services/api';
import { calculateMetrics } from '@/utils/metrics';
import { useAuth } from './useAuth';

// Importar serviços específicos
import { listTransactions } from '@/services/transactionsService';
import { listProducts } from '@/services/productsService';
import { listSales } from '@/services/salesService';
import { getCustomers } from '@/services/customersService';
import { listPartners } from '@/services/partnersService';
import { listNFes } from '@/services/nfeService';
import { listBillings } from '@/services/billingService';
import { listCostCenters } from '@/services/costCentersService';
import { listAccountsPayable } from '@/services/accountsPayableService';
import { listAccountsReceivable } from '@/services/accountsReceivableService';
import { getFinancialDocuments } from '@/services/financialDocumentsService';
import { listIntegrations, type Integration } from '@/services/integrationsService';
import { getUsers } from '@/services/usersService';

interface AppData {
  transactions: any[];
  products: any[];
  sales: any[];
  customers: any[];
  partners: any[];
  nfeList: any[];
  billings: any[];
  costCenters: any[];
  accountsPayable: any[];
  accountsReceivable: any[];
  financialDocuments: any[];
  integrations: Integration[] | {
    imobzi: { apiKey: string; enabled: boolean };
  };
  users: any[];
  segments: any[];
  [key: string]: any;
}

export interface HeaderFinancialKPIs {
  entradas: number;
  saidas: number;
  saldo: number;
}

interface AppDataContextType {
  data: AppData;
  loading: boolean;
  segments: any[];
  activeSegmentId: string | null;
  metrics: any;
  headerFinancialKPIs: HeaderFinancialKPIs | null;
  setHeaderFinancialKPIs: (k: HeaderFinancialKPIs | null) => void;
  currentUser: any;
  authLoading: boolean;
  setActiveSegmentId: (id: string | null) => void;
  refreshData: () => Promise<void>;
  reloadDashboardData: (segmentId?: string | null) => Promise<void>;
  refreshSegments: () => Promise<void>;
  refreshMetrics: () => Promise<void>;
  loginUser: (email: string, password: string) => Promise<boolean>;
  registerUser: (name: string, email: string, password: string, segmentId?: string | null) => Promise<boolean>;
  logoutUser: () => Promise<void>;
  updateUserProfile: (name: string, email: string) => Promise<boolean>;
  changeUserPassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  requestPasswordReset: (email: string, phone?: string | null) => Promise<any>;
  resetPassword: (email: string, phone: string, resetCode: string, newPassword: string) => Promise<any>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

// Cache em memória GLOBAL - sem localStorage
const globalMemoryCache = {
  segments: [] as any[],
  activeSegmentId: null as string | null,
  data: null as any,
  initialized: false
};

// Função para limpar apenas dados específicos do app (não o token de auth)
const clearAppData = () => {
  if (typeof window !== 'undefined') {
    try {
      // Remove apenas dados específicos do app, mantendo o token de autenticação
      const keysToRemove = ['cached_user', 'app_data_cache'];
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      console.log('Dados do app limpos com sucesso');
    } catch (error) {
      console.error('Erro ao limpar dados do app:', error);
    }
  }
};

const defaultInitialData: AppData = {
  transactions: [],
  products: [],
  sales: [],
  customers: [],
  partners: [],
  nfeList: [],
  billings: [],
  costCenters: [],
  accountsPayable: [],
  accountsReceivable: [],
  financialDocuments: [],
  integrations: {
    imobzi: { apiKey: '', enabled: false }
  },
  users: [], 
  segments: []
};

interface AppDataProviderProps {
  children: ReactNode;
}

export const AppDataProvider = ({ children }: AppDataProviderProps) => {
  const [data, setData] = useState<AppData>(defaultInitialData);
  const [loading, setLoading] = useState(true);
  const [segments, setSegments] = useState<any[]>(globalMemoryCache.segments);
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(globalMemoryCache.activeSegmentId);

  // Use the corrected hooks
  const { currentUser, loading: authLoading, loginUser, registerUser, logoutUser, updateUserProfile, changeUserPassword, requestPasswordReset, resetPassword } = useAuth();

  // Fetch metrics from API
  const [metrics, setMetrics] = React.useState<any>(null);
  const [headerFinancialKPIs, setHeaderFinancialKPIs] = React.useState<HeaderFinancialKPIs | null>(null);

  // Fetch dashboard metrics from API
  const fetchMetrics = React.useCallback(async () => {
    if (!currentUser) return;
    
    try {
      const response = await apiService.get(`/metrics?filterby=day&tag=7d&segment_id=${activeSegmentId || 'null'}`);
      if (response?.success && response?.metrics) {
        setMetrics(response.metrics);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar métricas:', error);
      // Fallback para cálculo local se API falhar
      // Usar data atual sem adicionar como dependência para evitar loops
      const currentData = data;
      const localMetrics = calculateMetrics(currentData, activeSegmentId !== null ? Number(activeSegmentId) : null);
      setMetrics(localMetrics);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, activeSegmentId]); // Removido 'data' das dependências para evitar loops infinitos

  const refreshMetrics = React.useCallback(() => fetchMetrics(), [fetchMetrics]);

  React.useEffect(() => {
    if (currentUser) fetchMetrics();
  }, [currentUser, activeSegmentId, fetchMetrics]);

  // Atualizar cache em memória quando dados mudarem
  useEffect(() => {
    globalMemoryCache.segments = segments;
    globalMemoryCache.activeSegmentId = activeSegmentId;
  }, [segments, activeSegmentId]);

  // Inicializar cache na primeira execução
  useEffect(() => {
    if (!globalMemoryCache.initialized) {
      globalMemoryCache.initialized = true;
    }
  }, []);

  // Initialize app data and check authentication
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Iniciando aplicação...');
        setLoading(true);
        
        // Check if user is authenticated
        if (currentUser) {
          try {
            console.log('Usuário autenticado:', currentUser.name);
            
            // Load segments for the user
            console.log('Carregando segmentos...');
            const segmentsResponse = await apiService.get('/segments');
            setSegments((segmentsResponse as any).segments || segmentsResponse.data?.segments || []);
            
            // Load users immediately to hydrate selects (manager, etc.)
            console.log('Carregando usuários...');
            const usersResponse = await getUsers({ segment_id: activeSegmentId ?? null });
            setData(prev => ({
              ...prev,
              users: usersResponse.data?.users || []
            }));
            
            console.log('App initialization completed');
          } catch (error) {
            console.error('Error loading segments:', error);
          }
        }
      } catch (error) {
        console.error('App initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, [currentUser, activeSegmentId]);

  // Refresh data function
  const refreshData = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      // Load all data in parallel - tratar erros 404 silenciosamente para rotas não implementadas
      const [
        transactionsResponse,
        productsResponse,
        salesResponse,
        customersResponse,
        partnersResponse,
        nfeResponse,
        billingsResponse,
        costCentersResponse,
        accountsPayableResponse,
        accountsReceivableResponse,
        financialDocumentsResponse,
        integrationsResponse,
        usersResponse
      ] = await Promise.all([
        listTransactions({ segment_id: activeSegmentId ?? null }).catch(() => ({ data: { transactions: [] }, success: false })),
        listProducts({ segment_id: activeSegmentId ?? null }).catch(() => ({ data: { products: [] }, success: false })),
        listSales({ segment_id: activeSegmentId ?? null }).catch(() => ({ data: { sales: [] }, success: false })),
        getCustomers({ segment_id: activeSegmentId ?? null }).catch(() => ({ data: { customers: [] }, success: false })),
        listPartners({ segment_id: activeSegmentId ?? null }).catch(() => ({ data: { partners: [] }, success: false })),
        listNFes({ segment_id: activeSegmentId ?? null }).catch(() => ({ data: { nfes: [] }, success: false })),
        listBillings({ segment_id: activeSegmentId ?? null }).catch(() => ({ data: { billings: [] }, success: false })),
        listCostCenters({ segment_id: activeSegmentId ?? null }).catch(() => ({ data: { costCenters: [] }, success: false })),
        listAccountsPayable({ segment_id: activeSegmentId ?? null }).catch(() => ({ data: { accounts_payable: [] }, success: false })),
        listAccountsReceivable().catch(() => ({ data: { accounts_receivable: [] }, success: false })),
        getFinancialDocuments({ segment_id: activeSegmentId ?? null }).catch(() => ({ data: { financialDocuments: [] }, success: false })),
        listIntegrations().catch(() => ({ data: { integrations: { imobzi: { apiKey: '', enabled: false } } }, success: false })),
        getUsers({ segment_id: activeSegmentId ?? null }).catch(() => ({ data: { users: [] }, success: false }))
      ]);

      setData({
        transactions: transactionsResponse.data?.transactions || [],
        products: productsResponse.data?.products || [],
        sales: salesResponse.data?.sales || [],
        customers: customersResponse.data?.customers || [],
        partners: partnersResponse.data?.partners || [],
        nfeList: nfeResponse.data?.nfes || [],
        billings: billingsResponse.data?.billings || [],
        costCenters: costCentersResponse.data?.costCenters || [],
        accountsPayable: accountsPayableResponse.data?.accounts_payable || [],
        accountsReceivable: accountsReceivableResponse.data?.accounts_receivable || [],
        financialDocuments: financialDocumentsResponse.data?.financialDocuments || [],
        integrations: integrationsResponse.data?.integrations || { imobzi: { apiKey: '', enabled: false } },
        users: usersResponse.data?.users || [],
        segments: segments // Use the existing segments state
      });

      // Atualizar métricas após carregar dados
      await fetchMetrics();
      
      toast({
        title: "Dados atualizados",
        description: "Os dados foram atualizados com sucesso.",
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: "Erro ao atualizar dados",
        description: "Não foi possível atualizar os dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentUser, activeSegmentId, segments]); // Add segments to dependencies

  // Auto-refresh data when segment changes
  useEffect(() => {
    if (currentUser && activeSegmentId) {
      refreshData();
    }
  }, [activeSegmentId, currentUser, refreshData]);

  const reloadDashboardData = useCallback(async (segmentId?: string | null) => {
    if (!currentUser) return;
    const targetSegmentId = segmentId ?? activeSegmentId;
    if (!targetSegmentId) return;

    try {
      setLoading(true);
      const [
        transactionsResponse,
        productsResponse,
        salesResponse,
        customersResponse,
        partnersResponse,
        nfeResponse,
        billingsResponse,
        costCentersResponse,
        accountsPayableResponse,
        accountsReceivableResponse,
        financialDocumentsResponse,
        integrationsResponse,
        usersResponse
      ] = await Promise.all([
        listTransactions({ segment_id: targetSegmentId }),
        listProducts({ segment_id: targetSegmentId }),
        listSales({ segment_id: targetSegmentId }),
        getCustomers({ segment_id: targetSegmentId }),
        listPartners({ segment_id: targetSegmentId }),
        listNFes({ segment_id: targetSegmentId }),
        listBillings({ segment_id: targetSegmentId }),
        listCostCenters({ segment_id: targetSegmentId }),
        listAccountsPayable({ segment_id: targetSegmentId }),
        listAccountsReceivable(),
        getFinancialDocuments({ segment_id: targetSegmentId }),
        listIntegrations(),
        getUsers({ segment_id: targetSegmentId })
      ]);

      setData(prev => ({
        ...prev,
        transactions: transactionsResponse.data?.transactions || [],
        products: productsResponse.data?.products || [],
        sales: salesResponse.data?.sales || [],
        customers: customersResponse.data?.customers || [],
        partners: partnersResponse.data?.partners || [],
        nfeList: nfeResponse.data?.nfes || [],
        billings: billingsResponse.data?.billings || [],
        costCenters: costCentersResponse.data?.costCenters || [],
        accountsPayable: accountsPayableResponse.data?.accounts_payable || [],
        accountsReceivable: accountsReceivableResponse.data?.accounts_receivable || [],
        financialDocuments: financialDocumentsResponse.data?.financialDocuments || [],
        integrations: integrationsResponse.data?.integrations || { imobzi: { apiKey: '', enabled: false } },
        users: usersResponse.data?.users || []
      }));

      // Atualizar métricas após carregar dados
      await fetchMetrics();

      toast({
        title: "Dados do Dashboard atualizados",
        description: "Os dados do dashboard foram atualizados com sucesso.",
      });
    } catch (error) {
      console.error('Error reloading dashboard data:', error);
      toast({
        title: "Erro ao atualizar dados do Dashboard",
        description: "Não foi possível atualizar os dados do dashboard. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentUser, activeSegmentId]);

  // Função para atualizar apenas os segmentos
  const refreshSegments = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      console.log('🔄 Atualizando segmentos no contexto global...');
      const segmentsResponse = await apiService.get('/segments');
      const newSegments = (segmentsResponse as any).segments || segmentsResponse.data?.segments || [];
      setSegments(newSegments);
      console.log('✅ Segmentos atualizados no contexto global:', newSegments.length);
    } catch (error) {
      console.error('❌ Erro ao atualizar segmentos:', error);
    }
  }, [currentUser]);

  const contextValue: AppDataContextType = {
    data,
    loading,
    segments,
    activeSegmentId,
    metrics,
    headerFinancialKPIs,
    setHeaderFinancialKPIs,
    currentUser,
    authLoading,
    setActiveSegmentId,
    refreshData,
    reloadDashboardData,
    refreshSegments,
    refreshMetrics,
    loginUser,
    registerUser,
    logoutUser,
    updateUserProfile,
    changeUserPassword,
    requestPasswordReset,
    resetPassword
  };

  return (
    <AppDataContext.Provider value={contextValue}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};
