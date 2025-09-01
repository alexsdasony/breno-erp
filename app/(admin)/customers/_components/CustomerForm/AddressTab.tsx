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
    <div className="space-y-8">
      {/* Localização */}
      <div className="border border-border/30 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-primary">Localização</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="zip_code">CEP</Label>
            <input
              id="zip_code"
              type="text"
              value={data.zip_code || ''}
              onChange={(e) => handleCepChange(e.target.value)}
              className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
              placeholder="00000-000"
              maxLength={9}
            />
            {isLoadingCep && (
              <div className="flex items-center gap-2 text-sm text-primary">
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Buscando endereço...
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">Estado</Label>
            <select
              id="state"
              value={data.state || ''}
              onChange={(e) => handleInputChange('state', e.target.value)}
              className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
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
              className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
              placeholder="Digite a cidade"
            />
          </div>
        </div>
      </div>

      {/* Detalhes do Endereço */}
      <div className="border border-border/30 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-secondary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-secondary-foreground">Detalhes do Endereço</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <Label htmlFor="address">Logradouro</Label>
            <input
              id="address"
              type="text"
              value={data.address || ''}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
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
              className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
              placeholder="Digite o bairro"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="numero">Número</Label>
            <input
              id="numero"
              type="text"
              value={data.numero || ''}
              onChange={(e) => handleInputChange('numero', e.target.value)}
              className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
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
              className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
              placeholder="Apto, sala, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo_imovel">Tipo de Imóvel</Label>
            <select
              id="tipo_imovel"
              value={data.tipo_imovel || ''}
              onChange={(e) => handleInputChange('tipo_imovel', e.target.value)}
              className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
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
    </div>
  );
};