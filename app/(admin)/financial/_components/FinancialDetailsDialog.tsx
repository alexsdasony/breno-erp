"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doc: any | null;
  pmMap: Record<string, string>;
  onEdit: (e: React.MouseEvent) => void;
  currency: (n: number) => string;
};

export default function FinancialDetailsDialog({ open, onOpenChange, doc, pmMap, onEdit, currency }: Props) {
  // Alias JS components to any to avoid TS prop typing issues
  const DialogRoot = Dialog as any;
  const DialogC = DialogContent as any;
  const DialogH = DialogHeader as any;
  const DialogT = DialogTitle as any;
  const DialogD = DialogDescription as any;
  const typeLabel = (t?: string | null) => {
    switch (t) {
      case 'expense': return 'Despesa';
      case 'receipt': return 'Receita';
      case 'income': return 'Receita';
      case 'transfer': return 'Transferência';
      default: return '-';
    }
  };
  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogC className="max-w-xl">
        <DialogH>
          <DialogT>Detalhes do Documento</DialogT>
          <DialogD>Informações completas do registro financeiro</DialogD>
        </DialogH>
        {doc && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-muted-foreground">Tipo</div>
                <div className="text-sm font-medium">{typeLabel(doc.type)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Status</div>
                <div className="text-sm font-medium">{doc.status || '-'}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Data</div>
                <div className="text-sm font-medium">{doc.date || '-'}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Vencimento</div>
                <div className="text-sm font-medium">{doc.due_date || '-'}</div>
              </div>
              <div className="col-span-2">
                <div className="text-xs text-muted-foreground">Parceiro</div>
                <div className="text-sm font-medium">{doc.partner_name || doc.partner_id || '-'}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Método</div>
                <div className="text-sm font-medium">{doc.payment_method_id ? (pmMap[doc.payment_method_id] || doc.payment_method_id) : '-'}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Valor</div>
                <div className="text-sm font-semibold">{currency(Number(doc.amount || 0))}</div>
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Descrição</div>
              <div className="text-sm whitespace-pre-wrap">{doc.description || '—'}</div>
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button className="px-3 py-2 rounded-md border border-white/10" onClick={() => onOpenChange(false)}>Fechar</button>
              <button className="px-3 py-2 rounded-md bg-primary text-primary-foreground" onClick={onEdit}>Editar</button>
            </div>
          </div>
        )}
      </DialogC>
    </DialogRoot>
  );
}
