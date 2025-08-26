import { useState, useEffect } from 'react'
import { listSegments, createSegment, updateSegment, deleteSegment } from '@/services/segmentsService'
import { toast } from '@/components/ui/use-toast'

export function useSegments({ pageSize = 20 } = {}) {
  const [segments, setSegments] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)

  const load = async (pageNum = 1, append = false) => {
    setLoading(true)
    try {
      const params = {
        page: pageNum,
        limit: pageSize
      }
      
      const response = await listSegments(params)
      const data = response.segments || response
      
      if (append) {
        setSegments(prev => [...prev, ...data])
      } else {
        setSegments(data)
      }
      
      setHasMore(data.length === pageSize)
      setPage(pageNum)
    } catch (err) {
      console.error('Erro ao carregar segmentos:', err)
      toast({ 
        title: 'Erro', 
        description: 'Falha ao carregar segmentos', 
        variant: 'destructive' 
      })
    } finally {
      setLoading(false)
    }
  }

  const loadMore = async () => {
    if (!loading && hasMore) {
      await load(page + 1, true)
    }
  }

  const create = async (payload) => {
    try {
      const segment = await createSegment(payload)
      setSegments((prev) => [...prev, segment])
      toast({ 
        title: 'Sucesso', 
        description: 'Segmento criado com sucesso' 
      })
      return segment
    } catch (err) {
      console.error('Erro ao criar segmento:', err)
      toast({ 
        title: 'Erro', 
        description: 'Falha ao criar segmento', 
        variant: 'destructive' 
      })
      throw err
    }
  }

  const update = async (id, payload) => {
    try {
      const updated = await updateSegment(id, payload)
      setSegments((prev) => prev.map((s) => (s.id === id ? updated : s)))
      toast({ 
        title: 'Sucesso', 
        description: 'Segmento atualizado com sucesso' 
      })
      return updated
    } catch (err) {
      console.error('Erro ao atualizar segmento:', err)
      toast({ 
        title: 'Erro', 
        description: 'Falha ao atualizar segmento', 
        variant: 'destructive' 
      })
      throw err
    }
  }

  const remove = async (id) => {
    try {
      await deleteSegment(id)
      setSegments((prev) => prev.filter((s) => s.id !== id))
      toast({ 
        title: 'Sucesso', 
        description: 'Segmento excluído com sucesso', 
        variant: 'default' 
      })
    } catch (err) {
      console.error('Erro ao excluir segmento:', err)
      toast({ 
        title: 'Erro', 
        description: 'Falha ao excluir segmento', 
        variant: 'destructive' 
      })
      throw err
    }
  }

  useEffect(() => { 
    load() 
  }, [])

  return { 
    segments, 
    loading, 
    load, 
    loadMore,
    hasMore,
    page,
    create, 
    update, 
    remove 
  }
}
