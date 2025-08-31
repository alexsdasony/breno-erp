'use client';

import { Label } from '@/components/ui/label';
import type { CustomerTabProps } from '../../../../../src/types/CustomerForm';
import { ESTADO_CIVIL_OPTIONS, TIPO_PESSOA_OPTIONS } from '../../../../../src/types/CustomerForm';
import { useAppData } from '@/hooks/useAppData';

export function PersonalDataTab({ data, onChange, validation }: CustomerTabProps) {
  const { segments } = useAppData();

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const formatRG = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 9) {
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4');
    }
    return numbers;
  };

  const handleTaxIdChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    let formattedValue = value;

    if (data.tipo_pessoa === 'fisica') {
      formattedValue = formatCPF(cleanValue);
    } else {
      formattedValue = formatCNPJ(cleanValue);
    }

    onChange({ tax_id: formattedValue });
  };

  const handleRGChange = (value: string) => {
    const formattedValue = formatRG(value);
    onChange({ rg: formattedValue });
  };

  return (
    <div className="space-y-6">
      {/* Primeira linha - Segmento e Nome */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="segment">Segmento</Label>
          <select
            id="segment"
            value={data.segment_id || ''}
            onChange={(e) => onChange({ segment_id: e.target.value })}
            className="w-full p-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
          >
            <option value="">Selecione um segmento</option>
            {segments.map((segment: any) => (
              <option key={segment.id} value={segment.id}>
                {segment.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Nome Completo *</Label>
          <input
            id="name"
            type="text"
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Digite o nome completo"
            className={`w-full p-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground ${validation.errors.name ? 'border-destructive' : ''
              }`}
          />
          {validation.errors.name && (
            <p className="text-sm text-red-500">{validation.errors.name}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Tipo de Pessoa */}
        <div className="space-y-2">
          <Label htmlFor="tipo_pessoa">Tipo de Pessoa *</Label>
          <select
            id="tipo_pessoa"
            value={data.tipo_pessoa}
            onChange={(e) => {
              const tipoPessoa = e.target.value as 'fisica' | 'juridica';
              onChange({
                tipo_pessoa: tipoPessoa,
                tax_id: '',
                rg: tipoPessoa === 'fisica' ? data.rg : ''
              });
            }}
            className="w-full p-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
          >
            {TIPO_PESSOA_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Profissão */}
        <div className="space-y-2">
          <Label htmlFor="profissao">
            {data.tipo_pessoa === 'fisica' ? 'Profissão' : 'Atividade Principal'}
          </Label>
          <input
            id="profissao"
            type="text"
            value={data.profissao || ''}
            onChange={(e) => onChange({ profissao: e.target.value })}
            placeholder={data.tipo_pessoa === 'fisica' ? 'Digite a profissão' : 'Digite a atividade principal'}
            className="w-full p-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
          />
        </div>

      </div>

      {/* Segunda linha - CPF/CNPJ e RG (se pessoa física) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tax_id">
            {data.tipo_pessoa === 'fisica' ? 'CPF' : 'CNPJ'} *
          </Label>
          <input
            id="tax_id"
            type="text"
            value={data.tax_id}
            onChange={(e) => handleTaxIdChange(e.target.value)}
            placeholder={data.tipo_pessoa === 'fisica' ? '000.000.000-00' : '00.000.000/0000-00'}
            maxLength={data.tipo_pessoa === 'fisica' ? 14 : 18}
            className={`w-full p-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground ${validation.errors.tax_id ? 'border-destructive' : ''
              }`}
          />
          {validation.errors.tax_id && (
            <p className="text-sm text-destructive">{validation.errors.tax_id}</p>
          )}
        </div>

        {/* RG - Apenas para Pessoa Física */}
        {data.tipo_pessoa === 'fisica' && (
          <div className="space-y-2">
            <Label htmlFor="rg">RG</Label>
            <input
              id="rg"
              type="text"
              value={data.rg || ''}
              onChange={(e) => handleRGChange(e.target.value)}
              placeholder="00.000.000-0"
              maxLength={12}
              className="w-full p-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
            />
            {validation.warnings.rg && (
              <p className="text-sm text-yellow-500">{validation.warnings.rg}</p>
            )}
          </div>
        )}
      </div>

      {/* Terceira linha - Data de Nascimento e Estado Civil (se pessoa física) */}
      {data.tipo_pessoa === 'fisica' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="data_nascimento">Data de Nascimento</Label>
            <input
              id="data_nascimento"
              type="date"
              value={data.data_nascimento || ''}
              onChange={(e) => onChange({ data_nascimento: e.target.value })}
              className="w-full p-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado_civil">Estado Civil</Label>
            <select
              id="estado_civil"
              value={data.estado_civil || 'solteiro'}
              onChange={(e) => onChange({ estado_civil: e.target.value as any })}
              className="w-full p-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
            >
              {ESTADO_CIVIL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

    </div>
  );
}