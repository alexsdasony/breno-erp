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
    <div className="space-y-6">
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

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone Residencial</Label>
          <input
            id="phone"
            type="tel"
            value={data.phone || ''}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
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
            className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
            placeholder="(11) 4444-4444"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferencia_contato">Preferência de Contato</Label>
          <select
            id="preferencia_contato"
            value={data.preferencia_contato || ''}
            onChange={(e) => handleInputChange('preferencia_contato', e.target.value)}
            className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
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
            className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
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
  );
};