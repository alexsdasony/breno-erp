import { useState, useEffect } from 'react'
import { listCostCenters, createCostCenter, updateCostCenter, deleteCostCenter } from '@/services/costCentersService'
import { toast } from '@/components/ui/use-toast'

export function useCostCenters({ segmentId, pageSize = 20 } = {}) {
  const [costCenters, setCostCenters] = useState([])
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
      if (segmentId) params.segment_id = segmentId
      
      const response = await listCostCenters(params)
      const data = response.costCenters || response
      
      if (append) {
        setCostCenters(prev => [...prev, ...data])
      } else {
        setCostCenters(data)
      }
      
      setHasMore(data.length === pageSize)
      setPage(pageNum)
    } catch (err) {
      console.error('Erro ao carregar centros de custo:', err)
      toast({ 
        title: 'Erro', 
        description: 'Falha ao carregar centros de custo', 
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
      const costCenter = await createCostCenter(payload)
      setCostCenters((prev) => [...prev, costCenter])
      toast({ 
        title: 'Sucesso', 
        description: 'Centro de custo criado com sucesso' 
      })
      return costCenter
    } catch (err) {
      console.error('Erro ao criar centro de custo:', err)
      toast({ 
        title: 'Erro', 
        description: 'Falha ao criar centro de custo', 
        variant: 'destructive' 
      })
      throw err
    }
  }

  const update = async (id, payload) => {
    try {
      const updated = await updateCostCenter(id, payload)
      setCostCenters((prev) => prev.map((c) => (c.id === id ? updated : c)))
      toast({ 
        title: 'Sucesso', 
        description: 'Centro de custo atualizado com sucesso' 
      })
      return updated
    } catch (err) {
      console.error('Erro ao atualizar centro de custo:', err)
      toast({ 
        title: 'Erro', 
        description: 'Falha ao atualizar centro de custo', 
        variant: 'destructive' 
      })
      throw err
    }
  }

  const remove = async (id) => {
    try {
      await deleteCostCenter(id)
      setCostCenters((prev) => prev.filter((c) => c.id !== id))
      toast({ 
        title: 'Sucesso', 
        description: 'Centro de custo excluído com sucesso', 
        variant: 'default' 
      })
    } catch (err) {
      console.error('Erro ao excluir centro de custo:', err)
      toast({ 
        title: 'Erro', 
        description: 'Falha ao excluir centro de custo', 
        variant: 'destructive' 
      })
      throw err
    }
  }

  useEffect(() => { 
    load() 
  }, [segmentId])

  return { 
    costCenters, 
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
