import { useState, useEffect } from 'react'
import { listPartners, createPartner, updatePartner, deletePartner } from '@/services/partnersService'
import { toast } from '@/components/ui/use-toast'

export function usePartners({ role, segmentId, pageSize = 20 } = {}) {
  const [partners, setPartners] = useState([])
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
      if (role) params.role = role
      if (segmentId) params.segment_id = segmentId
      
      const response = await listPartners(params)
      const data = response.partners || response
      
      if (append) {
        setPartners(prev => [...prev, ...data])
      } else {
        setPartners(data)
      }
      
      setHasMore(data.length === pageSize)
      setPage(pageNum)
    } catch (err) {
      console.error('Erro ao carregar parceiros:', err)
      toast({ 
        title: 'Erro', 
        description: 'Falha ao carregar parceiros', 
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
      const partner = await createPartner(payload)
      setPartners((prev) => [...prev, partner])
      toast({ 
        title: 'Sucesso', 
        description: 'Parceiro criado com sucesso' 
      })
      return partner
    } catch (err) {
      console.error('Erro ao criar parceiro:', err)
      toast({ 
        title: 'Erro', 
        description: 'Falha ao criar parceiro', 
        variant: 'destructive' 
      })
      throw err
    }
  }

  const update = async (id, payload) => {
    try {
      const updated = await updatePartner(id, payload)
      setPartners((prev) => prev.map((p) => (p.id === id ? updated : p)))
      toast({ 
        title: 'Sucesso', 
        description: 'Parceiro atualizado com sucesso' 
      })
      return updated
    } catch (err) {
      console.error('Erro ao atualizar parceiro:', err)
      toast({ 
        title: 'Erro', 
        description: 'Falha ao atualizar parceiro', 
        variant: 'destructive' 
      })
      throw err
    }
  }

  const remove = async (id) => {
    try {
      await deletePartner(id)
      setPartners((prev) => prev.filter((p) => p.id !== id))
      toast({ 
        title: 'Sucesso', 
        description: 'Parceiro excluído com sucesso', 
        variant: 'default' 
      })
    } catch (err) {
      console.error('Erro ao excluir parceiro:', err)
      toast({ 
        title: 'Erro', 
        description: 'Falha ao excluir parceiro', 
        variant: 'destructive' 
      })
      throw err
    }
  }

  useEffect(() => { 
    load() 
  }, [role, segmentId])

  return { 
    partners, 
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
