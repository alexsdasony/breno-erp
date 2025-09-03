'use client';

import { Label } from '@/components/ui/label';

interface LocationTabProps {
  data: any;
  onChange: (data: any) => void;
  validation: any;
}

export function LocationTab({ data, onChange, validation }: LocationTabProps) {
  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const handleCEPChange = (value: string) => {
    const formattedValue = formatCEP(value);
    onChange({ cep: formattedValue });
  };

  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-1">Localização</h2>
        <p className="text-sm text-muted-foreground">Endereço e informações de localização do fornecedor</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="cep">CEP</Label>
          <input
            id="cep"
            type="text"
            value={data.cep || ''}
            onChange={(e) => handleCEPChange(e.target.value)}
            placeholder="00000-000"
            maxLength={9}
            className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="uf">Estado</Label>
          <select
            id="uf"
            value={data.uf || ''}
            onChange={(e) => onChange({ uf: e.target.value })}
            className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
          >
            <option value="">Selecione o estado</option>
            {estados.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cidade">Cidade</Label>
          <input
            id="cidade"
            type="text"
            value={data.cidade || ''}
            onChange={(e) => onChange({ cidade: e.target.value })}
            placeholder="Digite a cidade"
            className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bairro">Bairro</Label>
          <input
            id="bairro"
            type="text"
            value={data.bairro || ''}
            onChange={(e) => onChange({ bairro: e.target.value })}
            placeholder="Digite o bairro"
            className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endereco">Endereço</Label>
          <input
            id="endereco"
            type="text"
            value={data.endereco || ''}
            onChange={(e) => onChange({ endereco: e.target.value })}
            placeholder="Digite o endereço"
            className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="numero">Número</Label>
          <input
            id="numero"
            type="text"
            value={data.numero || ''}
            onChange={(e) => onChange({ numero: e.target.value })}
            placeholder="Digite o número"
            className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
          />
        </div>

        <div className="space-y-2 lg:col-span-2">
          <Label htmlFor="complemento">Complemento</Label>
          <input
            id="complemento"
            type="text"
            value={data.complemento || ''}
            onChange={(e) => onChange({ complemento: e.target.value })}
            placeholder="Digite o complemento (opcional)"
            className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
          />
        </div>
      </div>
    </div>
  );
}
