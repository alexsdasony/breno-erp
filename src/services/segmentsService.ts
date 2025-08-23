import apiService from '@/services/api'
import type { Segment, SegmentPayload } from '@/types'

export async function listSegments(params: Record<string, any> = {}): Promise<Segment[]> {
  const res: any = await apiService.getSegments(params)
  return (res.segments || res.data || []) as Segment[]
}

export async function createSegment(payload: SegmentPayload): Promise<Segment> {
  const res: any = await apiService.createSegment(payload)
  return (res.segment || res) as Segment
}

export async function updateSegment(id: string, payload: SegmentPayload): Promise<Segment> {
  const res: any = await apiService.updateSegment(id, payload)
  return (res.segment || res) as Segment
}

export async function deleteSegment(id: string): Promise<void> {
  await apiService.deleteSegment(id)
}

export async function getSegmentById(id: string): Promise<Segment> {
  const res: any = await apiService.getSegments({ id })
  return (res.segments?.[0] || res.segment || res) as Segment
}
