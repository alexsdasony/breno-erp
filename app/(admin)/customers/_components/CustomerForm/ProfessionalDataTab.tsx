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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="profession">Profissão</Label>
          <input
            id="profession"
            type="text"
            value={data.profissao || ''}
            onChange={(e) => handleInputChange('profissao', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Digite o nome da empresa"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="position">Cargo</Label>
          <input
            id="position"
            type="text"
            value={data.cargo || ''}
            onChange={(e) => handleInputChange('cargo', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="(11) 99999-9999"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="data_admissao">Data de Admissão</Label>
          <input
            id="data_admissao"
            type="date"
            value={data.data_admissao || ''}
            onChange={(e) => handleInputChange('data_admissao', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="observacoes_profissionais">Observações Profissionais</Label>
          <input
            id="observacoes_profissionais"
            type="text"
            value={data.observacoes || ''}
            onChange={(e) => handleInputChange('observacoes', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Digite observações profissionais"
          />
        </div>
      </div>


    </div>
  );
};