import { useState, useEffect } from 'react'
import { listProducts, createProduct, updateProduct, deleteProduct } from '@/services/productsService'
import { toast } from '@/components/ui/use-toast'

export function useProducts({ segmentId, pageSize = 20 } = {}) {
  const [products, setProducts] = useState([])
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
      
      const response = await listProducts(params)
      const data = response.products || response
      
      if (append) {
        setProducts(prev => [...prev, ...data])
      } else {
        setProducts(data)
      }
      
      setHasMore(data.length === pageSize)
      setPage(pageNum)
    } catch (err) {
      console.error('Erro ao carregar produtos:', err)
      toast({ 
        title: 'Erro', 
        description: 'Falha ao carregar produtos', 
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
      const product = await createProduct(payload)
      setProducts((prev) => [...prev, product])
      toast({ 
        title: 'Sucesso', 
        description: 'Produto criado com sucesso' 
      })
      return product
    } catch (err) {
      console.error('Erro ao criar produto:', err)
      toast({ 
        title: 'Erro', 
        description: 'Falha ao criar produto', 
        variant: 'destructive' 
      })
      throw err
    }
  }

  const update = async (id, payload) => {
    try {
      const updated = await updateProduct(id, payload)
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)))
      toast({ 
        title: 'Sucesso', 
        description: 'Produto atualizado com sucesso' 
      })
      return updated
    } catch (err) {
      console.error('Erro ao atualizar produto:', err)
      toast({ 
        title: 'Erro', 
        description: 'Falha ao atualizar produto', 
        variant: 'destructive' 
      })
      throw err
    }
  }

  const remove = async (id) => {
    try {
      await deleteProduct(id)
      setProducts((prev) => prev.filter((p) => p.id !== id))
      toast({ 
        title: 'Sucesso', 
        description: 'Produto excluído com sucesso', 
        variant: 'default' 
      })
    } catch (err) {
      console.error('Erro ao excluir produto:', err)
      toast({ 
        title: 'Erro', 
        description: 'Falha ao excluir produto', 
        variant: 'destructive' 
      })
      throw err
    }
  }

  useEffect(() => { 
    load() 
  }, [segmentId])

  return { 
    products, 
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
