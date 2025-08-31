'use client';

import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
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
      const { data, error } = await supabase
        .from('partner_documents')
        .select('*')
        .eq('partner_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setDocuments(data || []);
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

      // Gerar nome único para o arquivo
      const fileExtension = file.name.split('.').pop();
      const fileName = `${customerPartnerId}_${documentType}_${Date.now()}.${fileExtension}`;
      const storagePath = `partner-documents/${customerPartnerId}/${fileName}`;

      // Upload para Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      setUploadState(prev => ({ ...prev, uploadProgress: 50 }));

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(storagePath);

      setUploadState(prev => ({ ...prev, uploadProgress: 75 }));

      // Salvar registro no banco
      const documentRecord: Omit<CustomerDocument, 'id' | 'created_at' | 'updated_at'> = {
        partner_id: customerPartnerId,
        document_type: documentType,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        storage_path: storagePath,
        url: urlData.publicUrl
      };

      const { data: dbData, error: dbError } = await supabase
        .from('partner_documents')
        .insert(documentRecord)
        .select()
        .single();

      if (dbError) throw dbError;

      setUploadState(prev => ({ ...prev, uploadProgress: 100 }));

      // Atualizar lista de documentos
      setDocuments(prev => [dbData, ...prev]);

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
      const document = documents.find(doc => doc.id === documentId);
      if (!document) return false;

      // Excluir arquivo do storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.storage_path]);

      if (storageError) {
        console.warn('Erro ao excluir arquivo do storage:', storageError);
      }

      // Excluir registro do banco
      const { error: dbError } = await supabase
        .from('partner_documents')
        .delete()
        .eq('id', documentId);

      if (dbError) throw dbError;

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
      const { data, error } = await supabase.storage
        .from('documents')
        .download(doc.storage_path);

      if (error) throw error;

      // Criar URL para download
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

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