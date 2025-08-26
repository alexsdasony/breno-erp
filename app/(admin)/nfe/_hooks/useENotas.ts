import { useState, useCallback } from 'react'
import { toast } from '@/components/ui/use-toast'
import { enotasService, ENotasNFe, ENotasResponse } from '@/services/enotasService'

export interface UseENotasReturn {
  loading: boolean
  emitindo: boolean
  consultando: boolean
  cancelando: boolean
  emitirNFe: (nfe: ENotasNFe) => Promise<ENotasResponse | null>
  consultarNFe: (id: string) => Promise<ENotasResponse | null>
  cancelarNFe: (id: string, motivo: string) => Promise<ENotasResponse | null>
  baixarXML: (id: string, filename?: string) => Promise<void>
  baixarDANFE: (id: string, filename?: string) => Promise<void>
}

export const useENotas = (): UseENotasReturn => {
  const [loading, setLoading] = useState(false)
  const [emitindo, setEmitindo] = useState(false)
  const [consultando, setConsultando] = useState(false)
  const [cancelando, setCancelando] = useState(false)

  const emitirNFe = useCallback(async (nfe: ENotasNFe): Promise<ENotasResponse | null> => {
    setEmitindo(true)
    setLoading(true)
    
    try {
      const response = await enotasService.emitirNFe(nfe)
      
      toast({
        title: 'NFe emitida com sucesso!',
        description: `Número: ${response.numero} | Chave: ${response.chave_acesso}`
      })
      
      return response
    } catch (error) {
      console.error('Erro ao emitir NFe:', error)
      toast({
        title: 'Erro ao emitir NFe',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      })
      return null
    } finally {
      setEmitindo(false)
      setLoading(false)
    }
  }, [])

  const consultarNFe = useCallback(async (id: string): Promise<ENotasResponse | null> => {
    setConsultando(true)
    setLoading(true)
    
    try {
      const response = await enotasService.consultarNFe(id)
      
      toast({
        title: 'NFe consultada com sucesso!',
        description: `Status: ${response.status}`
      })
      
      return response
    } catch (error) {
      console.error('Erro ao consultar NFe:', error)
      toast({
        title: 'Erro ao consultar NFe',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      })
      return null
    } finally {
      setConsultando(false)
      setLoading(false)
    }
  }, [])

  const cancelarNFe = useCallback(async (id: string, motivo: string): Promise<ENotasResponse | null> => {
    setCancelando(true)
    setLoading(true)
    
    try {
      const response = await enotasService.cancelarNFe(id, motivo)
      
      toast({
        title: 'NFe cancelada com sucesso!',
        description: `Motivo: ${motivo}`
      })
      
      return response
    } catch (error) {
      console.error('Erro ao cancelar NFe:', error)
      toast({
        title: 'Erro ao cancelar NFe',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      })
      return null
    } finally {
      setCancelando(false)
      setLoading(false)
    }
  }, [])

  const baixarXML = useCallback(async (id: string, filename?: string): Promise<void> => {
    setLoading(true)
    
    try {
      const blob = await enotasService.baixarXML(id)
      
      // Criar URL temporária para download
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename || `nfe-${id}.xml`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast({
        title: 'XML baixado com sucesso!'
      })
    } catch (error) {
      console.error('Erro ao baixar XML:', error)
      toast({
        title: 'Erro ao baixar XML',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const baixarDANFE = useCallback(async (id: string, filename?: string): Promise<void> => {
    setLoading(true)
    
    try {
      const blob = await enotasService.baixarDANFE(id)
      
      // Criar URL temporária para download
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename || `danfe-${id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast({
        title: 'DANFE baixado com sucesso!'
      })
    } catch (error) {
      console.error('Erro ao baixar DANFE:', error)
      toast({
        title: 'Erro ao baixar DANFE',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    emitindo,
    consultando,
    cancelando,
    emitirNFe,
    consultarNFe,
    cancelarNFe,
    baixarXML,
    baixarDANFE
  }
}

export default useENotas