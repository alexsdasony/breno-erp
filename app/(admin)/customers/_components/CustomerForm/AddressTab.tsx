import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { CustomerTabProps, TIPO_IMOVEL_OPTIONS } from '../../../../../src/types/CustomerForm';

export const AddressTab: React.FC<CustomerTabProps> = ({ data, onChange }) => {
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const handleCepChange = async (cep: string) => {
    handleInputChange('zip_code', cep);
    
    if (cep.replace(/\D/g, '').length === 8) {
      setIsLoadingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, '')}/json/`);
        const addressData = await response.json();
        
        if (!addressData.erro) {
          onChange({
            ...data,
            zip_code: cep,
            address: addressData.logradouro,
            bairro: addressData.bairro,
            city: addressData.localidade,
            state: addressData.uf
          });
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      } finally {
        setIsLoadingCep(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="zip_code">CEP</Label>
          <input
            id="zip_code"
            type="text"
            value={data.zip_code || ''}
            onChange={(e) => handleCepChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="00000-000"
            maxLength={9}
          />
          {isLoadingCep && (
            <span className="text-sm text-blue-600">Buscando endereço...</span>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">Estado</Label>
          <select
            id="state"
            value={data.state || ''}
            onChange={(e) => handleInputChange('state', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione o estado</option>
            <option value="AC">Acre</option>
            <option value="AL">Alagoas</option>
            <option value="AP">Amapá</option>
            <option value="AM">Amazonas</option>
            <option value="BA">Bahia</option>
            <option value="CE">Ceará</option>
            <option value="DF">Distrito Federal</option>
            <option value="ES">Espírito Santo</option>
            <option value="GO">Goiás</option>
            <option value="MA">Maranhão</option>
            <option value="MT">Mato Grosso</option>
            <option value="MS">Mato Grosso do Sul</option>
            <option value="MG">Minas Gerais</option>
            <option value="PA">Pará</option>
            <option value="PB">Paraíba</option>
            <option value="PR">Paraná</option>
            <option value="PE">Pernambuco</option>
            <option value="PI">Piauí</option>
            <option value="RJ">Rio de Janeiro</option>
            <option value="RN">Rio Grande do Norte</option>
            <option value="RS">Rio Grande do Sul</option>
            <option value="RO">Rondônia</option>
            <option value="RR">Roraima</option>
            <option value="SC">Santa Catarina</option>
            <option value="SP">São Paulo</option>
            <option value="SE">Sergipe</option>
            <option value="TO">Tocantins</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Cidade</Label>
          <input
            id="city"
            type="text"
            value={data.city || ''}
            onChange={(e) => handleInputChange('city', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Digite a cidade"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="address">Logradouro</Label>
          <input
            id="address"
            type="text"
            value={data.address || ''}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Digite o logradouro"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bairro">Bairro</Label>
          <input
            id="bairro"
            type="text"
            value={data.bairro || ''}
            onChange={(e) => handleInputChange('bairro', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Digite o bairro"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="numero">Número</Label>
          <input
            id="numero"
            type="text"
            value={data.numero || ''}
            onChange={(e) => handleInputChange('numero', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Digite o número"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="complemento">Complemento</Label>
          <input
            id="complemento"
            type="text"
            value={data.complemento || ''}
            onChange={(e) => handleInputChange('complemento', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Apto, sala, etc."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tipo_imovel">Tipo de Imóvel</Label>
          <select
            id="tipo_imovel"
            value={data.tipo_imovel || ''}
            onChange={(e) => handleInputChange('tipo_imovel', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione o tipo</option>
            {TIPO_IMOVEL_OPTIONS.map((option) => (
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