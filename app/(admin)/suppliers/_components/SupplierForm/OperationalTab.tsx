'use client';

import { Label } from '@/components/ui/label';

interface OperationalTabProps {
  data: any;
  onChange: (data: any) => void;
  validation: any;
}

export function OperationalTab({ data, onChange, validation }: OperationalTabProps) {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-1">Dados Operacionais</h2>
        <p className="text-sm text-muted-foreground">Status, datas e observações do fornecedor</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="status" className="flex items-center gap-1">
            Status
            <span className="text-destructive">*</span>
          </Label>
          <select
            id="status"
            value={data.status}
            onChange={(e) => onChange({ status: e.target.value as 'ativo' | 'inativo' })}
            className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
          >
            <option value="ATIVO">Ativo</option>
            <option value="INATIVO">Inativo</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="data_cadastro">Data de Cadastro</Label>
          <input
            id="data_cadastro"
            type="date"
            value={data.data_cadastro}
            onChange={(e) => onChange({ data_cadastro: e.target.value })}
            className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
          />
        </div>

        <div className="space-y-2 lg:col-span-2">
          <Label htmlFor="observacoes">Observações</Label>
          <textarea
            id="observacoes"
            value={data.observacoes || ''}
            onChange={(e) => onChange({ observacoes: e.target.value })}
            placeholder="Digite observações adicionais sobre o fornecedor..."
            rows={4}
            className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50 resize-none"
          />
        </div>
      </div>

      {/* Resumo das informações */}
      <div className="bg-muted/30 rounded-lg p-4 border border-border/30">
        <h3 className="text-sm font-semibold text-foreground mb-3">Resumo das Informações</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Tipo:</span>
            <span className="ml-2 font-medium text-foreground">
              {data.tipo_contribuinte === 'PF' ? 'Pessoa Física' : 
               data.tipo_contribuinte === 'PJ' ? 'Pessoa Jurídica' : 
               data.tipo_contribuinte === 'MEI' ? 'MEI' : 'Outros'}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Status:</span>
            <span className={`ml-2 font-medium px-2 py-1 rounded-full text-xs ${
              data.status === 'ativo' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {data.status === 'ativo' ? 'Ativo' : 'Inativo'}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Segmento:</span>
            <span className="ml-2 font-medium text-foreground">
              {data.segment_id ? 'Selecionado' : 'Não selecionado'}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Contato:</span>
            <span className="ml-2 font-medium text-foreground">
              {data.pessoa_contato || 'Não informado'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
