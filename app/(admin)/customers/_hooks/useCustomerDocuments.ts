'use client';

import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { getCustomerDocuments, uploadCustomerDocument, deleteCustomerDocument, updateCustomerDocument } from '@/services/customerDocumentsService';
import type { CustomerDocument, DocumentType } from '../../../../src/types/CustomerForm';

interface DocumentUploadState {
  isUploading: boolean;
  uploadProgress: number;
}

export function useCustomerDocuments(partnerId?: string) {
  const [documents, setDocuments] = useState<CustomerDocument[]>([]);
  const [uploadState, setUploadState] = useState<DocumentUploadState>({
    isUploading: false,
    uploadProgress: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  // Carregar documentos do cliente
  const loadDocuments = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const response = await getCustomerDocuments(id);
      const data = response.data?.documents || [];

      setDocuments(data);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
      toast({ 
        title: 'Erro', 
        description: 'Erro ao carregar documentos do cliente', 
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Upload de documento
  const uploadDocument = useCallback(async (
    file: File, 
    documentType: DocumentType,
    customerPartnerId: string
  ): Promise<boolean> => {
    setUploadState({ isUploading: true, uploadProgress: 0 });

    try {
      // Validar arquivo
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast({ 
          title: 'Erro', 
          description: 'Arquivo muito grande. Máximo 10MB.', 
          variant: 'destructive' 
        });
        return false;
      }

      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (!allowedTypes.includes(file.type)) {
        toast({ 
          title: 'Erro', 
          description: 'Tipo de arquivo não permitido. Use JPG, PNG, GIF, WebP, PDF ou DOC.', 
          variant: 'destructive' 
        });
        return false;
      }

      // Upload usando o serviço
      const response = await uploadCustomerDocument(
        customerPartnerId,
        file,
        documentType,
        (progress) => {
          setUploadState(prev => ({ ...prev, uploadProgress: progress }));
        }
      );

      const newDocument = response.data?.document;
      if (newDocument) {
        // Atualizar lista de documentos
        setDocuments(prev => [newDocument, ...prev]);
      }

      toast({ 
        title: 'Sucesso', 
        description: 'Documento enviado com sucesso!' 
      });

      return true;
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({ 
        title: 'Erro', 
        description: 'Erro ao enviar documento', 
        variant: 'destructive' 
      });
      return false;
    } finally {
      setUploadState({ isUploading: false, uploadProgress: 0 });
    }
  }, []);

  // Excluir documento
  const deleteDocument = useCallback(async (documentId: string): Promise<boolean> => {
    try {
      await deleteCustomerDocument(documentId);

      // Atualizar lista de documentos
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));

      toast({ 
        title: 'Sucesso', 
        description: 'Documento excluído com sucesso!' 
      });

      return true;
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
      toast({ 
        title: 'Erro', 
        description: 'Erro ao excluir documento', 
        variant: 'destructive' 
      });
      return false;
    }
  }, [documents]);

  // Download de documento
  const downloadDocument = useCallback(async (doc: CustomerDocument) => {
    try {
      if (!doc.url) {
        throw new Error('URL do documento não encontrada');
      }

      // Usar a URL pública do documento para download
      const link = document.createElement('a');
      link.href = doc.url;
      link.download = doc.file_name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({ 
        title: 'Sucesso', 
        description: 'Download iniciado!' 
      });
    } catch (error) {
      console.error('Erro ao fazer download:', error);
      toast({ 
        title: 'Erro', 
        description: 'Erro ao fazer download do documento', 
        variant: 'destructive' 
      });
    }
  }, []);

  return {
    documents,
    isLoading,
    uploadState,
    loadDocuments,
    uploadDocument,
    deleteDocument,
    downloadDocument
  };
}