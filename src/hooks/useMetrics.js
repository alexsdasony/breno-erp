import { useCallback } from 'react';
import apiService from '@/services/api';

export const useMetrics = () => {
  const getDashboardMetrics = useCallback(async (params = {}) => {
    try {
      // Add user's segment context if available
      const segmentFilter = params.currentUser?.segment_id ? { segment_id: params.currentUser.segment_id } : {};
      return await apiService.getDashboardMetrics({ ...segmentFilter, ...params });
    } catch (error) {
      console.error('Get dashboard metrics error:', error);
      throw error;
    }
  }, []);

  const getFinancialMetrics = useCallback(async (params = {}) => {
    try {
      // Add user's segment context if available
      const segmentFilter = params.currentUser?.segment_id ? { segment_id: params.currentUser.segment_id } : {};
      return await apiService.getFinancialMetrics({ ...segmentFilter, ...params });
    } catch (error) {
      console.error('Get financial metrics error:', error);
      throw error;
    }
  }, []);

  const getSalesMetrics = useCallback(async (params = {}) => {
    try {
      return await apiService.getSalesMetrics(params);
    } catch (error) {
      console.error('Get sales metrics error:', error);
      throw error;
    }
  }, []);

  return {
    getDashboardMetrics,
    getFinancialMetrics,
    getSalesMetrics
  };
};
