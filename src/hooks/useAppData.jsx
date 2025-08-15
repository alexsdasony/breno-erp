import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
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
            
            // Load essential data in parallel
            const [transactionsRes, productsRes, customersRes, salesRes, billingsRes, nfeRes] = await Promise.allSettled([
              apiService.getTransactions(segmentFilter),
              apiService.getProducts(segmentFilter),
              apiService.getCustomers(segmentFilter),
              apiService.getSales(segmentFilter),
              apiService.getBillings(segmentFilter),
              apiService.getNFes(segmentFilter)
            ]);

            // Update data with results
            setData(prev => ({
              ...prev,
              transactions: transactionsRes.status === 'fulfilled' ? (transactionsRes.value.transactions || transactionsRes.value.data || []) : [],
              products: productsRes.status === 'fulfilled' ? (productsRes.value.products || productsRes.value.data || []) : [],
              customers: customersRes.status === 'fulfilled' ? (customersRes.value.customers || customersRes.value.data || []) : [],
              sales: salesRes.status === 'fulfilled' ? (salesRes.value.sales || salesRes.value.data || []) : [],
              billings: billingsRes.status === 'fulfilled' ? (billingsRes.value.billings || billingsRes.value.data || []) : [],
              nfeList: nfeRes.status === 'fulfilled' ? (nfeRes.value.nfeList || nfeRes.value.data || []) : []
            }));
            
            console.log('✅ Essential data loaded successfully');
          } catch (error) {
            console.error('❌ Error loading essential data:', error);
          }
        }
      } catch (error) {
        console.error('❌ App initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
    initializeApp();
    }
  }, [currentUser, authLoading]);

  // Memoized functions to prevent infinite loops
  const reloadSegments = useCallback(async () => {
    try {
      const response = await apiService.getSegments();
      setSegments(response.segments || []);
      return response;
    } catch (error) {
      console.error('Reload segments error:', error);
      throw error;
    }
  }, []);

  const loadTransactions = useCallback(async (params = {}) => {
    try {
      const response = await apiService.getTransactions(params);
      const transactions = response.transactions || response.data || [];
      if (!globalMemoryCache.data) globalMemoryCache.data = {};
      globalMemoryCache.data.transactions = transactions;
      setData(prev => ({ ...prev, transactions }));
      return { transactions };
    } catch (error) {
      console.error('Load transactions error:', error);
      throw error;
    }
  }, []);

  const loadProducts = useCallback(async (params = {}) => {
    try {
      const response = await apiService.getProducts(params);
      const products = response.products || response.data || [];
      if (!globalMemoryCache.data) globalMemoryCache.data = {};
      globalMemoryCache.data.products = products;
      setData(prev => ({ ...prev, products }));
      return { products };
    } catch (error) {
      console.error('Load products error:', error);
      throw error;
    }
  }, []);

  const loadCustomers = useCallback(async (params = {}) => {
    try {
      const response = await apiService.getCustomers(params);
      const customers = response.customers || response.data || [];
      if (!globalMemoryCache.data) globalMemoryCache.data = {};
      globalMemoryCache.data.customers = customers;
      setData(prev => ({ ...prev, customers }));
      return { customers };
    } catch (error) {
      console.error('Load customers error:', error);
      throw error;
    }
  }, []);

  const loadPartners = useCallback(async (params = {}) => {
    try {
      console.log('🔄 Loading partners from API (CACHE DESABLED)...', params);
      const response = await apiService.getPartners(params);
      const partners = response.partners || response.data || [];
      
      if (!globalMemoryCache.data) globalMemoryCache.data = {};
      globalMemoryCache.data.partners = partners;
      setData(prev => ({ ...prev, partners }));
      
      console.log('✅ Partners loaded:', partners.length, 'items');
      return { partners };
    } catch (error) {
      console.error('Load partners error:', error);
      throw error;
    }
  }, []);

  const loadSales = useCallback(async (params = {}) => {
    try {
      const response = await apiService.getSales(params);
      const sales = response.sales || response.data || [];
      if (!globalMemoryCache.data) globalMemoryCache.data = {};
      globalMemoryCache.data.sales = sales;
      setData(prev => ({ ...prev, sales }));
      return { sales };
    } catch (error) {
      console.error('Load sales error:', error);
      throw error;
    }
  }, []);

  const loadBillings = useCallback(async (params = {}) => {
    try {
      const response = await apiService.getBillings(params);
      const billings = response.billings || response.data || [];
      if (!globalMemoryCache.data) globalMemoryCache.data = {};
      globalMemoryCache.data.billings = billings;
      setData(prev => ({ ...prev, billings }));
      return { billings };
    } catch (error) {
      console.error('Load billings error:', error);
      throw error;
    }
  }, []);

  const loadCostCenters = useCallback(async (params = {}) => {
    try {
      const response = await apiService.getCostCenters(params);
      const costCenters = response.costCenters || response.data || [];
      if (!globalMemoryCache.data) globalMemoryCache.data = {};
      globalMemoryCache.data.costCenters = costCenters;
      setData(prev => ({ ...prev, costCenters }));
      return { costCenters };
    } catch (error) {
      console.error('Load cost centers error:', error);
      throw error;
    }
  }, []);

  const loadNFe = useCallback(async (params = {}) => {
    try {
      const response = await apiService.getNFes(params);
      const nfeList = response.nfeList || response.data || [];
      if (!globalMemoryCache.data) globalMemoryCache.data = {};
      globalMemoryCache.data.nfeList = nfeList;
      setData(prev => ({ ...prev, nfeList }));
      return { nfeList };
    } catch (error) {
      console.error('Load NFe error:', error);
      throw error;
    }
  }, []);

  const loadAccountsPayable = useCallback(async (params = {}) => {
    try {
      const response = await apiService.getAccountsPayable(params);
      const accountsPayable = response.accountsPayable || response.data || [];
      if (!globalMemoryCache.data) globalMemoryCache.data = {};
      globalMemoryCache.data.accountsPayable = accountsPayable;
      setData(prev => ({ ...prev, accountsPayable }));
      return { accountsPayable };
    } catch (error) {
      console.error('Load accounts payable error:', error);
      throw error;
    }
  }, []);

  const loadFinancialDocuments = useCallback(async (params = {}) => {
    try {
      const response = await apiService.getFinancialDocuments(params);
      const financialDocuments = response.financialDocuments || response.data || [];
      if (!globalMemoryCache.data) globalMemoryCache.data = {};
      globalMemoryCache.data.financialDocuments = financialDocuments;
      setData(prev => ({ ...prev, financialDocuments }));
      return { financialDocuments };
    } catch (error) {
      console.error('Load financial documents error:', error);
      throw error;
    }
  }, []);

  // LAZY LOADING FUNCTIONS
  const ensureCostCentersLoaded = useCallback(async () => {
    console.log('🔄 ensureCostCentersLoaded - Iniciando verificação');
    console.log('📊 Estado atual:', { loaded: lazyState.costCenters.loaded, loading: lazyState.costCenters.loading });
    
    if (lazyState.costCenters.loaded || lazyState.costCenters.loading) {
      console.log('⏭️ ensureCostCentersLoaded - Pulando carregamento (já carregado ou carregando)');
      return;
    }

          console.log('🔄 Loading costCenters...');
    setLazyState(prev => ({ ...prev, costCenters: { ...prev.costCenters, loading: true } }));
    
    try {
      const segmentFilter = currentUser?.segment_id ? { segment_id: currentUser.segment_id } : {};
      console.log('🔍 ensureCostCentersLoaded - Filtro de segmento:', segmentFilter);
      await loadCostCenters(segmentFilter);
      setLazyState(prev => ({ ...prev, costCenters: { loaded: true, loading: false } }));
      console.log('✅ CostCenters loaded successfully');
    } catch (error) {
      console.error('❌ Failed to lazy load costCenters:', error);
      setLazyState(prev => ({ ...prev, costCenters: { loaded: false, loading: false } }));
    }
  }, [lazyState.costCenters.loaded, lazyState.costCenters.loading, currentUser?.segment_id, loadCostCenters]);

  const ensureAccountsPayableLoaded = useCallback(async () => {
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
  }, [lazyState.accountsPayable.loaded, lazyState.accountsPayable.loading, currentUser?.segment_id, loadAccountsPayable]);

  // Adicionar função para recarregar dados do dashboard
  const reloadDashboardData = useCallback(async (segmentId) => {
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
      
      console.log('✅ Dados recarregados com sucesso');
    } catch (error) {
      console.error('❌ Erro ao recarregar dados:', error);
      toast({
        title: "Erro",
        description: "Falha ao recarregar dados. Tente novamente.",
        variant: "destructive"
      });
    }
  }, [activeSegmentId, loadTransactions, loadProducts, loadCustomers, loadSales, loadBillings, loadNFe, loadAccountsPayable, loadCostCenters, toast]);

  // Metrics functions
  const getDashboardMetrics = useCallback(async (params = {}) => {
    try {
      // Add user's segment context if available
      const segmentFilter = currentUser?.segment_id ? { segment_id: currentUser.segment_id } : {};
      return await apiService.getDashboardMetrics({ ...segmentFilter, ...params });
    } catch (error) {
      console.error('Get dashboard metrics error:', error);
      throw error;
    }
  }, [currentUser?.segment_id]);

  const getFinancialMetrics = useCallback(async (params = {}) => {
    try {
      // Add user's segment context if available
      const segmentFilter = currentUser?.segment_id ? { segment_id: currentUser.segment_id } : {};
      return await apiService.getFinancialMetrics({ ...segmentFilter, ...params });
    } catch (error) {
      console.error('Get financial metrics error:', error);
      throw error;
    }
  }, [currentUser?.segment_id]);

  const getSalesMetrics = useCallback(async (params = {}) => {
    try {
      return await apiService.getSalesMetrics(params);
    } catch (error) {
      console.error('Get sales metrics error:', error);
      throw error;
    }
  }, []);

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
    reloadSegments,
    
    // Data loading functions
    loadTransactions,
    loadProducts,
    loadCustomers,
    loadPartners,
    loadSales,
    loadBillings,
    loadCostCenters,
    loadNFe,
    loadAccountsPayable,
    loadFinancialDocuments,
    
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
    ...crudOperations,
    
    // Customer operations with auto-refetch
    addCustomerWithRefetch: async (customer) => {
      try {
        const result = await crudOperations.addCustomer(customer);
        // Refetch partners data to update the list
        await loadPartners();
        return result;
      } catch (error) {
        throw error;
      }
    },
    
    updateCustomerWithRefetch: async (id, customerData) => {
      try {
        const result = await crudOperations.updateCustomer(id, customerData);
        // Refetch partners data to update the list
        await loadPartners();
        return result;
      } catch (error) {
        throw error;
      }
    },
    
    deleteCustomerWithRefetch: async (id) => {
      try {
        await crudOperations.deleteCustomer(id);
        // Refetch partners data to update the list
        await loadPartners();
      } catch (error) {
        throw error;
      }
    }
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