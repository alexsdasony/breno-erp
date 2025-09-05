'use client';

import { Label } from '@/components/ui/label';
import { useAppData } from '@/hooks/useAppData';

interface IdentificationTabProps {
  data: any;
  onChange: (data: any) => void;
  validation: any;
}

export function IdentificationTab({ data, onChange, validation }: IdentificationTabProps) {
  const { segments } = useAppData();

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  // Validação de CPF
  const validateCPF = (cpf: string): boolean => {
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
    
    // Validação dos dígitos verificadores
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let digit1 = 11 - (sum % 11);
    if (digit1 > 9) digit1 = 0;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    let digit2 = 11 - (sum % 11);
    if (digit2 > 9) digit2 = 0;
    
    return digit1 === parseInt(cleanCPF.charAt(9)) && digit2 === parseInt(cleanCPF.charAt(10));
  };

  // Validação de CNPJ
  const validateCNPJ = (cnpj: string): boolean => {
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    if (cleanCNPJ.length !== 14) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;
    
    // Validação dos dígitos verificadores
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleanCNPJ.charAt(i)) * weights1[i];
    }
    let digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    
    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cleanCNPJ.charAt(i)) * weights2[i];
    }
    let digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    
    return digit1 === parseInt(cleanCNPJ.charAt(12)) && digit2 === parseInt(cleanCNPJ.charAt(13));
  };

  const handleCPFCNPJChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    let formattedValue = value;

    if (data.tipo_contribuinte === 'PF') {
      formattedValue = formatCPF(cleanValue);
    } else {
      formattedValue = formatCNPJ(cleanValue);
    }

    // Validar e notificar erro se inválido
    const isValid = data.tipo_contribuinte === 'PF' ? validateCPF(formattedValue) : validateCNPJ(formattedValue);
    
    onChange({ 
      cpf_cnpj: formattedValue,
      cpf_cnpj_valid: isValid
    });
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-1">Identificação</h2>
        <p className="text-sm text-muted-foreground">Informações básicas e documentos do fornecedor</p>
      </div>
      
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
          <Label htmlFor="tipo_contribuinte" className="flex items-center gap-1">
            Tipo de Contribuinte
            <span className="text-destructive">*</span>
          </Label>
          <select
            id="tipo_contribuinte"
            value={data.tipo_contribuinte}
            onChange={(e) => {
              const tipo = e.target.value as 'PJ' | 'PF' | 'MEI' | 'Outros';
              onChange({
                tipo_contribuinte: tipo,
                cpf_cnpj: ''
              });
            }}
            className="w-full px-4 py-3 border rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary border-input hover:border-primary/50"
          >
            <option value="PJ">Pessoa Jurídica</option>
            <option value="PF">Pessoa Física</option>
            <option value="MEI">MEI</option>
            <option value="Outros">Outros</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="razao_social" className="flex items-center gap-1">
            {data.tipo_contribuinte === 'PF' ? 'Nome Completo' : 'Razão Social'}
            <span className="text-destructive">*</span>
          </Label>
          <input
            id="razao_social"
            type="text"
            value={data.razao_social}
            onChange={(e) => onChange({ razao_social: e.target.value })}
            placeholder={data.tipo_contribuinte === 'PF' ? 'Digite o nome completo' : 'Digite a razão social'}
            className={`w-full px-4 py-3 border rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary ${
              validation.errors?.razao_social ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : 'border-input hover:border-primary/50'
            }`}
          />
          {validation.errors?.razao_social && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {validation.errors.razao_social}
            </p>
          )}
        </div>

        {data.tipo_contribuinte === 'PJ' && (
          <div className="space-y-2">
            <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
            <input
              id="nome_fantasia"
              type="text"
              value={data.nome_fantasia || ''}
              onChange={(e) => onChange({ nome_fantasia: e.target.value })}
              placeholder="Digite o nome fantasia"
              className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="ramo_atividade">
            {data.tipo_contribuinte === 'PF' ? 'Profissão' : 'Ramo de Atividade'}
          </Label>
          <input
            id="ramo_atividade"
            type="text"
            value={data.ramo_atividade || ''}
            onChange={(e) => onChange({ ramo_atividade: e.target.value })}
            placeholder={data.tipo_contribuinte === 'PF' ? 'Digite a profissão' : 'Digite o ramo de atividade'}
            className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cpf_cnpj" className="flex items-center gap-1">
            {data.tipo_contribuinte === 'PF' ? 'CPF' : 'CNPJ'}
            <span className="text-destructive">*</span>
          </Label>
          <input
            id="cpf_cnpj"
            type="text"
            value={data.cpf_cnpj}
            onChange={(e) => handleCPFCNPJChange(e.target.value)}
            placeholder={data.tipo_contribuinte === 'PF' ? '000.000.000-00' : '00.000.000/0000-00'}
            maxLength={data.tipo_contribuinte === 'PF' ? 14 : 18}
            className={`w-full px-4 py-3 border rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary ${
              validation.errors?.cpf_cnpj ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : 'border-input hover:border-primary/50'
            }`}
          />
          {validation.errors?.cpf_cnpj && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {validation.errors.cpf_cnpj}
            </p>
          )}
        </div>

        {data.tipo_contribuinte === 'PJ' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="inscricao_estadual">Inscrição Estadual</Label>
              <input
                id="inscricao_estadual"
                type="text"
                value={data.inscricao_estadual || ''}
                onChange={(e) => onChange({ inscricao_estadual: e.target.value })}
                placeholder="Digite a inscrição estadual"
                className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inscricao_municipal">Inscrição Municipal</Label>
              <input
                id="inscricao_municipal"
                type="text"
                value={data.inscricao_municipal || ''}
                onChange={(e) => onChange({ inscricao_municipal: e.target.value })}
                placeholder="Digite a inscrição municipal"
                className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
