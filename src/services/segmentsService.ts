import apiService from '@/services/api'
import type { ApiResponse } from '@/services/api'
import type { Segment, SegmentPayload } from '@/types'

export async function listSegments(params: Record<string, any> = {}): Promise<ApiResponse<{ segments: Segment[] }>> {
  const response = await apiService.get<{ segments: Segment[] }>('/segments', params)
  return response as ApiResponse<{ segments: Segment[] }>
}

export async function createSegment(payload: SegmentPayload): Promise<ApiResponse<{ segment: Segment }>> {
  const response = await apiService.post<{ segment: Segment }>('/segments', payload)
  return response as ApiResponse<{ segment: Segment }>
}

export async function updateSegment(id: string, payload: SegmentPayload): Promise<ApiResponse<{ segment: Segment }>> {
  const response = await apiService.put<{ segment: Segment }>(`/segments/${id}`, payload)
  return response as ApiResponse<{ segment: Segment }>
}

export async function deleteSegment(id: string): Promise<ApiResponse<void>> {
  const response = await apiService.delete<ApiResponse<void>>(`/segments/${id}`)
  return response
}

export async function getSegmentById(id: string): Promise<ApiResponse<{ segment: Segment }>> {
  const response = await apiService.get<{ segment: Segment }>(`/segments/${id}`)
  return response as ApiResponse<{ segment: Segment }>
}
