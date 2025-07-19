import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from '@/components/ui/use-toast';
import apiService from '@/services/api';
import { calculateMetrics } from '@/utils/metrics';

const AppDataContext = createContext();

// Cache em memória GLOBAL - sem localStorage
const globalMemoryCache = {
  currentUser: null,
  segments: [],
  activeSegmentId: 0,
  data: null,
  authToken: null,
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

// Função para gerenciar token SEM localStorage
const tokenManager = {
  setToken: (token) => {
    globalMemoryCache.authToken = token;
    // NÃO usar localStorage
  },
  
  getToken: () => {
    return globalMemoryCache.authToken;
  },
  
  clearToken: () => {
    globalMemoryCache.authToken = null;
    // NÃO usar localStorage
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
  const [currentUser, setCurrentUser] = useState(globalMemoryCache.currentUser);
  const [loading, setLoading] = useState(true);
  const [segments, setSegments] = useState(globalMemoryCache.segments);
  const [activeSegmentId, setActiveSegmentId] = useState(globalMemoryCache.activeSegmentId);
  const [lazyState, setLazyState] = useState(defaultLazyState);

  // Calculate metrics from local data
  const metrics = React.useMemo(() => {
    return calculateMetrics(data, activeSegmentId);
  }, [data, activeSegmentId]);

  // Atualizar cache em memória quando dados mudarem
  useEffect(() => {
    globalMemoryCache.currentUser = currentUser;
    globalMemoryCache.segments = segments;
    globalMemoryCache.activeSegmentId = activeSegmentId;
  }, [currentUser, segments, activeSegmentId]);

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
        const token = apiService.getToken();
        console.log('🔑 Token encontrado:', !!token);
        
        if (token) {
          try {
            console.log('👤 Verificando perfil do usuário...');
            const userProfile = await apiService.getProfile();
            console.log('✅ Perfil carregado:', userProfile.user.name);
            setCurrentUser(userProfile.user);
            
            // Load segments for the user
            console.log('📋 Carregando segmentos...');
            const segmentsResponse = await apiService.getSegments();
            setSegments(segmentsResponse.segments || []);
            
            // Load ONLY ESSENTIAL data with user's segment context
            const segmentFilter = userProfile.user.segment_id ? { segment_id: userProfile.user.segment_id } : {};
            
            console.log('🚀 Loading essential data for user:', userProfile.user.name);
            
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
            console.error('❌ Authentication check failed:', error);
            apiService.setToken(null);
            setCurrentUser(null);
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
        
        console.log('🎯 Loading essential data for login');
        
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
        
        console.log('🎉 Dashboard ready');
        
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
      
      // Limpar cache em memória
      globalMemoryCache.currentUser = null;
      globalMemoryCache.segments = [];
      globalMemoryCache.activeSegmentId = 0;
      globalMemoryCache.data = null;
      globalMemoryCache.authToken = null; // Clear token on logout
      
      // Limpar localStorage
      forceClearStorage();
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails on server, clear local state
      setCurrentUser(null);
      setSegments([]);
      setData(defaultInitialData);
      setLazyState(defaultLazyState);
      
      // Limpar cache em memória
      globalMemoryCache.currentUser = null;
      globalMemoryCache.segments = [];
      globalMemoryCache.activeSegmentId = 0;
      globalMemoryCache.data = null;
      globalMemoryCache.authToken = null; // Clear token on logout
      
      // Limpar localStorage
      forceClearStorage();
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

  const requestPasswordReset = async (email, phone = null) => {
    try {
      const response = await apiService.requestPasswordReset({ email, phone });
      return response;
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  };

  const resetPassword = async (email, phone, resetCode, newPassword) => {
    try {
      const response = await apiService.resetPassword({ 
        email, 
        phone, 
        resetCode, 
        newPassword 
      });
      return response;
    } catch (error) {
      console.error('Password reset error:', error);
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

  const addTransaction = async (transaction) => {
    try {
      console.log('🔍 Debug addTransaction - Dados recebidos:', transaction);
      
      // Garantir que os dados estejam no formato correto
      const formattedTransaction = {
        ...transaction,
        amount: parseFloat(transaction.amount),
        segment_id: transaction.segmentId ? parseInt(transaction.segmentId) : null,
        date: transaction.date || new Date().toISOString().split('T')[0],
        cost_center: transaction.type === 'receita' ? null : transaction.costCenter
      };

      console.log('🔍 Debug addTransaction - Dados formatados:', formattedTransaction);

      const response = await apiService.createTransaction(formattedTransaction);
      
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

  const updateTransaction = async (id, transactionData) => {
    try {
      // Garantir que os dados estejam no formato correto
      const formattedData = {
        ...transactionData,
        amount: parseFloat(transactionData.amount),
        segment_id: parseInt(transactionData.segmentId),
        date: transactionData.date || new Date().toISOString().split('T')[0],
        cost_center: transactionData.type === 'receita' ? null : transactionData.costCenter
      };

      const response = await apiService.updateTransaction(id, formattedData);
      
      // Update local state
      setData(prev => ({
        ...prev,
        transactions: prev.transactions.map(transaction => 
          transaction.id === id ? response.transaction : transaction
        )
      }));
      
      toast({
        title: "Transação Atualizada!",
        description: "A transação foi atualizada com sucesso."
      });
      
      return response.transaction;
    } catch (error) {
      console.error('Update transaction error:', error);
      toast({
        title: "Erro!",
        description: "Falha ao atualizar transação. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteTransaction = async (transactionId) => {
    try {
      await apiService.deleteTransaction(transactionId);
      
      // Update local state
      setData(prev => ({
        ...prev,
        transactions: prev.transactions.filter(transaction => transaction.id !== transactionId)
      }));
      
      toast({
        title: "Transação Excluída!",
        description: "A transação foi excluída com sucesso."
      });
    } catch (error) {
      console.error('Delete transaction error:', error);
      toast({
        title: "Erro!",
        description: "Falha ao excluir transação. Tente novamente.",
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
      
      // Tratar erros específicos da API
      let errorMessage = "Falha ao adicionar cliente. Tente novamente.";
      
      if (error.message.includes('email already exists')) {
        errorMessage = "Cliente com este email já existe.";
      } else if (error.message.includes('document already exists')) {
        errorMessage = "Cliente com este documento já existe.";
      } else if (error.message.includes('Customer with this email already exists')) {
        errorMessage = "Cliente com este email já existe.";
      } else if (error.message.includes('Customer with this document already exists')) {
        errorMessage = "Cliente com este documento já existe.";
      }
      
      toast({
        title: "Erro!",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const addNFe = async (nfe) => {
    try {
      console.log('🔍 Debug addNFe - Dados recebidos:', nfe);
      
      const nfeData = {
        ...nfe,
        customer_name: nfe.customerName,
        total: parseFloat(nfe.total),
        date: new Date().toISOString().split('T')[0],
        segmentId: activeSegmentId
      };
      
      console.log('🔍 Debug addNFe - Dados processados:', nfeData);
      console.log('🔍 Debug addNFe - Token atual:', apiService.getToken());
      
      const response = await apiService.createNFe(nfeData);
      console.log('🔍 Debug addNFe - Resposta da API:', response);
      
      // Update local state
      setData(prev => ({
        ...prev,
        nfeList: [...(prev.nfeList || []), response.nfe]
      }));
      
      // Criar cobrança automaticamente baseada na NF-e
      try {
        const nfeDate = new Date(nfe.date || new Date());
        const dueDate = new Date(nfeDate);
        dueDate.setDate(dueDate.getDate() + 30); // Vencimento em 30 dias
        
        const billingData = {
          customer_id: nfe.customerId,
          customer_name: nfe.customerName,
          amount: parseFloat(nfe.total),
          due_date: dueDate.toISOString().split('T')[0],
          status: 'Pendente',
          segment_id: activeSegmentId,
          nfe_id: response.nfe.id, // Referência à NF-e
          description: `Cobrança referente à NF-e ${nfe.number}`
        };
        
        console.log('🔍 Debug addNFe - Criando cobrança automática:', billingData);
        const billingResponse = await apiService.createBilling(billingData);
        
        // Update local state com a nova cobrança
        setData(prev => ({
          ...prev,
          billings: [billingResponse.billing, ...(prev.billings || [])]
        }));
        
        console.log('✅ Debug addNFe - Cobrança criada automaticamente:', billingResponse.billing);
        
        toast({
          title: "NF-e Criada com Cobrança!",
          description: `NF-e ${nfe.number} criada e cobrança gerada automaticamente com vencimento em ${dueDate.toLocaleDateString('pt-BR')}.`
        });
      } catch (billingError) {
        console.error('❌ Debug addNFe - Erro ao criar cobrança automática:', billingError);
        // Não falhar a criação da NF-e se a cobrança falhar
        toast({
          title: "NF-e Criada!",
          description: "A Nota Fiscal Eletrônica foi criada com sucesso. (Cobrança automática falhou)"
        });
      }
      
      return response.nfe;
    } catch (error) {
      console.error('❌ Debug addNFe - Erro completo:', error);
      console.error('❌ Debug addNFe - Mensagem de erro:', error.message);
      console.error('❌ Debug addNFe - Stack trace:', error.stack);
      
      toast({
        title: "Erro!",
        description: "Falha ao criar NF-e. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateNFe = async (id, nfeData) => {
    try {
      const response = await apiService.updateNFe(id, {
        ...nfeData,
        customer_name: nfeData.customerName,
        total: parseFloat(nfeData.total),
        segment_id: activeSegmentId
      });
      
      // Update local state
      setData(prev => ({
        ...prev,
        nfeList: prev.nfeList.map(nfe => 
          nfe.id === id ? response.nfe : nfe
        )
      }));
      
      toast({
        title: "NF-e Atualizada!",
        description: "A Nota Fiscal Eletrônica foi atualizada com sucesso."
      });
      
      return response.nfe;
    } catch (error) {
      console.error('Update NFe error:', error);
      toast({
        title: "Erro!",
        description: "Falha ao atualizar NF-e. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteNFe = async (nfeId) => {
    try {
      await apiService.deleteNFe(nfeId);
      
      // Update local state
      setData(prev => ({
        ...prev,
        nfeList: prev.nfeList.filter(nfe => nfe.id !== nfeId)
      }));
      
      toast({
        title: "NF-e Excluída!",
        description: "A Nota Fiscal Eletrônica foi excluída com sucesso."
      });
    } catch (error) {
      console.error('Delete NFe error:', error);
      toast({
        title: "Erro!",
        description: "Falha ao excluir NF-e. Tente novamente.",
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

  const updateBilling = async (id, billingData) => {
    try {
      const response = await apiService.updateBilling(id, billingData);
      
      // Update local state
      setData(prev => ({
        ...prev,
        billings: prev.billings.map(billing => 
          billing.id === id ? response.billing : billing
        )
      }));
      
      toast({
        title: "Cobrança Atualizada!",
        description: "A cobrança foi atualizada com sucesso."
      });
      
      return response.billing;
    } catch (error) {
      console.error('Update billing error:', error);
      toast({
        title: "Erro!",
        description: "Falha ao atualizar cobrança. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteBilling = async (billingId) => {
    try {
      await apiService.deleteBilling(billingId);
      
      // Update local state
      setData(prev => ({
        ...prev,
        billings: prev.billings.filter(billing => billing.id !== billingId)
      }));
      
      toast({
        title: "Cobrança Excluída!",
        description: "A cobrança foi excluída com sucesso."
      });
    } catch (error) {
      console.error('Delete billing error:', error);
      toast({
        title: "Erro!",
        description: "Falha ao excluir cobrança. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const addCostCenter = async (costCenter) => {
    try {
      // Garantir que segmentId seja enviado como segment_id
      const formattedCostCenter = {
        ...costCenter,
        segment_id: costCenter.segmentId ? parseInt(costCenter.segmentId) : null
      };
      delete formattedCostCenter.segmentId;
      const response = await apiService.createCostCenter(formattedCostCenter);
      
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
      // Garantir que segmentId seja enviado como segment_id
      const formattedCostCenter = {
        ...updatedCostCenter,
        segment_id: updatedCostCenter.segmentId ? parseInt(updatedCostCenter.segmentId) : null
      };
      delete formattedCostCenter.segmentId;
      const response = await apiService.updateCostCenter(id, formattedCostCenter);
      
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

  const addAccountPayable = async (account) => {
    try {
      const response = await apiService.createAccountPayable({
        ...account,
        due_date: account.dueDate,
        segment_id: account.segmentId
      });
      
      // Update local state
      setData(prev => ({
        ...prev,
        accountsPayable: [response.account, ...prev.accountsPayable]
      }));
      
      toast({
        title: "Conta a Pagar Adicionada!",
        description: "Nova conta a pagar foi registrada com sucesso."
      });
      
      return response.account;
    } catch (error) {
      console.error('Add account payable error:', error);
      toast({
        title: "Erro!",
        description: "Falha ao adicionar conta a pagar. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateAccountPayable = async (account) => {
    try {
      const response = await apiService.updateAccountPayable(account.id, {
        ...account,
        due_date: account.dueDate,
        segment_id: account.segmentId
      });
      
      // Update local state
      setData(prev => ({
        ...prev,
        accountsPayable: prev.accountsPayable.map(acc => 
          acc.id === account.id ? response.account : acc
        )
      }));
      
      toast({
        title: "Conta a Pagar Atualizada!",
        description: "A conta a pagar foi atualizada com sucesso."
      });
      
      return response.account;
    } catch (error) {
      console.error('Update account payable error:', error);
      toast({
        title: "Erro!",
        description: "Falha ao atualizar conta a pagar. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteAccountPayable = async (accountId) => {
    try {
      await apiService.deleteAccountPayable(accountId);
      
      // Update local state
      setData(prev => ({
        ...prev,
        accountsPayable: prev.accountsPayable.filter(acc => acc.id !== accountId)
      }));
      
      toast({
        title: "Conta a Pagar Excluída!",
        description: "A conta a pagar foi excluída com sucesso."
      });
    } catch (error) {
      console.error('Delete account payable error:', error);
      toast({
        title: "Erro!",
        description: "Falha ao excluir conta a pagar. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Segments functions
  const addSegment = async (segmentData) => {
    try {
      const response = await apiService.createSegment(segmentData);
      
      // Update local state
      setSegments(prev => [...prev, response.segment]);
      
      toast({
        title: "Segmento Criado!",
        description: "O segmento foi criado com sucesso."
      });
      
      return response.segment;
    } catch (error) {
      console.error('Add segment error:', error);
      toast({
        title: "Erro!",
        description: "Falha ao criar segmento. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateSegment = async (id, segmentData) => {
    try {
      const response = await apiService.updateSegment(id, segmentData);
      
      // Update local state
      setSegments(prev => prev.map(s => s.id === id ? response.segment : s));
      
      toast({
        title: "Segmento Atualizado!",
        description: "O segmento foi atualizado com sucesso."
      });
      
      return response.segment;
    } catch (error) {
      console.error('Update segment error:', error);
      toast({
        title: "Erro!",
        description: "Falha ao atualizar segmento. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteSegment = async (segmentId) => {
    try {
      await apiService.deleteSegment(segmentId);
      
      // Update local state
      setSegments(prev => prev.filter(s => s.id !== segmentId));
      
      toast({
        title: "Segmento Excluído!",
        description: "O segmento foi excluído com sucesso."
      });
    } catch (error) {
      console.error('Delete segment error:', error);
      toast({
        title: "Erro!",
        description: "Falha ao excluir segmento. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // User management functions (admin only)
  const loadUsers = async (params = {}) => {
    try {
      const response = await apiService.getUsers(params);
      setData(prev => ({ ...prev, users: response.users || [] }));
      return response;
    } catch (error) {
      console.error('Load users error:', error);
      throw error;
    }
  };

  const createUser = async (userData) => {
    try {
      const response = await apiService.createUser(userData);
      
      // Update local state
      setData(prev => ({ ...prev, users: [...prev.users, response.user] }));
      
      toast({
        title: "Usuário Criado!",
        description: "O usuário foi criado com sucesso."
      });
      
      return response.user;
    } catch (error) {
      console.error('Create user error:', error);
      toast({
        title: "Erro!",
        description: "Falha ao criar usuário. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateUser = async (id, userData) => {
    try {
      const response = await apiService.updateUser(id, userData);
      
      // Update local state
      setData(prev => ({ 
        ...prev, 
        users: prev.users.map(u => u.id === id ? response.user : u) 
      }));
      
      toast({
        title: "Usuário Atualizado!",
        description: "O usuário foi atualizado com sucesso."
      });
      
      return response.user;
    } catch (error) {
      console.error('Update user error:', error);
      toast({
        title: "Erro!",
        description: "Falha ao atualizar usuário. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteUser = async (userId) => {
    try {
      await apiService.deleteUser(userId);
      
      // Update local state
      setData(prev => ({ 
        ...prev, 
        users: prev.users.filter(u => u.id !== userId) 
      }));
      
      toast({
        title: "Usuário Excluído!",
        description: "O usuário foi excluído com sucesso."
      });
    } catch (error) {
      console.error('Delete user error:', error);
      toast({
        title: "Erro!",
        description: "Falha ao excluir usuário. Tente novamente.",
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

  const value = {
    data: {
      ...data,
      segments: segments || []
    },
    metrics,
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
    requestPasswordReset,
    resetPassword,
    
    // Data loading functions
    loadTransactions,
    loadProducts,
    loadCustomers,
    loadSales,
    loadBillings,
    loadCostCenters,
    loadNFe,
    loadAccountsPayable,
    
    // Data creation functions
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addProduct,
    addSale,
    addCustomer,
    addNFe,
    addBilling,
    addCostCenter,
    addAccountPayable,
    
    // Data update/delete functions
    updateBilling,
    deleteBilling,
    updateCostCenter,
    deleteCostCenter,
    updateAccountPayable,
    deleteAccountPayable,
    
    // Import function
    importData,
    
    // Metrics functions
    getDashboardMetrics,
    getFinancialMetrics,
    getSalesMetrics,
    
    // Lazy loading functions
    ensureCostCentersLoaded,
    ensureAccountsPayableLoaded,
    
    // Segments functions
    addSegment,
    updateSegment,
    deleteSegment,
    
    // User management functions (admin only)
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    
    // NFe functions
    updateNFe,
    deleteNFe,
    
    // Toast function
    toast,
    reloadDashboardData
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