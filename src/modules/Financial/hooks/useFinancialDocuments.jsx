import { useState, useEffect } from 'react'
import { listFinancialDocuments, createFinancialDocument, updateFinancialDocument, deleteFinancialDocument } from '@/services/financialService'
import { toast } from '@/components/ui/use-toast'

export function useFinancialDocuments({ segmentId, direction, pageSize = 20 } = {}) {
  const [documents, setDocuments] = useState([])
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
      if (direction) params.direction = direction
      
      const response = await listFinancialDocuments(params)
      const data = response.financialDocuments || response
      
      if (append) {
        setDocuments(prev => [...prev, ...data])
      } else {
        setDocuments(data)
      }
      
      setHasMore(data.length === pageSize)
      setPage(pageNum)
    } catch (err) {
      console.error('Erro ao carregar documentos financeiros:', err)
      toast({ 
        title: 'Erro', 
        description: 'Falha ao carregar documentos financeiros', 
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
      const document = await createFinancialDocument(payload)
      setDocuments((prev) => [...prev, document])
      toast({ 
        title: 'Sucesso', 
        description: 'Documento financeiro criado com sucesso' 
      })
      return document
    } catch (err) {
      console.error('Erro ao criar documento financeiro:', err)
      toast({ 
        title: 'Erro', 
        description: 'Falha ao criar documento financeiro', 
        variant: 'destructive' 
      })
      throw err
    }
  }

  const update = async (id, payload) => {
    try {
      const updated = await updateFinancialDocument(id, payload)
      setDocuments((prev) => prev.map((d) => (d.id === id ? updated : d)))
      toast({ 
        title: 'Sucesso', 
        description: 'Documento financeiro atualizado com sucesso' 
      })
      return updated
    } catch (err) {
      console.error('Erro ao atualizar documento financeiro:', err)
      toast({ 
        title: 'Erro', 
        description: 'Falha ao atualizar documento financeiro', 
        variant: 'destructive' 
      })
      throw err
    }
  }

  const remove = async (id) => {
    try {
      await deleteFinancialDocument(id)
      setDocuments((prev) => prev.filter((d) => d.id !== id))
      toast({ 
        title: 'Sucesso', 
        description: 'Documento financeiro excluído com sucesso', 
        variant: 'default' 
      })
    } catch (err) {
      console.error('Erro ao excluir documento financeiro:', err)
      toast({ 
        title: 'Erro', 
        description: 'Falha ao excluir documento financeiro', 
        variant: 'destructive' 
      })
      throw err
    }
  }

  useEffect(() => { 
    load() 
  }, [segmentId, direction])

  return { 
    documents, 
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
