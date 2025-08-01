import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from '@/components/ui/use-toast';
import apiService from '@/services/api';
import { calculateMetrics } from '@/utils/metrics';
import { useAuth } from './useAuth';
import { useCrud } from './useCrud';

const AppDataContext = createContext();

// Cache em memória GLOBAL - sem localStorage
const globalMemoryCache = {
  segments: [],
  activeSegmentId: 0,
  data: null,
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

const defaultInitialData = {
  transactions: [],
  products: [],
  sales: [],
  customers: [],
  nfeList: [],
  billings: [],
  costCenters: [],
  accountsPayable: [],
  integrations: {
    imobzi: { apiKey: '', enabled: false }
  },
  users: [], 
};

const defaultLazyState = {
  costCenters: { loaded: false, loading: false },
  accountsPayable: { loaded: false, loading: false },
};

export const AppDataProvider = ({ children }) => {
  const [data, setData] = useState(defaultInitialData);
  const [loading, setLoading] = useState(true);
  const [segments, setSegments] = useState(globalMemoryCache.segments);
  const [activeSegmentId, setActiveSegmentId] = useState(globalMemoryCache.activeSegmentId);
  const [lazyState, setLazyState] = useState(defaultLazyState);

  // Use the corrected hooks
  const { currentUser, loading: authLoading, loginUser, registerUser, logoutUser, updateUserProfile, changeUserPassword, requestPasswordReset, resetPassword } = useAuth();
  const crudOperations = useCrud();

  // Calculate metrics from local data
  const metrics = React.useMemo(() => {
    return calculateMetrics(data, activeSegmentId);
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
            setSegments(segmentsResponse.segments || []);
            
            // Load ONLY ESSENTIAL data with user's segment context
            const segmentFilter = currentUser.segment_id ? { segment_id: currentUser.segment_id } : {};
            
            console.log('🚀 Loading essential data for user:', currentUser.name);
            
            // Load data sequentially to avoid quota issues
            console.log('📊 Loading transactions...');
            await loadTransactions(segmentFilter);
            
            console.log('📦 Loading products...');
            await loadProducts(segmentFilter);
            
            console.log('👥 Loading customers...');
            await loadCustomers(segmentFilter);
            
            console.log('💰 Loading sales...');
            await loadSales(segmentFilter);
            
            console.log('💳 Loading billings...');
            await loadBillings(segmentFilter);
            
            console.log('📄 Loading NFe...');
            await loadNFe(segmentFilter);
            
            console.log('💸 Loading accounts payable...');
            await loadAccountsPayable(segmentFilter);
            
            console.log('🏢 Loading cost centers...');
            await loadCostCenters(segmentFilter);
            
            console.log('✅ Essential data loaded successfully');
          } catch (error) {
            console.error('❌ Data loading failed:', error);
            toast({
              title: "Erro ao carregar dados",
              description: "Alguns dados podem não estar disponíveis.",
              variant: "destructive"
            });
          }
        } else {
          console.log('👤 Nenhum usuário logado');
        }
      } catch (error) {
        console.error('❌ App initialization error:', error);
      } finally {
        console.log('✅ Inicialização concluída');
        setLoading(false);
      }
    };

    if (!authLoading) {
    initializeApp();
    }
  }, [currentUser, authLoading]);

  // Data loading functions with memory cache
  const loadTransactions = async (params = {}) => {
    try {
      // Verificar cache em memória primeiro
      if (globalMemoryCache.data?.transactions && !params.segment_id) {
        console.log('📊 Using cached transactions');
        setData(prev => ({ ...prev, transactions: globalMemoryCache.data.transactions }));
        return { transactions: globalMemoryCache.data.transactions };
      }
      
      const response = await apiService.getTransactions(params);
      const transactions = response.transactions || [];
      
      // Converter segment_id para segmentId (snake_case para camelCase)
      const convertedTransactions = transactions.map(transaction => ({
        ...transaction,
        segmentId: transaction.segment_id || transaction.segmentId,
        costCenter: transaction.cost_center || transaction.costCenter
      }));
      
      console.log('🔍 Debug loadTransactions - Transações convertidas:', convertedTransactions.slice(0, 3));
      
      // Atualizar cache em memória
      if (!globalMemoryCache.data) globalMemoryCache.data = {};
      globalMemoryCache.data.transactions = convertedTransactions;
      
      setData(prev => ({ ...prev, transactions: convertedTransactions }));
      return { transactions: convertedTransactions };
    } catch (error) {
      console.error('Load transactions error:', error);
      throw error;
    }
  };

  const loadProducts = async (params = {}) => {
    try {
      // Verificar cache em memória primeiro
      if (globalMemoryCache.data?.products && !params.segment_id) {
        console.log('📦 Using cached products');
        setData(prev => ({ ...prev, products: globalMemoryCache.data.products }));
        return { products: globalMemoryCache.data.products };
      }
      
      const response = await apiService.getProducts(params);
      const products = response.products || [];
      
      // Atualizar cache em memória
      if (!globalMemoryCache.data) globalMemoryCache.data = {};
      globalMemoryCache.data.products = products;
      
      setData(prev => ({ ...prev, products }));
      return response;
    } catch (error) {
      console.error('Load products error:', error);
      throw error;
    }
  };

  const loadCustomers = async (params = {}) => {
    try {
      // Verificar cache em memória primeiro
      if (globalMemoryCache.data?.customers && !params.segment_id) {
        console.log('👥 Using cached customers');
        setData(prev => ({ ...prev, customers: globalMemoryCache.data.customers }));
        return { customers: globalMemoryCache.data.customers };
      }
      
      const response = await apiService.getCustomers(params);
      const customers = response.customers || [];
      
      // Atualizar cache em memória
      if (!globalMemoryCache.data) globalMemoryCache.data = {};
      globalMemoryCache.data.customers = customers;
      
      setData(prev => ({ ...prev, customers }));
      return response;
    } catch (error) {
      console.error('Load customers error:', error);
      throw error;
    }
  };

  const loadSales = async (params = {}) => {
    try {
      // Verificar cache em memória primeiro
      if (globalMemoryCache.data?.sales && !params.segment_id) {
        console.log('💰 Using cached sales');
        setData(prev => ({ ...prev, sales: globalMemoryCache.data.sales }));
        return { sales: globalMemoryCache.data.sales };
      }
      
      const response = await apiService.getSales(params);
      const sales = response.sales || [];
      
      // Atualizar cache em memória
      if (!globalMemoryCache.data) globalMemoryCache.data = {};
      globalMemoryCache.data.sales = sales;
      
      setData(prev => ({ ...prev, sales }));
      return response;
    } catch (error) {
      console.error('Load sales error:', error);
      throw error;
    }
  };

  const loadBillings = async (params = {}) => {
    try {
      // Verificar cache em memória primeiro
      if (globalMemoryCache.data?.billings && !params.segment_id) {
        console.log('💳 Using cached billings');
        setData(prev => ({ ...prev, billings: globalMemoryCache.data.billings }));
        return { billings: globalMemoryCache.data.billings };
      }
      
      const response = await apiService.getBillings(params);
      const billings = response.billings || [];
      
      // Atualizar cache em memória
      if (!globalMemoryCache.data) globalMemoryCache.data = {};
      globalMemoryCache.data.billings = billings;
      
      setData(prev => ({ ...prev, billings }));
      return response;
    } catch (error) {
      console.error('Load billings error:', error);
      throw error;
    }
  };

  const loadCostCenters = async (params = {}) => {
    try {
      // Verificar cache em memória primeiro
      if (globalMemoryCache.data?.costCenters && !params.segment_id) {
        console.log('🏢 Using cached cost centers');
        setData(prev => ({ ...prev, costCenters: globalMemoryCache.data.costCenters }));
        return { costCenters: globalMemoryCache.data.costCenters };
      }
      
      const response = await apiService.getCostCenters(params);
      // Converter segment_id para segmentId
      const costCenters = (response.costCenters || []).map(cc => ({
        ...cc,
        segmentId: cc.segment_id,
      }));
      // Atualizar cache em memória
      if (!globalMemoryCache.data) globalMemoryCache.data = {};
      globalMemoryCache.data.costCenters = costCenters;
      setData(prev => ({ ...prev, costCenters }));
      return { costCenters };
    } catch (error) {
      console.error('Load cost centers error:', error);
      throw error;
    }
  };

  const loadNFe = async (params = {}) => {
    try {
      // Verificar cache em memória primeiro
      if (globalMemoryCache.data?.nfeList && !params.segment_id) {
        console.log('📄 Using cached NFe');
        setData(prev => ({ ...prev, nfeList: globalMemoryCache.data.nfeList }));
        return { nfeList: globalMemoryCache.data.nfeList };
      }
      
      const response = await apiService.getNFes(params);
      const nfeList = response.nfeList || [];
      
      // Atualizar cache em memória
      if (!globalMemoryCache.data) globalMemoryCache.data = {};
      globalMemoryCache.data.nfeList = nfeList;
      
      setData(prev => ({ ...prev, nfeList }));
      return response;
    } catch (error) {
      console.error('Load NFe error:', error);
      throw error;
    }
  };

  const loadAccountsPayable = async (params = {}) => {
    try {
      // Verificar cache em memória primeiro
      if (globalMemoryCache.data?.accountsPayable && !params.segment_id) {
        console.log('💸 Using cached accounts payable');
        setData(prev => ({ ...prev, accountsPayable: globalMemoryCache.data.accountsPayable }));
        return { accountsPayable: globalMemoryCache.data.accountsPayable };
      }
      
      const response = await apiService.getAccountsPayable(params);
      const accountsPayable = response.accountsPayable || [];
      
      // Atualizar cache em memória
      if (!globalMemoryCache.data) globalMemoryCache.data = {};
      globalMemoryCache.data.accountsPayable = accountsPayable;
      
      setData(prev => ({ ...prev, accountsPayable }));
      return response;
    } catch (error) {
      console.error('Load accounts payable error:', error);
      throw error;
    }
  };

  // LAZY LOADING FUNCTIONS
  const ensureCostCentersLoaded = async () => {
    if (lazyState.costCenters.loaded || lazyState.costCenters.loading) {
      return;
    }

    console.log('🔄 Loading costCenters...');
    setLazyState(prev => ({ ...prev, costCenters: { ...prev.costCenters, loading: true } }));
    
    try {
      const segmentFilter = currentUser?.segment_id ? { segment_id: currentUser.segment_id } : {};
      await loadCostCenters(segmentFilter);
      setLazyState(prev => ({ ...prev, costCenters: { loaded: true, loading: false } }));
      console.log('✅ CostCenters loaded successfully');
    } catch (error) {
      console.error('Failed to lazy load costCenters:', error);
      setLazyState(prev => ({ ...prev, costCenters: { loaded: false, loading: false } }));
    }
  };

  const ensureAccountsPayableLoaded = async () => {
    if (lazyState.accountsPayable.loaded || lazyState.accountsPayable.loading) {
      return;
    }

    console.log('🔄 Loading accountsPayable...');
    setLazyState(prev => ({ ...prev, accountsPayable: { ...prev.accountsPayable, loading: true } }));
    
    try {
      const segmentFilter = currentUser?.segment_id ? { segment_id: currentUser.segment_id } : {};
      await loadAccountsPayable(segmentFilter);
      setLazyState(prev => ({ ...prev, accountsPayable: { loaded: true, loading: false } }));
      console.log('✅ AccountsPayable loaded successfully');
    } catch (error) {
      console.error('Failed to lazy load accountsPayable:', error);
      setLazyState(prev => ({ ...prev, accountsPayable: { loaded: false, loading: false } }));
    }
  };

  // Adicionar função para recarregar dados do dashboard
  const reloadDashboardData = async (segmentId) => {
    try {
      console.log('🔄 Recarregando dados para segmento:', segmentId);
      
      // Definir o novo segmento ativo
      const newSegmentId = segmentId || activeSegmentId || 0;
      setActiveSegmentId(newSegmentId);
      
      // Recarregar todos os dados essenciais com o novo filtro de segmento
      const segmentFilter = newSegmentId && newSegmentId !== 0 ? { segment_id: newSegmentId } : {};
        
      console.log('📊 Recarregando transactions...');
      await loadTransactions(segmentFilter);
        
      console.log('📦 Recarregando products...');
      await loadProducts(segmentFilter);
      
      console.log('👥 Recarregando customers...');
      await loadCustomers(segmentFilter);
      
      console.log('💰 Recarregando sales...');
      await loadSales(segmentFilter);
      
      console.log('💳 Recarregando billings...');
      await loadBillings(segmentFilter);
      
      console.log('📄 Recarregando NFe...');
      await loadNFe(segmentFilter);
      
      console.log('💸 Recarregando accounts payable...');
      await loadAccountsPayable(segmentFilter);
      
      console.log('🏢 Recarregando cost centers...');
      await loadCostCenters(segmentFilter);
      
      console.log('✅ Dados recarregados com sucesso para segmento:', newSegmentId);
      
    } catch (error) {
      console.error('Erro ao recarregar dados do dashboard:', error);
      toast({
        title: "Erro!",
        description: "Falha ao recarregar dados. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  // Metrics functions
  const getDashboardMetrics = async (params = {}) => {
    try {
      // Add user's segment context if available
      const segmentFilter = currentUser?.segment_id ? { segment_id: currentUser.segment_id } : {};
      return await apiService.getDashboardMetrics({ ...segmentFilter, ...params });
    } catch (error) {
      console.error('Get dashboard metrics error:', error);
      throw error;
    }
  };

  const getFinancialMetrics = async (params = {}) => {
    try {
      // Add user's segment context if available
      const segmentFilter = currentUser?.segment_id ? { segment_id: currentUser.segment_id } : {};
      return await apiService.getFinancialMetrics({ ...segmentFilter, ...params });
    } catch (error) {
      console.error('Get financial metrics error:', error);
      throw error;
    }
  };

  const getSalesMetrics = async (params = {}) => {
    try {
      return await apiService.getSalesMetrics(params);
    } catch (error) {
      console.error('Get sales metrics error:', error);
      throw error;
    }
  };

  const value = {
    data: {
      ...data,
      segments: segments || []
    },
    metrics,
    setData,
    currentUser,
    loading: loading || authLoading,
    segments,
    activeSegmentId,
    setActiveSegmentId,
    
    // Data loading functions
    loadTransactions,
    loadProducts,
    loadCustomers,
    loadSales,
    loadBillings,
    loadCostCenters,
    loadNFe,
    loadAccountsPayable,
    
    // Lazy loading functions
    ensureCostCentersLoaded,
    ensureAccountsPayableLoaded,
    
    // Metrics functions
    getDashboardMetrics,
    getFinancialMetrics,
    getSalesMetrics,
    
    // Toast function
    toast,
    reloadDashboardData,
    
    // Auth functions from useAuth
    loginUser,
    registerUser,
    logoutUser,
    updateUserProfile,
    changeUserPassword,
    requestPasswordReset,
    resetPassword,
    
    // CRUD operations from useCrud
    ...crudOperations
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};