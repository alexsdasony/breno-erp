import React from 'react';
import { Label } from '@/components/ui/label';
import { CustomerTabProps } from '../../../../../src/types/CustomerForm';

export const PatrimonyTab: React.FC<CustomerTabProps> = ({ data, onChange }) => {
  const handleInputChange = (field: string, value: string | boolean | number) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    const formattedValue = (parseInt(numericValue) / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
    return formattedValue;
  };

  const handleCurrencyChange = (field: string, value: string) => {
    const numericValue = value.replace(/\D/g, '');
    const finalValue = parseInt(numericValue) / 100;
    handleInputChange(field, finalValue);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <input
            id="possui_patrimonio"
            type="checkbox"
            checked={data.possui_patrimonio || false}
            onChange={(e) => handleInputChange('possui_patrimonio', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <Label htmlFor="possui_patrimonio" className="text-base font-medium">
            Cliente possui patrimônio declarado
          </Label>
        </div>

        {data.possui_patrimonio && (
          <div className="space-y-4 pl-7 border-l-2 border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valor_patrimonio">Valor do Patrimônio</Label>
                <input
                  id="valor_patrimonio"
                  type="text"
                  value={data.valor_patrimonio ? formatCurrency(data.valor_patrimonio.toString()) : ''}
                  onChange={(e) => handleCurrencyChange('valor_patrimonio', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="R$ 0,00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo_patrimonio">Tipo de Patrimônio</Label>
                <select
                  id="tipo_patrimonio"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione o tipo</option>
                  <option value="imovel">Imóvel</option>
                  <option value="veiculo">Veículo</option>
                  <option value="investimentos">Investimentos</option>
                  <option value="poupanca">Poupança</option>
                  <option value="conta_corrente">Conta Corrente</option>
                  <option value="aplicacoes">Aplicações Financeiras</option>
                  <option value="acoes">Ações</option>
                  <option value="fundos">Fundos de Investimento</option>
                  <option value="previdencia">Previdência Privada</option>
                  <option value="outros">Outros</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao_patrimonio">Descrição do Patrimônio</Label>
              <textarea
                id="descricao_patrimonio"
                value={data.descricao_patrimonio || ''}
                onChange={(e) => handleInputChange('descricao_patrimonio', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descreva detalhadamente o patrimônio (ex: Casa própria na Rua X, Veículo modelo Y ano Z, etc.)"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-md">
              <h4 className="font-medium text-blue-900 mb-2">Informações Importantes</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Declare apenas patrimônio comprovável</li>
                <li>• Mantenha a documentação atualizada</li>
                <li>• Valores serão utilizados para análise de crédito</li>
                <li>• Informações falsas podem resultar em cancelamento</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {!data.possui_patrimonio && (
        <div className="bg-gray-50 p-6 rounded-md text-center">
          <div className="text-gray-500 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 11h6" />
            </svg>
          </div>
          <p className="text-gray-600">
            Marque a opção acima se o cliente possuir patrimônio a ser declarado
          </p>
        </div>
      )}
    </div>
  );
};