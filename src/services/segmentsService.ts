import { apiService } from './api';
import type { ApiResponse } from './api';

export interface Segment {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export async function listSegments(): Promise<ApiResponse<{ segments: Segment[] }>> {
  const response = await apiService.get<{ success: boolean; segments: Segment[] }>('/segments');
  
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