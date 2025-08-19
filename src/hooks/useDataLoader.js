import { useCallback } from 'react';
import apiService from '@/services/api';

export const useDataLoader = () => {
  const loadTransactions = useCallback(async (params = {}) => {
    try {
      const response = await apiService.getTransactions(params);
      const transactions = response.transactions || response.data || [];
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
      return { costCenters };
    } catch (error) {
      console.error('Load cost centers error:', error);
      throw error;
    }
  }, []);

  const loadNFe = useCallback(async (params = {}) => {
    try {
      const response = await apiService.getNFe(params);
      const nfeList = response.nfe || response.data || [];
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
      return { financialDocuments };
    } catch (error) {
      console.error('Load financial documents error:', error);
      throw error;
    }
  }, []);

  const reloadSegments = useCallback(async () => {
    try {
      const response = await apiService.getSegments();
      return response;
    } catch (error) {
      console.error('Reload segments error:', error);
      throw error;
    }
  }, []);

  return {
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
    reloadSegments
  };
};
