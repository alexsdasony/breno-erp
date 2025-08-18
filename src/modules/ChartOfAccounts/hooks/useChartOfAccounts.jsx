import { useState, useEffect } from 'react'
import { listChartOfAccounts, createChartOfAccount, updateChartOfAccount, deleteChartOfAccount } from '@/services/chartOfAccountsService'
import { toast } from '@/components/ui/use-toast'

export function useChartOfAccounts({ segmentId, pageSize = 20 } = {}) {
  const [chartOfAccounts, setChartOfAccounts] = useState([])
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
      
      const response = await listChartOfAccounts(params)
      const data = response.chartOfAccounts || response
      
      if (append) {
        setChartOfAccounts(prev => [...prev, ...data])
      } else {
        setChartOfAccounts(data)
      }
      
      setHasMore(data.length === pageSize)
      setPage(pageNum)
    } catch (err) {
      console.error('Erro ao carregar plano de contas:', err)
      toast({ 
        title: 'Erro', 
        description: 'Falha ao carregar plano de contas', 
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
      const account = await createChartOfAccount(payload)
      setChartOfAccounts((prev) => [...prev, account])
      toast({ 
        title: 'Sucesso', 
        description: 'Conta criada com sucesso' 
      })
      return account
    } catch (err) {
      console.error('Erro ao criar conta:', err)
      toast({ 
        title: 'Erro', 
        description: 'Falha ao criar conta', 
        variant: 'destructive' 
      })
      throw err
    }
  }

  const update = async (id, payload) => {
    try {
      const updated = await updateChartOfAccount(id, payload)
      setChartOfAccounts((prev) => prev.map((a) => (a.id === id ? updated : a)))
      toast({ 
        title: 'Sucesso', 
        description: 'Conta atualizada com sucesso' 
      })
      return updated
    } catch (err) {
      console.error('Erro ao atualizar conta:', err)
      toast({ 
        title: 'Erro', 
        description: 'Falha ao atualizar conta', 
        variant: 'destructive' 
      })
      throw err
    }
  }

  const remove = async (id) => {
    try {
      await deleteChartOfAccount(id)
      setChartOfAccounts((prev) => prev.filter((a) => a.id !== id))
      toast({ 
        title: 'Sucesso', 
        description: 'Conta excluída com sucesso', 
        variant: 'default' 
      })
    } catch (err) {
      console.error('Erro ao excluir conta:', err)
      toast({ 
        title: 'Erro', 
        description: 'Falha ao excluir conta', 
        variant: 'destructive' 
      })
      throw err
    }
  }

  useEffect(() => { 
    load() 
  }, [segmentId])

  return { 
    chartOfAccounts, 
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
