import { useCallback, useEffect, useState } from 'react'
import { toast } from '@/components/ui/use-toast'
import { listNFes, createNFe, updateNFe, deleteNFe } from '@/services/nfeService'
import type { NFe, NFePayload } from '@/types'

export type UseNFeOptions = {
  pageSize?: number
  segmentId?: string | number | null
}

export type UseNFeReturn = {
  nfes: NFe[]
  loading: boolean
  hasMore: boolean
  page: number
  load: (pageNum?: number, append?: boolean) => Promise<void>
  loadMore: () => Promise<void>
  create: (payload: NFePayload) => Promise<NFe | null>
  update: (id: string, payload: NFePayload) => Promise<NFe | null>
  remove: (id: string) => Promise<boolean>
}

export function useNFe({ pageSize = 20, segmentId = null }: UseNFeOptions = {}): UseNFeReturn {
  const [nfes, setNfes] = useState<NFe[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)

  const load = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    setLoading(true)
    try {
      const params: Record<string, any> = { page: pageNum, limit: pageSize }
      if (segmentId) params.segment_id = segmentId

      const data: NFe[] = await listNFes(params)
      setNfes((prev) => (append ? [...prev, ...data] : data))
      setHasMore(data.length === pageSize)
      setPage(pageNum)
    } catch (err) {
      console.error('Erro ao carregar NF-e:', err)
      toast({ title: 'Erro', description: 'Falha ao carregar NF-e', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [pageSize, segmentId])

  const loadMore = useCallback(async () => {
    if (!loading && hasMore) {
      await load(page + 1, true)
    }
  }, [loading, hasMore, load, page])

  const create = useCallback(async (payload: NFePayload) => {
    try {
      const nfe = await createNFe(payload)
      setNfes((prev) => [...prev, nfe])
      toast({ title: 'NF-e criada', description: nfe.invoiceNumber || 'Registro criado.' })
      return nfe
    } catch (err) {
      console.error('Erro ao criar NF-e:', err)
      toast({ title: 'Erro ao criar NF-e', description: 'Verifique os dados informados.', variant: 'destructive' })
      return null
    }
  }, [])

  const update = useCallback(async (id: string, payload: NFePayload) => {
    try {
      const updated = await updateNFe(id, payload)
      setNfes((prev) => prev.map((item) => (item.id === id ? updated : item)))
      toast({ title: 'NF-e atualizada', description: updated.invoiceNumber || 'Registro atualizado.' })
      return updated
    } catch (err) {
      console.error('Erro ao atualizar NF-e:', err)
      toast({ title: 'Erro ao atualizar NF-e', description: 'Tente novamente.', variant: 'destructive' })
      return null
    }
  }, [])

  const remove = useCallback(async (id: string) => {
    try {
      await deleteNFe(id)
      setNfes((prev) => prev.filter((item) => item.id !== id))
      toast({ title: 'NF-e removida', description: 'Registro excluído com sucesso.' })
      return true
    } catch (err) {
      console.error('Erro ao excluir NF-e:', err)
      toast({ title: 'Erro ao remover NF-e', description: 'Tente novamente.', variant: 'destructive' })
      return false
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { nfes, loading, hasMore, page, load, loadMore, create, update, remove }
}
