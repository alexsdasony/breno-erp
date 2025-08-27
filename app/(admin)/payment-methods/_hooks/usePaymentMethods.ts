import { useCallback, useEffect, useState } from 'react'
import { toast } from '@/components/ui/use-toast'
import { listPaymentMethods, createPaymentMethod, updatePaymentMethod, deletePaymentMethod } from '@/services/paymentMethodsService'
import type { PaymentMethod, PaymentMethodPayload } from '@/types'

export type UsePaymentMethodsOptions = { pageSize?: number }
export type UsePaymentMethodsReturn = {
  methods: PaymentMethod[]
  loading: boolean
  hasMore: boolean
  page: number
  load: (pageNum?: number, append?: boolean) => Promise<void>
  loadMore: () => Promise<void>
  create: (payload: PaymentMethodPayload) => Promise<PaymentMethod | null>
  update: (id: string, payload: PaymentMethodPayload) => Promise<PaymentMethod | null>
  remove: (id: string) => Promise<void>
}

export function usePaymentMethods({ pageSize = 20 }: UsePaymentMethodsOptions = {}): UsePaymentMethodsReturn {
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)

  const load = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    setLoading(true)
    try {
      const params = { page: pageNum, limit: pageSize }
      const response = await listPaymentMethods(params)
      const data = response.data?.payment_methods || []

      setMethods((prev) => (append ? [...prev, ...data] : data))
      setHasMore(data.length === pageSize)
      setPage(pageNum)
    } catch (err) {
      console.error('Erro ao carregar formas de pagamento:', err)
      toast({ title: 'Erro', description: 'Falha ao carregar formas de pagamento', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [pageSize])

  const loadMore = useCallback(async () => {
    if (!loading && hasMore) {
      await load(page + 1, true)
    }
  }, [loading, hasMore, load, page])

  const create = useCallback(async (payload: PaymentMethodPayload) => {
    try {
      const response = await createPaymentMethod(payload)
      const method = response.data?.payment_method
      
      if (method) {
        setMethods((prev) => [...prev, method])
        toast({ title: 'Sucesso', description: 'Forma de pagamento criada com sucesso' })
        return method
      }
      
      toast({ title: 'Aviso', description: 'Forma de pagamento criada, mas não foi possível atualizar a lista' })
      return null
    } catch (err) {
      console.error('Erro ao criar forma de pagamento:', err)
      toast({ title: 'Erro', description: 'Falha ao criar forma de pagamento', variant: 'destructive' })
      throw err
    }
  }, [])

  const update = useCallback(async (id: string, payload: PaymentMethodPayload) => {
    try {
      const response = await updatePaymentMethod(id, payload)
      const updated = response.data?.payment_method
      
      if (updated) {
        setMethods((prev) => prev.map((m) => (m.id === id ? updated : m)))
        toast({ title: 'Sucesso', description: 'Forma de pagamento atualizada com sucesso' })
        return updated
      }
      
      toast({ title: 'Aviso', description: 'Forma de pagamento atualizada, mas não foi possível atualizar a lista' })
      return null
    } catch (err) {
      console.error('Erro ao atualizar forma de pagamento:', err)
      toast({ title: 'Erro', description: 'Falha ao atualizar forma de pagamento', variant: 'destructive' })
      throw err
    }
  }, [])

  const remove = useCallback(async (id: string) => {
    try {
      await deletePaymentMethod(id)
      setMethods((prev) => prev.filter((m) => m.id !== id))
      toast({ title: 'Sucesso', description: 'Forma de pagamento excluída com sucesso' })
    } catch (err) {
      console.error('Erro ao excluir forma de pagamento:', err)
      toast({ title: 'Erro', description: 'Falha ao excluir forma de pagamento', variant: 'destructive' })
      throw err
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { methods, loading, hasMore, page, load, loadMore, create, update, remove }
}
