import React from 'react';
import { Label } from '@/components/ui/label';
import { CustomerTabProps, PREFERENCIA_CONTATO_OPTIONS, HORARIO_CONTATO_OPTIONS } from '../../../../../src/types/CustomerForm';

export const ContactDataTab: React.FC<CustomerTabProps> = ({ data, onChange }) => {
  const handleInputChange = (field: string, value: string) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  return (
    <div className="space-y-8">
      {/* Informações de Contato Principal */}
      <div className="border border-border/30 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-primary">Contato Principal</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <input
              id="email"
              type="email"
              value={data.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
              placeholder="Digite o e-mail"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="celular">Celular</Label>
            <input
              id="celular"
              type="tel"
              value={data.celular || ''}
              onChange={(e) => handleInputChange('celular', e.target.value)}
              className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
              placeholder="(11) 99999-9999"
            />
          </div>
        </div>
      </div>

      {/* Telefones Adicionais */}
      <div className="border border-border/30 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-secondary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-secondary-foreground">Telefones Adicionais</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone Residencial</Label>
            <input
              id="phone"
              type="tel"
              value={data.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-secondary/20 focus:border-secondary hover:border-secondary/50"
              placeholder="(11) 3333-3333"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone_comercial">Telefone Comercial</Label>
            <input
              id="telefone_comercial"
              type="tel"
              value={data.telefone_comercial || ''}
              onChange={(e) => handleInputChange('telefone_comercial', e.target.value)}
              className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-secondary/20 focus:border-secondary hover:border-secondary/50"
              placeholder="(11) 4444-4444"
            />
          </div>
        </div>
      </div>

      {/* Preferências de Contato */}
      <div className="border border-border/30 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-accent-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-accent-foreground">Preferências de Contato</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="preferencia_contato">Preferência de Contato</Label>
            <select
              id="preferencia_contato"
              value={data.preferencia_contato || ''}
              onChange={(e) => handleInputChange('preferencia_contato', e.target.value)}
              className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-accent/20 focus:border-accent hover:border-accent/50"
            >
              <option value="">Selecione uma opção</option>
              {PREFERENCIA_CONTATO_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="melhor_horario_contato">Melhor Horário para Contato</Label>
            <select
              id="melhor_horario_contato"
              value={data.melhor_horario_contato || ''}
              onChange={(e) => handleInputChange('melhor_horario_contato', e.target.value)}
              className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-accent/20 focus:border-accent hover:border-accent/50"
            >
              <option value="">Selecione um horário</option>
              {HORARIO_CONTATO_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};