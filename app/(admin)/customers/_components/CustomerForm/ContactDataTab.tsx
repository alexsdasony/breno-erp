import React from 'react';
import { Label } from '@/components/ui/label';
import { CustomerTabProps } from '../../../../../src/types/CustomerForm';

export const ContactDataTab: React.FC<CustomerTabProps> = ({ data, onChange }) => {
  const handleInputChange = (field: string, value: string) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <input
            id="email"
            type="email"
            value={data.email || ''}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Digite o e-mail"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone Residencial</Label>
          <input
            id="phone"
            type="tel"
            value={data.phone || ''}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="(11) 3333-3333"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="celular">Celular</Label>
          <input
            id="celular"
            type="tel"
            value={data.celular || ''}
            onChange={(e) => handleInputChange('celular', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="(11) 99999-9999"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefone_comercial">Telefone Comercial</Label>
          <input
            id="telefone_comercial"
            type="tel"
            value={data.telefone_comercial || ''}
            onChange={(e) => handleInputChange('telefone_comercial', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="(11) 4444-4444"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Preferência de Contato</Label>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="preferencia_contato"
              value="email"
              className="text-blue-600"
            />
            <span>E-mail</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="preferencia_contato"
              value="telefone"
              className="text-blue-600"
            />
            <span>Telefone</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="preferencia_contato"
              value="celular"
              className="text-blue-600"
            />
            <span>Celular</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="preferencia_contato"
              value="whatsapp"
              className="text-blue-600"
            />
            <span>WhatsApp</span>
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Melhor Horário para Contato</Label>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="text-blue-600"
            />
            <span>Manhã (8h-12h)</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="text-blue-600"
            />
            <span>Tarde (12h-18h)</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="text-blue-600"
            />
            <span>Noite (18h-22h)</span>
          </label>
        </div>
      </div>
    </div>
  );
};