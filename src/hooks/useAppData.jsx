import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import apiService from '@/services/api';
import { calculateMetrics } from '@/utils/metrics';
import { useAuth } from './useAuth';

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

export const AppDataProvider = ({ children }) => {
  const [data, setData] = useState(defaultInitialData);
  const [loading, setLoading] = useState(true);
  const [segments, setSegments] = useState(globalMemoryCache.segments);
  const [activeSegmentId, setActiveSegmentId] = useState(globalMemoryCache.activeSegmentId);

  // Use the corrected hooks
  const { currentUser, loading: authLoading, loginUser, registerUser, logoutUser, updateUserProfile, changeUserPassword, requestPasswordReset, resetPassword } = useAuth();

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

  // Adicionar função para recarregar dados do dashboard
  const reloadDashboardData = useCallback(async (segmentId) => {
    try {
      console.log('🔄 Recarregando dados para segmento:', segmentId);
      
      // Definir o novo segmento ativo
      const newSegmentId = segmentId || activeSegmentId || 0;
      setActiveSegmentId(newSegmentId);
      
      console.log('✅ Dashboard data reload completed');
    } catch (error) {
      console.error('❌ Erro ao recarregar dados:', error);
      toast({
        title: "Erro",
        description: "Falha ao recarregar dados. Tente novamente.",
        variant: "destructive"
      });
    }
  }, [activeSegmentId, toast]);

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