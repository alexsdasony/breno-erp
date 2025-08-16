import apiService from '@/services/api'

export async function listSegments(params = {}) {
  const res = await apiService.getSegments(params)
  return res.segments || res.data || []
}

export async function createSegment(payload) {
  const res = await apiService.createSegment(payload)
  return res.segment || res
}

export async function updateSegment(id, payload) {
  const res = await apiService.updateSegment(id, payload)
  return res.segment || res
}

export async function deleteSegment(id) {
  return apiService.deleteSegment(id)
}

export async function getSegmentById(id) {
  const res = await apiService.getSegments({ id })
  return res.segments?.[0] || res.segment || res
}
