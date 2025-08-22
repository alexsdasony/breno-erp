import React, { createContext, useState, useEffect, useContext, useCallback, ReactNode } from 'react';
import { toast } from '@/components/ui/use-toast';
import apiService from '@/services/api';
import { calculateMetrics } from '@/utils/metrics';
import { useAuth } from './useAuth';

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
  integrations: {
    imobzi: { apiKey: string; enabled: boolean };
  };
  users: any[];
  [key: string]: any;
}

interface AppDataContextType {
  data: AppData;
  loading: boolean;
  segments: any[];
  activeSegmentId: number;
  metrics: any;
  currentUser: any;
  authLoading: boolean;
  setActiveSegmentId: (id: number) => void;
  refreshData: () => Promise<void>;
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
  activeSegmentId: 0,
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
};

interface AppDataProviderProps {
  children: ReactNode;
}

export const AppDataProvider = ({ children }: AppDataProviderProps) => {
  const [data, setData] = useState<AppData>(defaultInitialData);
  const [loading, setLoading] = useState(true);
  const [segments, setSegments] = useState<any[]>(globalMemoryCache.segments);
  const [activeSegmentId, setActiveSegmentId] = useState<number>(globalMemoryCache.activeSegmentId);

  // Use the corrected hooks
  const { currentUser, loading: authLoading, loginUser, registerUser, logoutUser, updateUserProfile, changeUserPassword, requestPasswordReset, resetPassword } = useAuth();

  // Calculate metrics from local data
  const metrics = React.useMemo(() => {
    return calculateMetrics(data, activeSegmentId || null);
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
            const segmentsResponse = await apiService.getSegments();
            setSegments(segmentsResponse.data?.segments || []);
            
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
  }, [currentUser]);

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
        apiService.getTransactions({ segment_id: activeSegmentId }),
        apiService.getProducts({ segment_id: activeSegmentId }),
        apiService.getSales({ segment_id: activeSegmentId }),
        apiService.getCustomers({ segment_id: activeSegmentId }),
        apiService.getPartners({ segment_id: activeSegmentId }),
        apiService.getNFes({ segment_id: activeSegmentId }),
        apiService.getBillings({ segment_id: activeSegmentId }),
        apiService.getCostCenters({ segment_id: activeSegmentId }),
        apiService.getAccountsPayable({ segment_id: activeSegmentId }),
        apiService.getFinancialDocuments({ segment_id: activeSegmentId }),
        apiService.getIntegrations(),
        apiService.getUsers({ segment_id: activeSegmentId })
      ]);

      setData({
        transactions: transactionsResponse.data?.transactions || [],
        products: productsResponse.data?.products || [],
        sales: salesResponse.data?.sales || [],
        customers: customersResponse.customers || [],
        partners: partnersResponse.data?.partners || [],
        nfeList: nfeResponse.data?.nfe || [],
        billings: billingsResponse.data?.billings || [],
        costCenters: costCentersResponse.data?.cost_centers || [],
        accountsPayable: accountsPayableResponse.data?.accounts_payable || [],
        financialDocuments: financialDocumentsResponse.data?.financial_documents || [],
        integrations: integrationsResponse.data?.integrations || { imobzi: { apiKey: '', enabled: false } },
        users: usersResponse.data?.users || []
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
  }, [currentUser, activeSegmentId]);

  // Auto-refresh data when segment changes
  useEffect(() => {
    if (currentUser && activeSegmentId) {
      refreshData();
    }
  }, [activeSegmentId, currentUser, refreshData]);

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
