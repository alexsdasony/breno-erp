import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from '@/components/ui/use-toast';
import apiService from '@/services/api';

const AppDataContext = createContext();

const defaultInitialData = {
  // Essential data (loaded on login)
  transactions: [],
  products: [],
  sales: [],
  customers: [],
  nfeList: [],
  billings: [],
  
  // Optional data (lazy loaded)
  costCenters: [],
  accountsPayable: [],
  integrations: {
    imobzi: { apiKey: '', enabled: false }
  },
  users: [], 
};

// Lazy loading state
const defaultLazyState = {
  costCenters: { loaded: false, loading: false },
  accountsPayable: { loaded: false, loading: false },
};

export const AppDataProvider = ({ children }) => {
  const [data, setData] = useState(defaultInitialData);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [segments, setSegments] = useState([]);
  const [activeSegmentId, setActiveSegmentId] = useState(null);
  const [lazyState, setLazyState] = useState(defaultLazyState);

  // Initialize app data and check authentication
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        // Check if user is authenticated
        const token = apiService.getToken();
        if (token) {
          try {
            const userProfile = await apiService.getProfile();
            setCurrentUser(userProfile.user);
            
            // Load segments for the user
            const segmentsResponse = await apiService.getSegments();
            setSegments(segmentsResponse.segments || []);
            
            // Load ONLY ESSENTIAL data with user's segment context
            const segmentFilter = userProfile.user.segment_id ? { segment_id: userProfile.user.segment_id } : {};
            
            console.log('🚀 LAZY LOADING: Loading ESSENTIAL data only for user:', userProfile.user.name, 'segment_id:', userProfile.user.segment_id);
            
            // Load only essential data for dashboard
            await Promise.all([
              loadTransactions(segmentFilter),
              loadProducts(segmentFilter),
              loadCustomers(), // Customers are global - no segment filter
              loadSales(segmentFilter),
              loadBillings(segmentFilter),
              loadNFes(segmentFilter)
              // REMOVED: costCenters, accountsPayable (lazy loaded)
            ]);
            
            console.log('✅ ESSENTIAL data loaded successfully (lazy loading active)');
          } catch (error) {
            console.error('Authentication check failed:', error);
            apiService.setToken(null);
            setCurrentUser(null);
          }
        }
      } catch (error) {
        console.error('App initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  const registerUser = async (name, email, password, segmentId = null) => {
    try {
      const response = await apiService.register({ name, email, password, segmentId });
      if (response.token) {
        setCurrentUser(response.user);
        // Load segments for the new user
        const segmentsResponse = await apiService.getSegments();
        setSegments(segmentsResponse.segments || []);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const loginUser = async (email, password) => {
    try {
      console.log('🚀 Starting login process...');
      setLoading(true); // Set loading FIRST
      
      const response = await apiService.login({ email, password });
      
      if (response.token && response.user) {
        console.log('✅ Login successful! User:', response.user.name, 'ID:', response.user.id, 'segment_id:', response.user.segment_id);
        
        setCurrentUser(response.user);
        
        // Load segments for the user
        const segmentsResponse = await apiService.getSegments();
        setSegments(segmentsResponse.segments || []);
        
        // Load ONLY ESSENTIAL data immediately after login
        const segmentFilter = response.user.segment_id ? { segment_id: response.user.segment_id } : {};
        
        console.log('🎯 LAZY LOADING: Loading ESSENTIAL data only:', segmentFilter);
        
        // Load only essential data for dashboard (6 requests instead of 8)
        await Promise.all([
          loadTransactions(segmentFilter),
          loadProducts(segmentFilter),
          loadCustomers(), // Global
          loadSales(segmentFilter),
          loadBillings(segmentFilter),
          loadNFes(segmentFilter)
          // REMOVED: costCenters, accountsPayable (lazy loaded on demand)
        ]);
        
        console.log('🎉 ESSENTIAL data loaded! Dashboard ready (lazy loading active)');
        
        return true;
      }
      setLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      throw error;
    } finally {
      setLoading(false); // Always set loading to false
    }
  };

  const logoutUser = async () => {
    try {
      await apiService.logout();
      setCurrentUser(null);
      setSegments([]);
      setData(defaultInitialData);
      setLazyState(defaultLazyState); // Reset lazy state
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails on server, clear local state
      setCurrentUser(null);
      setSegments([]);
      setData(defaultInitialData);
      setLazyState(defaultLazyState);
    }
  };

  const updateUserProfile = async (name, email) => {
    try {
      const response = await apiService.updateProfile({ name, email });
      if (response.user) {
        setCurrentUser(response.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const changeUserPassword = async (currentPassword, newPassword) => {
    try {
      await apiService.changePassword({ currentPassword, newPassword });
      return true;
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  };

  // LAZY LOADING FUNCTIONS
  const ensureCostCentersLoaded = async () => {
    if (lazyState.costCenters.loaded || lazyState.costCenters.loading) {
      return;
    }

    console.log('🔄 LAZY LOADING: Loading costCenters on demand...');
    setLazyState(prev => ({ ...prev, costCenters: { ...prev.costCenters, loading: true } }));
    
    try {
      const segmentFilter = currentUser?.segment_id ? { segment_id: currentUser.segment_id } : {};
      await loadCostCenters(segmentFilter);
      setLazyState(prev => ({ ...prev, costCenters: { loaded: true, loading: false } }));
      console.log('✅ LAZY LOADING: costCenters loaded successfully');
    } catch (error) {
      console.error('Failed to lazy load costCenters:', error);
      setLazyState(prev => ({ ...prev, costCenters: { loaded: false, loading: false } }));
    }
  };

  const ensureAccountsPayableLoaded = async () => {
    if (lazyState.accountsPayable.loaded || lazyState.accountsPayable.loading) {
      return;
    }

    console.log('🔄 LAZY LOADING: Loading accountsPayable on demand...');
    setLazyState(prev => ({ ...prev, accountsPayable: { ...prev.accountsPayable, loading: true } }));
    
    try {
      const segmentFilter = currentUser?.segment_id ? { segment_id: currentUser.segment_id } : {};
      await loadAccountsPayable(segmentFilter);
      setLazyState(prev => ({ ...prev, accountsPayable: { loaded: true, loading: false } }));
      console.log('✅ LAZY LOADING: accountsPayable loaded successfully');
    } catch (error) {
      console.error('Failed to lazy load accountsPayable:', error);
      setLazyState(prev => ({ ...prev, accountsPayable: { loaded: false, loading: false } }));
    }
  };

  // Data loading functions
  const loadTransactions = async (params = {}) => {
    try {
      const response = await apiService.getTransactions(params);
      setData(prev => ({ ...prev, transactions: response.transactions }));
      return response;
    } catch (error) {
      console.error('Load transactions error:', error);
      throw error;
    }
  };

  const loadProducts = async (params = {}) => {
    try {
      const response = await apiService.getProducts(params);
      setData(prev => ({ ...prev, products: response.products }));
      return response;
    } catch (error) {
      console.error('Load products error:', error);
      throw error;
    }
  };

  const loadCustomers = async (params = {}) => {
    try {
      const response = await apiService.getCustomers(params);
      setData(prev => ({ ...prev, customers: response.customers }));
      return response;
    } catch (error) {
      console.error('Load customers error:', error);
      throw error;
    }
  };

  const loadSales = async (params = {}) => {
    try {
      const response = await apiService.getSales(params);
      setData(prev => ({ ...prev, sales: response.sales }));
      return response;
    } catch (error) {
      console.error('Load sales error:', error);
      throw error;
    }
  };

  const loadBillings = async (params = {}) => {
    try {
      const response = await apiService.getBillings(params);
      setData(prev => ({ ...prev, billings: response.billings }));
      return response;
    } catch (error) {
      console.error('Load billings error:', error);
      throw error;
    }
  };

  const loadCostCenters = async (params = {}) => {
    try {
      const response = await apiService.getCostCenters(params);
      setData(prev => ({ ...prev, costCenters: response.costCenters }));
      return response;
    } catch (error) {
      console.error('Load cost centers error:', error);
      throw error;
    }
  };

  const loadNFes = async (params = {}) => {
    try {
      const response = await apiService.getNFes(params);
      setData(prev => ({ ...prev, nfeList: response.nfes }));
      return response;
    } catch (error) {
      console.error('Load NFes error:', error);
      throw error;
    }
  };

  const loadAccountsPayable = async (params = {}) => {
    try {
      const response = await apiService.getAccountsPayable(params);
      setData(prev => ({ ...prev, accountsPayable: response.accountsPayable }));
      return response;
    } catch (error) {
      console.error('Load accounts payable error:', error);
      throw error;
    }
  };

  const addTransaction = async (transaction) => {
    try {
      const response = await apiService.createTransaction(transaction);
      
      // Update local state
      setData(prev => ({
        ...prev,
        transactions: [response.transaction, ...prev.transactions]
      }));
      
      toast({
        title: "Transação adicionada!",
        description: "Nova transação foi registrada com sucesso."
      });
      
      return response.transaction;
    } catch (error) {
      console.error('Add transaction error:', error);
      toast({
        title: "Erro!",
        description: "Falha ao adicionar transação. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const addProduct = async (product) => {
    try {
      const response = await apiService.createProduct(product);
      
      // Update local state
      setData(prev => ({
        ...prev,
        products: [response.product, ...prev.products]
      }));
      
      toast({
        title: "Produto adicionado!",
        description: "Novo produto foi cadastrado no estoque."
      });
      
      return response.product;
    } catch (error) {
      console.error('Add product error:', error);
      toast({
        title: "Erro!",
        description: "Falha ao adicionar produto. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const addSale = async (sale) => {
    try {
      const response = await apiService.createSale(sale);
      
      // Update local state
      setData(prev => ({
        ...prev,
        sales: [response.sale, ...prev.sales]
      }));
      
      toast({
        title: "Venda registrada!",
        description: "Nova venda foi adicionada ao sistema."
      });
      
      return response.sale;
    } catch (error) {
      console.error('Add sale error:', error);
      toast({
        title: "Erro!",
        description: "Falha ao registrar venda. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const addCustomer = async (customer) => {
    try {
      const response = await apiService.createCustomer(customer);
      
      // Update local state
      setData(prev => ({
        ...prev,
        customers: [response.customer, ...prev.customers]
      }));
      
      toast({
        title: "Cliente adicionado!",
        description: "Novo cliente foi cadastrado com sucesso."
      });
      
      return response.customer;
    } catch (error) {
      console.error('Add customer error:', error);
      toast({
        title: "Erro!",
        description: "Falha ao adicionar cliente. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const addNFe = async (nfe) => {
    try {
      const response = await apiService.createNFe(nfe);
      
      // Update local state
      setData(prev => ({
        ...prev,
        nfeList: [response.nfe, ...prev.nfeList]
      }));
      
      toast({
        title: "NF-e Gerada!",
        description: "Nova NF-e foi adicionada à lista."
      });
      
      return response.nfe;
    } catch (error) {
      console.error('Add NFe error:', error);
      toast({
        title: "Erro!",
        description: "Falha ao gerar NF-e. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const addBilling = async (billing) => {
    try {
      const response = await apiService.createBilling(billing);
      
      // Update local state
      setData(prev => ({
        ...prev,
        billings: [response.billing, ...prev.billings]
      }));
      
      toast({
        title: "Cobrança Adicionada!",
        description: "Nova cobrança foi registrada com sucesso."
      });
      
      return response.billing;
    } catch (error) {
      console.error('Add billing error:', error);
      toast({
        title: "Erro!",
        description: "Falha ao adicionar cobrança. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const addCostCenter = async (costCenter) => {
    try {
      const response = await apiService.createCostCenter(costCenter);
      
      // Update local state
      setData(prev => ({
        ...prev,
        costCenters: [response.costCenter, ...prev.costCenters]
      }));
      
      toast({
        title: "Centro de Custo Adicionado!",
        description: "Novo centro de custo foi registrado com sucesso."
      });
      
      return response.costCenter;
    } catch (error) {
      console.error('Add cost center error:', error);
      toast({
        title: "Erro!",
        description: "Falha ao adicionar centro de custo. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateCostCenter = async (id, updatedCostCenter) => {
    try {
      const response = await apiService.updateCostCenter(id, updatedCostCenter);
      
      // Update local state
      setData(prev => ({
        ...prev,
        costCenters: prev.costCenters.map(cc => 
          cc.id === id ? response.costCenter : cc
        )
      }));
      
      toast({
        title: "Centro de Custo Atualizado!",
        description: "O centro de custo foi atualizado com sucesso."
      });
      
      return response.costCenter;
    } catch (error) {
      console.error('Update cost center error:', error);
      toast({
        title: "Erro!",
        description: "Falha ao atualizar centro de custo. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteCostCenter = async (costCenterId) => {
    try {
      await apiService.deleteCostCenter(costCenterId);
      
      // Update local state
      setData(prev => ({
        ...prev,
        costCenters: prev.costCenters.filter(cc => cc.id !== costCenterId)
      }));
      
      toast({
        title: "Centro de Custo Excluído!",
        description: "O centro de custo foi excluído com sucesso."
      });
    } catch (error) {
      console.error('Delete cost center error:', error);
      toast({
        title: "Erro!",
        description: "Falha ao excluir centro de custo. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const importData = async (importedItems, type) => {
    try {
      let response;
      
      switch (type) {
        case 'transactions':
          response = await apiService.importTransactions(importedItems);
          // Reload transactions to get updated data
          await loadTransactions();
          break;
        default:
          toast({ title: "Tipo de Importação Inválido", variant: "destructive" });
          return;
      }
      
      const success = response.imported || importedItems.length;
      const errors = response.errors || 0;
      
      toast({
        title: "Importação Concluída",
        description: `${success} registros importados com sucesso para ${type}. ${errors > 0 ? `${errors} registros com erro.` : ''}`,
      });
      
      return response;
    } catch (error) {
      console.error('Import data error:', error);
      toast({
        title: "Erro na Importação!",
        description: "Falha ao importar dados. Tente novamente.",
        variant: "destructive"
      });
      throw error;
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
    data,
    setData,
    currentUser,
    loading,
    segments,
    activeSegmentId,
    setActiveSegmentId,
    
    // Authentication functions
    registerUser,
    loginUser,
    logoutUser,
    updateUserProfile,
    changeUserPassword,
    
    // Data loading functions
    loadTransactions,
    loadProducts,
    loadCustomers,
    loadSales,
    loadBillings,
    loadCostCenters,
    loadNFes,
    loadAccountsPayable,
    
    // Data creation functions
    addTransaction,
    addProduct,
    addSale,
    addCustomer,
    addNFe,
    addBilling,
    addCostCenter,
    
    // Data update/delete functions
    updateCostCenter,
    deleteCostCenter,
    
    // Import function
    importData,
    
    // Metrics functions
    getDashboardMetrics,
    getFinancialMetrics,
    getSalesMetrics,
    
    // Lazy loading functions
    ensureCostCentersLoaded,
    ensureAccountsPayableLoaded
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