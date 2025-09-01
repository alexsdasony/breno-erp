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
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-1">Patrimônio</h2>
        <p className="text-sm text-muted-foreground">Declaração de bens e informações patrimoniais</p>
      </div>
      
      <div className="flex items-center space-x-3">
        <input
          id="possui_patrimonio"
          type="checkbox"
          checked={data.possui_patrimonio || false}
          onChange={(e) => handleInputChange('possui_patrimonio', e.target.checked)}
          className="h-5 w-5 text-primary focus:ring-2 focus:ring-primary/20 border-2 border-primary/30 rounded transition-colors"
        />
        <Label htmlFor="possui_patrimonio" className="text-base font-medium text-primary cursor-pointer">
          Cliente possui patrimônio declarado
        </Label>
      </div>

      {data.possui_patrimonio && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="valor_patrimonio">Valor do Patrimônio</Label>
              <input
                id="valor_patrimonio"
                type="text"
                value={data.valor_patrimonio ? formatCurrency(data.valor_patrimonio.toString()) : ''}
                onChange={(e) => handleCurrencyChange('valor_patrimonio', e.target.value)}
                className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
                placeholder="R$ 0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_patrimonio">Tipo de Patrimônio</Label>
              <select
                id="tipo_patrimonio"
                className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
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
              className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
              placeholder="Descreva detalhadamente o patrimônio (ex: Casa própria na Rua X, Veículo modelo Y ano Z, etc.)"
            />
          </div>

          <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="font-medium text-primary">Informações Importantes</h4>
            </div>
            <ul className="text-sm text-primary/80 space-y-1 ml-6">
              <li>• Declare apenas patrimônio comprovável</li>
              <li>• Mantenha a documentação atualizada</li>
              <li>• Valores serão utilizados para análise de crédito</li>
              <li>• Informações falsas podem resultar em cancelamento</li>
            </ul>
          </div>
        </div>
      )}

      {!data.possui_patrimonio && (
        <div className="border border-border/30 rounded-lg p-8 text-center bg-muted/20">
          <div className="text-muted-foreground mb-4">
            <svg className="mx-auto h-16 w-16 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 11h6" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-muted-foreground mb-2">Nenhum Patrimônio Declarado</h4>
          <p className="text-muted-foreground/80">
            Marque a opção acima se o cliente possuir patrimônio a ser declarado
          </p>
        </div>
      )}
    </div>
  );
};