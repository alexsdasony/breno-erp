"use client";

import React from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type Segment = { id: string; name?: string; code?: string };

type Props = {
  dateStart: string;
  setDateStart: (v: string) => void;
  dateEnd: string;
  setDateEnd: (v: string) => void;
  type: string;
  setType: (v: string) => void;
  status: string;
  setStatus: (v: string) => void;
  segment: string;
  setSegment: (v: string) => void;
  partner: string;
  setPartner: (v: string) => void;
  segments: Segment[];
  filterSearchRef: React.RefObject<HTMLInputElement>;
  onClearFilters?: () => void;
};

// Função para aplicar máscara de data
function applyDateMask(value: string): string {
  // Remove tudo que não é dígito
  const digits = value.replace(/\D/g, '');
  
  // Aplica máscara: DD/MM/AAAA
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return digits.substring(0, 2) + '/' + digits.substring(2);
  return digits.substring(0, 2) + '/' + digits.substring(2, 4) + '/' + digits.substring(4, 8);
}

export default function FinancialFilters({
  dateStart, setDateStart,
  dateEnd, setDateEnd,
  type, setType,
  status, setStatus,
  segment, setSegment,
  partner, setPartner,
  segments,
  filterSearchRef,
  onClearFilters,
}: Props) {
  return (
    <div className="glass-effect rounded-xl p-4 border">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        <div className="md:col-span-3">
          <label className="block text-sm mb-1">Cliente/Fornecedor</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input ref={filterSearchRef} className="pl-9 pr-3 py-2 w-full bg-muted border rounded-lg" value={partner} onChange={(e) => setPartner(e.target.value)} placeholder="Nome ou ID" />
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Data Inicial</label>
          <input 
            type="text" 
            className="w-full bg-muted border rounded-lg p-2" 
            value={dateStart} 
            onChange={(e) => {
              const masked = applyDateMask(e.target.value);
              setDateStart(masked);
            }}
            placeholder="DD/MM/AAAA"
            maxLength={10}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Data Final</label>
          <input 
            type="text" 
            className="w-full bg-muted border rounded-lg p-2" 
            value={dateEnd} 
            onChange={(e) => {
              const masked = applyDateMask(e.target.value);
              setDateEnd(masked);
            }}
            placeholder="DD/MM/AAAA"
            maxLength={10}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Tipo</label>
          <select className="w-full bg-muted border rounded-lg p-2" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Todos</option>
            <option value="receivable">Contas a Receber</option>
            <option value="payable">Contas a Pagar</option>
          </select>
        </div>
        <div className="md:col-span-1">
          <label className="block text-sm mb-1">Status</label>
          <select className="w-full bg-muted border rounded-lg p-2" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Todos</option>
            <option value="draft">Rascunho</option>
            <option value="open">Aberto</option>
            <option value="partially_paid">Parcialmente Pago</option>
            <option value="paid">Pago</option>
            <option value="canceled">Cancelado</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Segmento</label>
          <select className="w-full bg-muted border rounded-lg p-2" value={segment} onChange={(e) => setSegment(e.target.value)}>
            <option value="">Todos os Segmentos</option>
            {Array.isArray(segments) && segments.map((s) => (
              <option key={s.id} value={s.id}>{s.code ? `${s.code} - ` : ''}{s.name || s.id}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-1 flex items-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClearFilters}
            className="w-full"
          >
            <X className="w-4 h-4 mr-1" />
            Limpar
          </Button>
        </div>
      </div>
    </div>
  );
}
