import apiService from './api';
import type { ApiResponse } from './api';

export interface Segment {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export async function listSegments(params?: { page?: number; pageSize?: number }): Promise<ApiResponse<{ segments: Segment[] }>> {
  const queryParams = params ? `?page=${params.page || 1}&limit=${params.pageSize || 100}` : '';
  const response = await apiService.get<{ success: boolean; segments: Segment[] }>(`/segments${queryParams}`);
  
  return {
    data: {
      segments: response.segments || []
    },
    success: response.success || false
  } as ApiResponse<{ segments: Segment[] }>;
}

export async function getSegmentByName(name: string): Promise<ApiResponse<{ segment: Segment }>> {
  const response = await apiService.get<{ success: boolean; segment: Segment }>(`/segments/name/${name}`);
  
  return {
    data: {
      segment: response.segment
    },
    success: response.success || false
  } as ApiResponse<{ segment: Segment }>;
}

export async function createSegment(payload: Omit<Segment, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<{ segment: Segment }>> {
  const response = await apiService.post<{ success: boolean; segment: Segment }>('/segments', payload);
  
  return {
    data: {
      segment: response.segment
    },
    success: response.success || false
  } as ApiResponse<{ segment: Segment }>;
}

export async function updateSegment(id: string, payload: Partial<Omit<Segment, 'id' | 'created_at' | 'updated_at'>>): Promise<ApiResponse<{ segment: Segment }>> {
  const response = await apiService.put<{ success: boolean; segment: Segment }>(`/segments/${id}`, payload);
  
  return {
    data: {
      segment: response.segment
    },
    success: response.success || false
  } as ApiResponse<{ segment: Segment }>;
}

export async function deleteSegment(id: string): Promise<ApiResponse<void>> {
  const response = await apiService.delete<{ success: boolean; message?: string }>(`/segments/${id}`);
  
  return {
    success: response.success,
    data: undefined
  } as ApiResponse<void>;
}