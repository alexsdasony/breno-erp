import { useState, useEffect } from 'react'
import { listProducts, createProduct, updateProduct, deleteProduct } from '@/services/productsService'
import { toast } from '@/components/ui/use-toast'

export function useProducts({ segmentId } = {}) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const params = {}
      if (segmentId) params.segment_id = segmentId
      
      const data = await listProducts(params)
      setProducts(data)
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
    create, 
    update, 
    remove 
  }
}
