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
import { listFinancialDocuments } from '@/services/financialService';
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
  financialDocuments: any[];
  integrations: Integration[] | {
    imobzi: { apiKey: string; enabled: boolean };
  };
  users: any[];
  segments: any[];
  [key: string]: any;
}

interface AppDataContextType {
  data: AppData;
  loading: boolean;
  segments: any[];
  activeSegmentId: string | null;
  metrics: any;
  currentUser: any;
  authLoading: boolean;
  setActiveSegmentId: (id: string | null) => void;
  refreshData: () => Promise<void>;
  reloadDashboardData: (segmentId?: string | null) => Promise<void>;
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

// Função para limpar localStorage completamente
const forceClearStorage = () => {
  try {
    sessionStorage.clear();
    console.log('🧹 Storage forçadamente limpo');
  } catch (error) {
    console.error('Erro ao limpar storage:', error);
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

  // Calculate metrics from local data
  const metrics = React.useMemo(() => {
    return calculateMetrics(data, activeSegmentId !== null ? Number(activeSegmentId) : null);
  }, [data, activeSegmentId]);

  // Atualizar cache em memória quando dados mudarem
  useEffect(() => {
    globalMemoryCache.segments = segments;
    globalMemoryCache.activeSegmentId = activeSegmentId;
  }, [segments, activeSegmentId]);

  // Limpar storage na inicialização
  useEffect(() => {
    if (!globalMemoryCache.initialized) {
      forceClearStorage();
      globalMemoryCache.initialized = true;
    }
  }, []);

  // Initialize app data and check authentication
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Iniciando aplicação...');
        setLoading(true);
        
        // Check if user is authenticated
        if (currentUser) {
          try {
            console.log('👤 Usuário autenticado:', currentUser.name);
            
            // Load segments for the user
            console.log('📋 Carregando segmentos...');
            const segmentsResponse = await apiService.get('/segments');
            setSegments((segmentsResponse as any).segments || segmentsResponse.data?.segments || []);
            
            // Load users immediately to hydrate selects (manager, etc.)
            console.log('👥 Carregando usuários...');
            const usersResponse = await getUsers({ segment_id: activeSegmentId ?? null });
            setData(prev => ({
              ...prev,
              users: usersResponse.data?.users || []
            }));
            
            console.log('✅ App initialization completed');
          } catch (error) {
            console.error('❌ Error loading segments:', error);
          }
        }
      } catch (error) {
        console.error('❌ App initialization error:', error);
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
      
      // Load all data in parallel
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
        financialDocumentsResponse,
        integrationsResponse,
        usersResponse
      ] = await Promise.all([
        listTransactions({ segment_id: activeSegmentId ?? null }),
        listProducts({ segment_id: activeSegmentId ?? null }),
        listSales({ segment_id: activeSegmentId ?? null }),
        getCustomers({ segment_id: activeSegmentId ?? null }),
        listPartners({ segment_id: activeSegmentId ?? null }),
        listNFes({ segment_id: activeSegmentId ?? null }),
        listBillings({ segment_id: activeSegmentId ?? null }),
        listCostCenters({ segment_id: activeSegmentId ?? null }),
        listAccountsPayable({ segment_id: activeSegmentId ?? null }),
        listFinancialDocuments({ segment_id: activeSegmentId ?? null }),
        listIntegrations(),
        getUsers({ segment_id: activeSegmentId ?? null })
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
        financialDocuments: financialDocumentsResponse.data?.financialDocuments || [],
        integrations: integrationsResponse.data?.integrations || { imobzi: { apiKey: '', enabled: false } },
        users: usersResponse.data?.users || [],
        segments: segments // Use the existing segments state
      });

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
        listFinancialDocuments({ segment_id: targetSegmentId }),
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
        financialDocuments: financialDocumentsResponse.data?.financialDocuments || [],
        integrations: integrationsResponse.data?.integrations || { imobzi: { apiKey: '', enabled: false } },
        users: usersResponse.data?.users || []
      }));

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

  const contextValue: AppDataContextType = {
    data,
    loading,
    segments,
    activeSegmentId,
    metrics,
    currentUser,
    authLoading,
    setActiveSegmentId,
    refreshData,
    reloadDashboardData,
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
