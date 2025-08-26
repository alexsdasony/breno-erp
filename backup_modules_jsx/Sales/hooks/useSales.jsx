import { useState, useEffect } from 'react'
import { listSales, createSale, updateSale, deleteSale } from '@/services/salesService'
import { toast } from '@/components/ui/use-toast'

export function useSales({ segmentId, pageSize = 20 } = {}) {
  const [sales, setSales] = useState([])
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
      
      const response = await listSales(params)
      const data = response.sales || response
      
      if (append) {
        setSales(prev => [...prev, ...data])
      } else {
        setSales(data)
      }
      
      setHasMore(data.length === pageSize)
      setPage(pageNum)
    } catch (err) {
      console.error('Erro ao carregar vendas:', err)
      toast({ 
        title: 'Erro', 
        description: 'Falha ao carregar vendas', 
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
      const sale = await createSale(payload)
      setSales((prev) => [...prev, sale])
      toast({ 
        title: 'Sucesso', 
        description: 'Venda criada com sucesso' 
      })
      return sale
    } catch (err) {
      console.error('Erro ao criar venda:', err)
      toast({ 
        title: 'Erro', 
        description: 'Falha ao criar venda', 
        variant: 'destructive' 
      })
      throw err
    }
  }

  const update = async (id, payload) => {
    try {
      const updated = await updateSale(id, payload)
      setSales((prev) => prev.map((s) => (s.id === id ? updated : s)))
      toast({ 
        title: 'Sucesso', 
        description: 'Venda atualizada com sucesso' 
      })
      return updated
    } catch (err) {
      console.error('Erro ao atualizar venda:', err)
      toast({ 
        title: 'Erro', 
        description: 'Falha ao atualizar venda', 
        variant: 'destructive' 
      })
      throw err
    }
  }

  const remove = async (id) => {
    try {
      await deleteSale(id)
      setSales((prev) => prev.filter((s) => s.id !== id))
      toast({ 
        title: 'Sucesso', 
        description: 'Venda excluída com sucesso', 
        variant: 'default' 
      })
    } catch (err) {
      console.error('Erro ao excluir venda:', err)
      toast({ 
        title: 'Erro', 
        description: 'Falha ao excluir venda', 
        variant: 'destructive' 
      })
      throw err
    }
  }

  useEffect(() => { 
    load() 
  }, [segmentId])

  return { 
    sales, 
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
