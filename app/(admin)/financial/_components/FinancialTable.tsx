"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Eye, Trash2 } from 'lucide-react';

export type FinancialDoc = any;

type Props = {
  items: FinancialDoc[];
  currency: (n: number) => string;
  pmMap: Record<string, string>;
  onDetails: (doc: FinancialDoc) => void;
  onEdit: (doc: FinancialDoc, e: React.MouseEvent) => void;
  onAskDelete: (id: string) => void;
};

export default function FinancialTable({ items, currency, pmMap, onDetails, onEdit, onAskDelete }: Props) {
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
    <div className="glass-effect rounded-xl p-0 border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 border-b">
            <tr>
              <th className="text-left p-3">Data</th>
              <th className="text-left p-3">Vencimento</th>
              <th className="text-left p-3">Tipo</th>
              <th className="text-left p-3">Parceiro</th>
              <th className="text-right p-3">Valor</th>
              <th className="text-left p-3">Método</th>
              <th className="text-left p-3">Status</th>
              <th className="text-center p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((d) => (
              <tr key={d.id} className="border-b border-border hover:bg-muted/30">
                <td className="p-3">{d.issue_date || '-'}</td>
                <td className="p-3">{d.due_date || '-'}</td>
                <td className="p-3">{typeLabel(d.document_type)}</td>
                <td className="p-3">{d.entity_id ? (d.entity_name || d.entity_id) : '-'}</td>
                <td className="p-3 text-right">{currency(Number(d.amount || 0))}</td>
                <td className="p-3">{d.payment_method ? (pmMap[d.payment_method] || d.payment_method) : '-'}</td>
                <td className="p-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    d.status === 'paid' ? 'bg-green-500/20 text-green-400' : d.status === 'canceled' ? 'bg-gray-500/20 text-gray-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {d.status === 'paid' ? 'Pago' : d.status === 'canceled' ? 'Cancelado' : 'Pendente'}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <div className="flex justify-center gap-1">
                    <Button variant="ghost" size="sm" title="Ver detalhes" onClick={() => onDetails(d)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="Editar" onClick={(e) => onEdit(d, e)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" title="Excluir" onClick={() => onAskDelete(d.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-muted-foreground">Nenhum documento encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}