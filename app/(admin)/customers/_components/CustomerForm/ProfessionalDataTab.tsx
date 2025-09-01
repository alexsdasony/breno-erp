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
    <div className="space-y-8">
      {/* Informações Profissionais */}
      <div className="border border-border/30 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m-8 0V6a2 2 0 00-2 2v6" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-primary">Informações Profissionais</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
        </div>
      </div>

      {/* Detalhes Adicionais */}
      <div className="border border-border/30 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-secondary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-secondary-foreground">Detalhes Adicionais</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
      </div>


    </div>
  );
};