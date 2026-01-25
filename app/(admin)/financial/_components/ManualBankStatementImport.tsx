'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAppData } from '@/hooks/useAppData';
import apiService from '@/services/api';
import { listSegments } from '@/services/segmentsService';
import type { Segment } from '@/services/segmentsService';

interface ManualBankStatementImportProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Componente para importação manual de extratos bancários (CSV/XML/OFX/QIF) — via sistema.
 * O usuário escolhe o arquivo, o segmento (opcional) e envia para o menu financeiro.
 */
export default function ManualBankStatementImport({
  onSuccess,
  onError,
}: ManualBankStatementImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [segmentsLoading, setSegmentsLoading] = useState(true);
  const [segmentId, setSegmentId] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currentUser } = useAppData();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setSegmentsLoading(true);
      try {
        const res = await listSegments({ pageSize: 200 });
        const list = res?.data?.segments ?? [];
        if (!cancelled) setSegments(list);
      } catch (e) {
        if (!cancelled) setSegments([]);
      } finally {
        if (!cancelled) setSegmentsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const defaultSegmentSet = useRef(false);
  useEffect(() => {
    if (defaultSegmentSet.current) return;
    if (currentUser?.segment_id && segments.length > 0) {
      setSegmentId(currentUser.segment_id);
      defaultSegmentSet.current = true;
    }
  }, [currentUser?.segment_id, segments.length]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Validar tipo de arquivo - suporta CSV, XML/OFX, QIF
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'text/xml',
      'application/xml',
      'application/xml;charset=utf-8',
      'application/ofx',
      'application/x-ofx',
      'text/plain',
    ];
    
    const isValidType = 
      validTypes.includes(selectedFile.type) ||
      selectedFile.name.toLowerCase().endsWith('.csv') ||
      selectedFile.name.toLowerCase().endsWith('.xml') ||
      selectedFile.name.toLowerCase().endsWith('.ofx') ||
      selectedFile.name.toLowerCase().endsWith('.qif');

    if (!isValidType) {
      toast({
        title: 'Arquivo inválido',
        description: 'Por favor, selecione um arquivo CSV, XML/OFX ou QIF.',
        variant: 'destructive',
      });
      return;
    }

      // Validar tamanho (máximo 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: 'Arquivo muito grande',
          description: 'O arquivo deve ter no máximo 10MB.',
          variant: 'destructive',
        });
        return;
      }

      // Validar tamanho mínimo (arquivo muito pequeno pode estar vazio)
      if (selectedFile.size < 50) {
        toast({
          title: 'Arquivo muito pequeno',
          description: 'O arquivo parece estar vazio ou corrompido.',
          variant: 'destructive',
        });
        return;
      }

    setFile(selectedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: 'Nenhum arquivo selecionado',
        description: 'Por favor, selecione um arquivo para importar.',
        variant: 'destructive',
      });
      return;
    }

    if (!currentUser) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado para importar extratos.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('segmentId', segmentId && segmentId !== 'none' ? segmentId : '');

      const token = apiService.getToken();
      const headers: HeadersInit = {};
      if (token) headers['X-User-Token'] = token;
      // Não definir Content-Type: o browser define multipart/form-data; boundary=... ao usar FormData

      const response = await fetch('/api/financial-documents/import', {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMessage = data?.error || data?.details || 'Erro ao importar extrato';
        throw new Error(errorMessage);
      }

      const imported = data.imported ?? 0;
      const dupDb = data.duplicatesInDatabase ?? 0;
      const dupFile = data.duplicatesInFile ?? 0;
      let description = `${imported} registro(s) importado(s) com sucesso.`;
      if (dupDb > 0 || dupFile > 0) {
        description += ` ${dupDb} duplicado(s) no banco, ${dupFile} no arquivo ignorado(s).`;
      }

      toast({
        title: 'Importação concluída',
        description,
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('❌ Erro ao importar extrato:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Erro desconhecido ao importar extrato';
      
      toast({
        title: 'Erro na importação',
        description: errorMessage,
        variant: 'destructive',
      });

      if (onError) {
        onError(error instanceof Error ? error : new Error(errorMessage));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold mb-2">Importação via sistema</h3>
        <p className="text-sm text-muted-foreground mb-2">
          Formatos suportados: CSV, XML/OFX, QIF (máximo 10MB)
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          Compatível com extratos de: Banco do Brasil, Bradesco, Itaú, Santander, Caixa, Nubank, Inter e outros bancos brasileiros.
        </p>

        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">Segmento (opcional)</label>
          <select
            value={segmentId || 'none'}
            onChange={(e) => setSegmentId(e.target.value === 'none' ? '' : e.target.value)}
            disabled={segmentsLoading}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="none">Sem segmento</option>
            {segments.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {segmentsLoading && (
            <p className="text-xs text-muted-foreground mt-1">Carregando segmentos...</p>
          )}
        </div>

        <label className="text-sm font-medium mb-2 block">Arquivo do extrato</label>
        {!file ? (
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-accent transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm font-medium mb-2">
              Clique para selecionar ou arraste o arquivo aqui
            </p>
            <p className="text-xs text-muted-foreground">
              CSV ou XML (máx. 10MB)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xml,.ofx,.qif,text/csv,application/xml,text/xml,application/ofx,application/x-ofx"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                disabled={loading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button
          onClick={handleUpload}
          disabled={!file || loading}
          className="gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Importando...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Importar Extrato
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
