'use client';

import { Label } from '@/components/ui/label';

interface FinancialTabProps {
  data: any;
  onChange: (data: any) => void;
  validation: any;
}

export function FinancialTab({ data, onChange, validation }: FinancialTabProps) {
  const bancos = [
    { codigo: '001', nome: 'Banco do Brasil' },
    { codigo: '104', nome: 'Caixa Econômica Federal' },
    { codigo: '033', nome: 'Santander' },
    { codigo: '341', nome: 'Itaú' },
    { codigo: '237', nome: 'Bradesco' },
    { codigo: '756', nome: 'Sicoob' },
    { codigo: '422', nome: 'Safra' },
    { codigo: '212', nome: 'Banco Original' },
    { codigo: '077', nome: 'Inter' },
    { codigo: '260', nome: 'Nubank' },
    { codigo: '336', nome: 'C6 Bank' },
    { codigo: '655', nome: 'Banco Votorantim' },
    { codigo: '041', nome: 'Banrisul' },
    { codigo: '004', nome: 'Banco do Nordeste' },
    { codigo: '021', nome: 'Banestes' },
    { codigo: '047', nome: 'Banco do Estado de Sergipe' },
    { codigo: '085', nome: 'Cecred' },
    { codigo: '097', nome: 'Credisis' },
    { codigo: '136', nome: 'Unicred' },
    { codigo: '318', nome: 'Banco BMG' },
    { codigo: '389', nome: 'Banco Mercantil' },
    { codigo: '637', nome: 'Banco Sofisa' },
    { codigo: '652', nome: 'Itaú Unibanco' },
    { codigo: '070', nome: 'BRB' },
    { codigo: '090', nome: 'Coop. Central Unicred' },
    { codigo: '320', nome: 'Banco CCB' },
    { codigo: '341', nome: 'Itaú' },
    { codigo: '356', nome: 'Banco Real' },
    { codigo: '409', nome: 'Unibanco' },
    { codigo: '453', nome: 'Banco Rural' },
    { codigo: '623', nome: 'Banco Pan' },
    { codigo: '633', nome: 'Banco Rendimento' },
    { codigo: '652', nome: 'Itaú Unibanco' },
    { codigo: '745', nome: 'Banco Citibank' },
    { codigo: '748', nome: 'Banco Cooperativo Sicredi' },
    { codigo: '756', nome: 'Banco Cooperativo do Brasil' },
    { codigo: '000', nome: 'Outros' }
  ];

  const condicoesPagamento = [
    'À vista',
    '30 dias',
    '45 dias',
    '60 dias',
    '90 dias',
    '120 dias',
    'Parcelado',
    'Personalizado'
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-1">Dados Financeiros</h2>
        <p className="text-sm text-muted-foreground">Informações bancárias e condições de pagamento</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="banco_nome">Banco</Label>
          <select
            id="banco_nome"
            value={data.banco_nome || ''}
            onChange={(e) => {
              const banco = bancos.find(b => b.nome === e.target.value);
              onChange({ 
                banco_nome: e.target.value,
                banco_codigo: banco?.codigo || ''
              });
            }}
            className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
          >
            <option value="">Selecione o banco</option>
            {bancos.map((banco) => (
              <option key={banco.codigo} value={banco.nome}>
                {banco.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="banco_codigo">Código do Banco</Label>
          <input
            id="banco_codigo"
            type="text"
            value={data.banco_codigo || ''}
            onChange={(e) => onChange({ banco_codigo: e.target.value })}
            placeholder="000"
            maxLength={3}
            className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="agencia_numero">Agência</Label>
          <input
            id="agencia_numero"
            type="text"
            value={data.agencia_numero || ''}
            onChange={(e) => onChange({ agencia_numero: e.target.value })}
            placeholder="Digite o número da agência"
            className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="agencia_digito">Dígito da Agência</Label>
          <input
            id="agencia_digito"
            type="text"
            value={data.agencia_digito || ''}
            onChange={(e) => onChange({ agencia_digito: e.target.value })}
            placeholder="0"
            maxLength={1}
            className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="conta_numero">Conta</Label>
          <input
            id="conta_numero"
            type="text"
            value={data.conta_numero || ''}
            onChange={(e) => onChange({ conta_numero: e.target.value })}
            placeholder="Digite o número da conta"
            className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="conta_digito">Dígito da Conta</Label>
          <input
            id="conta_digito"
            type="text"
            value={data.conta_digito || ''}
            onChange={(e) => onChange({ conta_digito: e.target.value })}
            placeholder="0"
            maxLength={1}
            className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pix_chave">Chave PIX</Label>
          <input
            id="pix_chave"
            type="text"
            value={data.pix_chave || ''}
            onChange={(e) => onChange({ pix_chave: e.target.value })}
            placeholder="Digite a chave PIX"
            className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="condicao_pagamento">Condição de Pagamento</Label>
          <select
            id="condicao_pagamento"
            value={data.condicao_pagamento || ''}
            onChange={(e) => onChange({ condicao_pagamento: e.target.value })}
            className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur-sm text-foreground transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
          >
            <option value="">Selecione a condição</option>
            {condicoesPagamento.map((condicao) => (
              <option key={condicao} value={condicao}>
                {condicao}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
