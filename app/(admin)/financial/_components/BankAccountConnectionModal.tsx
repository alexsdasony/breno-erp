'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Link, Upload, Zap } from 'lucide-react';
import PluggyConnectButton from '@/components/pluggy/PluggyConnectButton';
import ManualBankStatementImport from './ManualBankStatementImport';

interface BankAccountConnectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (itemId?: string) => void;
  onError?: (error: Error) => void;
}

type ImportMethod = 'select' | 'open-finance' | 'manual';

/**
 * Modal para escolher o método de conexão/importação de conta bancária
 * 
 * Permite escolher entre:
 * 1. Open Finance (integrações como Pluggy)
 * 2. Importação Manual de extratos (CSV/XML)
 */
export default function BankAccountConnectionModal({
  open,
  onOpenChange,
  onSuccess,
  onError,
}: BankAccountConnectionModalProps) {
  const [importMethod, setImportMethod] = useState<ImportMethod>('select');
  const [pluggyItemId, setPluggyItemId] = useState<string | null>(null);

  // Alias JS components to any to avoid TS prop typing issues
  const DialogRoot = Dialog as any;
  const DialogC = DialogContent as any;
  const DialogH = DialogHeader as any;
  const DialogT = DialogTitle as any;
  const DialogD = DialogDescription as any;

  const handleClose = () => {
    setImportMethod('select');
    setPluggyItemId(null);
    onOpenChange(false);
  };

  const handlePluggySuccess = (itemId: string) => {
    setPluggyItemId(itemId);
    if (onSuccess) {
      onSuccess(itemId);
    }
    // Fechar modal após sucesso
    setTimeout(() => {
      handleClose();
    }, 1500);
  };

  const handleManualSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
    // Fechar modal após sucesso
    setTimeout(() => {
      handleClose();
    }, 1500);
  };

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogC className="sm:max-w-[600px]">
        <DialogH>
          <DialogT>Conectar Conta Bancária</DialogT>
          <DialogD>
            Escolha como deseja importar seus extratos bancários
          </DialogD>
        </DialogH>

        {importMethod === 'select' && (
          <div className="space-y-4 py-4">
            {/* Opção 1: Open Finance */}
            <div
              className="border rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors"
              onClick={() => setImportMethod('open-finance')}
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">
                    Importação via Open Finance
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Conecte suas contas bancárias automaticamente através de integrações seguras.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                      Pluggy
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Opção 2: Importação Manual */}
            <div
              className="border rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors"
              onClick={() => setImportMethod('manual')}
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-secondary rounded-lg">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">
                    Importação Manual de Extrato
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Faça upload de arquivos CSV ou XML com seus extratos bancários.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded">
                      CSV
                    </span>
                    <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded">
                      XML
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {importMethod === 'open-finance' && (
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">Integradoras disponíveis:</h3>
                <div className="space-y-2">
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">Pluggy</p>
                          <p className="text-sm text-muted-foreground">
                            Conecte suas contas bancárias de forma segura
                          </p>
                        </div>
                      </div>
                      <PluggyConnectButton
                        onSuccess={handlePluggySuccess}
                        onError={onError}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setImportMethod('select')}>
                Voltar
              </Button>
            </div>
          </div>
        )}

        {importMethod === 'manual' && (
          <div className="space-y-4 py-4">
            <ManualBankStatementImport
              onSuccess={handleManualSuccess}
              onError={onError}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setImportMethod('select')}>
                Voltar
              </Button>
            </div>
          </div>
        )}
      </DialogC>
    </DialogRoot>
  );
}
