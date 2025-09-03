'use client';

import { Label } from '@/components/ui/label';

interface ContactTabProps {
  data: any;
  onChange: (data: any) => void;
  validation: any;
}

export function ContactTab({ data, onChange, validation }: ContactTabProps) {
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (numbers.length === 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers;
  };

  const handlePhoneChange = (field: string, value: string) => {
    const formattedValue = formatPhone(value);
    onChange({ [field]: formattedValue });
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-1">Contato</h2>
        <p className="text-sm text-muted-foreground">Informações de contato e comunicação com o fornecedor</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="pessoa_contato">Pessoa de Contato</Label>
          <input
            id="pessoa_contato"
            type="text"
            value={data.pessoa_contato || ''}
            onChange={(e) => onChange({ pessoa_contato: e.target.value })}
            placeholder="Digite o nome da pessoa de contato"
            className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-1">
            Email
            <span className="text-destructive">*</span>
          </Label>
          <input
            id="email"
            type="email"
            value={data.email || ''}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="Digite o email"
            className={`w-full px-4 py-3 border rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary ${
              validation.errors?.email ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : 'border-input hover:border-primary/50'
            }`}
          />
          {validation.errors?.email && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {validation.errors.email}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefone_fixo">Telefone Fixo</Label>
          <input
            id="telefone_fixo"
            type="text"
            value={data.telefone_fixo || ''}
            onChange={(e) => handlePhoneChange('telefone_fixo', e.target.value)}
            placeholder="(00) 0000-0000"
            maxLength={15}
            className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefone_celular" className="flex items-center gap-1">
            Telefone Celular
            <span className="text-destructive">*</span>
          </Label>
          <input
            id="telefone_celular"
            type="text"
            value={data.telefone_celular || ''}
            onChange={(e) => handlePhoneChange('telefone_celular', e.target.value)}
            placeholder="(00) 00000-0000"
            maxLength={16}
            className={`w-full px-4 py-3 border rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary ${
              validation.errors?.telefone_celular ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : 'border-input hover:border-primary/50'
            }`}
          />
          {validation.errors?.telefone_celular && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {validation.errors.telefone_celular}
            </p>
          )}
        </div>

        <div className="space-y-2 lg:col-span-2">
          <Label htmlFor="site">Site</Label>
          <input
            id="site"
            type="url"
            value={data.site || ''}
            onChange={(e) => onChange({ site: e.target.value })}
            placeholder="https://www.exemplo.com"
            className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
          />
        </div>
      </div>
    </div>
  );
}
