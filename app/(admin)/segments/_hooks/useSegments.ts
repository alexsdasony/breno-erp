import { useCallback, useEffect, useState } from 'react'
import { toast } from '@/components/ui/use-toast'
import { listSegments, createSegment, updateSegment, deleteSegment } from '@/services/segmentsService'
import type { Segment, SegmentPayload } from '@/types'

export type UseSegmentsOptions = {
  pageSize?: number
}

export type UseSegmentsReturn = {
  segments: Segment[]
  loading: boolean
  hasMore: boolean
  page: number
  load: (pageNum?: number, append?: boolean) => Promise<void>
  loadMore: () => Promise<void>
  create: (payload: SegmentPayload) => Promise<Segment>
  update: (id: string, payload: SegmentPayload) => Promise<Segment>
  remove: (id: string) => Promise<void>
}

export function useSegments({ pageSize = 20 }: UseSegmentsOptions = {}): UseSegmentsReturn {
  const [segments, setSegments] = useState<Segment[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)

  const load = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    setLoading(true)
    try {
      const params = { page: pageNum, limit: pageSize }
      const data: Segment[] = await listSegments(params)

      setSegments((prev) => (append ? [...prev, ...data] : data))
      setHasMore(data.length === pageSize)
      setPage(pageNum)
    } catch (err) {
      console.error('Erro ao carregar segmentos:', err)
      toast({ title: 'Erro', description: 'Falha ao carregar segmentos', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [pageSize])

  const loadMore = useCallback(async () => {
    if (!loading && hasMore) {
      await load(page + 1, true)
    }
  }, [loading, hasMore, load, page])

  const create = useCallback(async (payload: SegmentPayload) => {
    try {
      const segment = await createSegment(payload)
      setSegments((prev) => [...prev, segment])
      toast({ title: 'Sucesso', description: 'Segmento criado com sucesso' })
      return segment as Segment
    } catch (err) {
      console.error('Erro ao criar segmento:', err)
      toast({ title: 'Erro', description: 'Falha ao criar segmento', variant: 'destructive' })
      throw err
    }
  }, [])

  const update = useCallback(async (id: string, payload: SegmentPayload) => {
    try {
      const updated = await updateSegment(id, payload)
      setSegments((prev) => prev.map((s) => (s.id === id ? (updated as Segment) : s)))
      toast({ title: 'Sucesso', description: 'Segmento atualizado com sucesso' })
      return updated as Segment
    } catch (err) {
      console.error('Erro ao atualizar segmento:', err)
      toast({ title: 'Erro', description: 'Falha ao atualizar segmento', variant: 'destructive' })
      throw err
    }
  }, [])

  const remove = useCallback(async (id: string) => {
    try {
      await deleteSegment(id)
      setSegments((prev) => prev.filter((s) => s.id !== id))
      toast({ title: 'Sucesso', description: 'Segmento excluído com sucesso' })
    } catch (err) {
      console.error('Erro ao excluir segmento:', err)
      toast({ title: 'Erro', description: 'Falha ao excluir segmento', variant: 'destructive' })
      throw err
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { segments, loading, hasMore, page, load, loadMore, create, update, remove }
}
