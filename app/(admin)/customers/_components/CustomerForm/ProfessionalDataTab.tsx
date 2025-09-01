import React from 'react';
import { Label } from '@/components/ui/label';
import { CustomerTabProps } from '../../../../../src/types/CustomerForm';

export const ProfessionalDataTab: React.FC<CustomerTabProps> = ({ data, onChange }) => {
  const handleInputChange = (field: string, value: string) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-1">Dados Profissionais</h2>
        <p className="text-sm text-muted-foreground">Informações sobre atividade profissional e renda</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="profession">Profissão</Label>
            <input
              id="profession"
              type="text"
              value={data.profissao || ''}
              onChange={(e) => handleInputChange('profissao', e.target.value)}
              className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
              placeholder="Digite a profissão"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Empresa</Label>
            <input
              id="company"
              type="text"
              value={data.empresa || ''}
              onChange={(e) => handleInputChange('empresa', e.target.value)}
              className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
              placeholder="Digite o nome da empresa"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">Cargo</Label>
          <input
            id="position"
            type="text"
            value={data.cargo || ''}
            onChange={(e) => handleInputChange('cargo', e.target.value)}
            className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
            placeholder="Digite o cargo"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="workPhone">Telefone Comercial</Label>
          <input
            id="workPhone"
            type="tel"
            value={data.telefone_comercial || ''}
            onChange={(e) => handleInputChange('telefone_comercial', e.target.value)}
            className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
            placeholder="(11) 99999-9999"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="data_admissao">Data de Admissão</Label>
          <input
            id="data_admissao"
            type="date"
            value={data.data_admissao || ''}
            onChange={(e) => handleInputChange('data_admissao', e.target.value)}
            className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="observacoes_profissionais">Observações Profissionais</Label>
          <input
            id="observacoes_profissionais"
            type="text"
            value={data.observacoes || ''}
            onChange={(e) => handleInputChange('observacoes', e.target.value)}
            className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
            placeholder="Digite observações profissionais"
          />
        </div>
    </div>
  );
};