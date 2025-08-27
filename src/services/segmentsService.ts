import apiService from '@/services/api'
import type { ApiResponse } from '@/services/api'
import type { Segment, SegmentPayload } from '@/types'

export async function listSegments(params: Record<string, any> = {}): Promise<ApiResponse<{ segments: Segment[] }>> {
  const response = await apiService.get<{ success: boolean; segments: Segment[] }>('/segments', params)
  return {
    success: response.success,
    data: { segments: response.segments || [] }
  }
}

export async function createSegment(payload: SegmentPayload): Promise<ApiResponse<{ segment: Segment }>> {
  const response = await apiService.post<{ success: boolean; segment: Segment }>('/segments', payload)
  return {
    success: response.success,
    data: { segment: response.segment }
  }
}

export async function updateSegment(id: string, payload: SegmentPayload): Promise<ApiResponse<{ segment: Segment }>> {
  const response = await apiService.put<{ success: boolean; segment: Segment }>(`/segments/${id}`, payload)
  return {
    success: response.success,
    data: { segment: response.segment }
  }
}

export async function deleteSegment(id: string): Promise<ApiResponse<void>> {
  const response = await apiService.delete<{ success: boolean; message?: string }>(`/segments/${id}`);
  return {
    success: response.success,
    data: undefined
  };
}

export async function getSegmentById(id: string): Promise<ApiResponse<{ segment: Segment }>> {
  const response = await apiService.get<{ success: boolean; segment: Segment }>(`/segments/${id}`)
  return {
    success: response.success,
    data: { segment: response.segment }
  }
}
