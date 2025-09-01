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

    if (data.tipo_pessoa === 'pf') {
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="segment" className="flex items-center gap-1">
            Segmento
          </Label>
          <select
            id="segment"
            value={data.segment_id || ''}
            onChange={(e) => onChange({ segment_id: e.target.value })}
            className="w-full px-4 py-3 border rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary border-input hover:border-primary/50"
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
          <Label htmlFor="name" className="flex items-center gap-1">
            Nome Completo
            <span className="text-destructive">*</span>
          </Label>
          <input
            id="name"
            type="text"
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Digite o nome completo"
            className={`w-full px-4 py-3 border rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary ${
              validation.errors.name ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : 'border-input hover:border-primary/50'
            }`}
          />
          {validation.errors.name && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {validation.errors.name}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tipo_pessoa" className="flex items-center gap-1">
            Tipo de Pessoa
            <span className="text-destructive">*</span>
          </Label>
          <select
            id="tipo_pessoa"
            value={data.tipo_pessoa}
            onChange={(e) => {
              const tipoPessoa = e.target.value as 'pf' | 'pj';
              onChange({
                tipo_pessoa: tipoPessoa,
                tax_id: '',
                rg: tipoPessoa === 'pf' ? data.rg : ''
              });
            }}
            className="w-full px-4 py-3 border rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary border-input hover:border-primary/50"
          >
            {TIPO_PESSOA_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="profissao">
            {data.tipo_pessoa === 'pf' ? 'Profissão' : 'Atividade Principal'}
          </Label>
          <input
            id="profissao"
            type="text"
            value={data.profissao || ''}
            onChange={(e) => onChange({ profissao: e.target.value })}
            placeholder={data.tipo_pessoa === 'pf' ? 'Digite a profissão' : 'Digite a atividade principal'}
            className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tax_id" className="flex items-center gap-1">
            {data.tipo_pessoa === 'pf' ? 'CPF' : 'CNPJ'}
            <span className="text-destructive">*</span>
          </Label>
          <input
            id="tax_id"
            type="text"
            value={data.tax_id}
            onChange={(e) => handleTaxIdChange(e.target.value)}
            placeholder={data.tipo_pessoa === 'pf' ? '000.000.000-00' : '00.000.000/0000-00'}
            maxLength={data.tipo_pessoa === 'pf' ? 14 : 18}
            className={`w-full px-4 py-3 border rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary ${
              validation.errors.tax_id ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : 'border-input hover:border-primary/50'
            }`}
          />
          {validation.errors.tax_id && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {validation.errors.tax_id}
            </p>
          )}
        </div>

        {/* RG - Apenas para Pessoa Física */}
        {data.tipo_pessoa === 'pf' && (
          <div className="space-y-2">
            <Label htmlFor="rg">RG</Label>
            <input
              id="rg"
              type="text"
              value={data.rg || ''}
              onChange={(e) => handleRGChange(e.target.value)}
              placeholder="00.000.000-0"
              maxLength={12}
              className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
            />
            {validation.warnings.rg && (
              <p className="text-sm text-yellow-500">{validation.warnings.rg}</p>
            )}
          </div>
        )}

        {/* Dados Pessoais Adicionais - Apenas para Pessoa Física */}
        {data.tipo_pessoa === 'pf' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="data_nascimento">Data de Nascimento</Label>
              <input
                id="data_nascimento"
                type="date"
                value={data.data_nascimento || ''}
                onChange={(e) => onChange({ data_nascimento: e.target.value })}
                className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado_civil">Estado Civil</Label>
              <select
                id="estado_civil"
                value={data.estado_civil || ''}
                onChange={(e) => onChange({ estado_civil: e.target.value as 'solteiro' | 'casado' | 'divorciado' | 'viuvo' | 'uniao_estavel' })}
                className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
              >
                {ESTADO_CIVIL_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );
}