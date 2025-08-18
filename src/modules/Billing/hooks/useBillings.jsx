import { useState, useEffect } from 'react'
import { listBillings, createBilling, updateBilling, deleteBilling } from '@/services/billingService'
import { toast } from '@/components/ui/use-toast'

export function useBillings({ segmentId, pageSize = 20 } = {}) {
  const [billings, setBillings] = useState([])
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
      
      const response = await listBillings(params)
      const data = response.billings || response
      
      if (append) {
        setBillings(prev => [...prev, ...data])
      } else {
        setBillings(data)
      }
      
      setHasMore(data.length === pageSize)
      setPage(pageNum)
    } catch (err) {
      console.error('Erro ao carregar cobranças:', err)
      toast({ 
        title: 'Erro', 
        description: 'Falha ao carregar cobranças', 
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
      const billing = await createBilling(payload)
      setBillings((prev) => [...prev, billing])
      toast({ 
        title: 'Sucesso', 
        description: 'Cobrança criada com sucesso' 
      })
      return billing
    } catch (err) {
      console.error('Erro ao criar cobrança:', err)
      toast({ 
        title: 'Erro', 
        description: 'Falha ao criar cobrança', 
        variant: 'destructive' 
      })
      throw err
    }
  }

  const update = async (id, payload) => {
    try {
      const updated = await updateBilling(id, payload)
      setBillings((prev) => prev.map((b) => (b.id === id ? updated : b)))
      toast({ 
        title: 'Sucesso', 
        description: 'Cobrança atualizada com sucesso' 
      })
      return updated
    } catch (err) {
      console.error('Erro ao atualizar cobrança:', err)
      toast({ 
        title: 'Erro', 
        description: 'Falha ao atualizar cobrança', 
        variant: 'destructive' 
      })
      throw err
    }
  }

  const remove = async (id) => {
    try {
      await deleteBilling(id)
      setBillings((prev) => prev.filter((b) => b.id !== id))
      toast({ 
        title: 'Sucesso', 
        description: 'Cobrança excluída com sucesso', 
        variant: 'default' 
      })
    } catch (err) {
      console.error('Erro ao excluir cobrança:', err)
      toast({ 
        title: 'Erro', 
        description: 'Falha ao excluir cobrança', 
        variant: 'destructive' 
      })
      throw err
    }
  }

  useEffect(() => { 
    load() 
  }, [segmentId])

  return { 
    billings, 
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
