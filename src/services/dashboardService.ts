import apiService from '@/services/api'
import type { ApiResponse } from '@/services/api'

export interface DashboardMetrics {
  total_sales?: number;
  total_revenue?: number;
  avg_ticket?: number;
  total_customers?: number;
  low_stock_count?: number;
  pending_invoices?: number;
  pending_payables?: number;
  series_days?: Array<{
    date: string;
    sales?: number;
    revenue?: number;
    payables?: number;
    receivables?: number;
    cash_in?: number;
    cash_out?: number;
  }>;
  [key: string]: any;
}

export async function getDashboardMetrics(params: Record<string, any> = {}): Promise<ApiResponse<{ metrics: DashboardMetrics }>> {
  const response = await apiService.get<{ metrics: DashboardMetrics }>('/metrics', params)
  return response as ApiResponse<{ metrics: DashboardMetrics }>
}

export default {
  getDashboardMetrics
}