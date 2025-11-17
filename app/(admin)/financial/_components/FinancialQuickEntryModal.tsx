"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Zap, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { createPartner, listPartners } from '@/services/partnersService';
import { createFinancialDocument } from '@/services/financialDocumentsService';

type Segment = { id: string; name?: string; code?: string };

type Props = {
  open: boolean;
  onClose: () => void;
  segments: Segment[];
  onCreate: () => void; // Callback após criar documento
};

// Função para validar CPF/CNPJ
function isValidCPFCNPJ(value: string): boolean {
  const cleaned = value.replace(/\D/g, '');
  return cleaned.length === 11 || cleaned.length === 14;
}

// Função para buscar ou criar parceiro
async function findOrCreatePartner(name?: string, cpfCnpj?: string): Promise<string | null> {
  try {
    // Se tem CPF/CNPJ, buscar por ele primeiro
    if (cpfCnpj) {
      const cleaned = cpfCnpj.replace(/\D/g, '');
      const response = await listPartners({ q: cleaned, page: 1, pageSize: 10 });
      
      if (response.data?.partners && response.data.partners.length > 0) {
        // Encontrou parceiro existente
        const found = response.data.partners.find(p => 
          p.tax_id?.replace(/\D/g, '') === cleaned
        );
        if (found) {
          console.log('✅ Parceiro encontrado por CPF/CNPJ:', found.id);
          return found.id;
        }
      }
    }
    
    // Se tem nome, buscar por nome
    if (name) {
      const response = await listPartners({ q: name, page: 1, pageSize: 10 });
      
      if (response.data?.partners && response.data.partners.length > 0) {
        // Verificar se encontrou match exato
        const found = response.data.partners.find(p => 
          p.name?.toLowerCase() === name.toLowerCase()
        );
        if (found) {
          console.log('✅ Parceiro encontrado por nome:', found.id);
          return found.id;
        }
      }
    }
    
    // Não encontrou, criar novo parceiro
    console.log('➕ Criando novo parceiro...');
    const partnerPayload: any = {
      name: name || 'Parceiro Avulso',
      tax_id: cpfCnpj?.replace(/\D/g, '') || null,
    };
    
    const createResponse = await createPartner(partnerPayload);
    
    // O service retorna { data: { partner: ... }, success: boolean }
    if (createResponse.success && createResponse.data?.partner) {
      const createdPartner = createResponse.data.partner;
      console.log('✅ Parceiro criado:', createdPartner.id);
      return createdPartner.id;
    }
    
    console.error('❌ Resposta da API não contém parceiro:', createResponse);
    return null;
  } catch (error) {
    console.error('❌ Erro ao buscar/criar parceiro:', error);
    return null;
  }
}

export default function FinancialQuickEntryModal({ open, onClose, segments, onCreate }: Props) {
  // Form state - campos mínimos
  const [partnerName, setPartnerName] = React.useState<string>('');
  const [partnerCpfCnpj, setPartnerCpfCnpj] = React.useState<string>('');
  const [amount, setAmount] = React.useState<string>('');
  const [date, setDate] = React.useState<string>('');
  const [direction, setDirection] = React.useState<'receivable' | 'payable'>('receivable');
  const [description, setDescription] = React.useState<string>('');
  const [segmentId, setSegmentId] = React.useState<string>('');
  
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Limpar formulário ao fechar
  React.useEffect(() => {
    if (!open) {
      setPartnerName('');
      setPartnerCpfCnpj('');
      setAmount('');
      setDate('');
      setDirection('receivable');
      setDescription('');
      setSegmentId('');
      setErrors({});
    } else {
      // Definir data padrão como hoje
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = today.getFullYear();
      setDate(`${day}/${month}/${year}`);
    }
  }, [open]);

  // Máscara para CPF/CNPJ
  const applyCpfCnpjMask = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 11) {
      // CPF: 000.000.000-00
      return digits
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      // CNPJ: 00.000.000/0000-00
      return digits
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
  };

  // Máscara para valor monetário
  const applyCurrencyMask = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    const number = parseInt(digits) / 100;
    return number.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Converter valor formatado para número
  const parseCurrency = (value: string): number => {
    const cleaned = value.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  };

  // Converter data BR para ISO
  const formatDateToISO = (dateStr: string): string => {
    if (!dateStr) return '';
    if (dateStr.includes('-') && dateStr.length === 10) return dateStr;
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return dateStr;
  };

  // Validação
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar que tem pelo menos nome OU CPF/CNPJ
    if (!partnerName.trim() && !partnerCpfCnpj.trim()) {
      newErrors.partner = 'Informe o nome/razão social OU CPF/CNPJ';
    }

    // Validar valor
    if (!amount || parseCurrency(amount) <= 0) {
      newErrors.amount = 'Valor é obrigatório e deve ser maior que zero';
    }

    // Validar data
    if (!date) {
      newErrors.date = 'Data é obrigatória';
    }

    // Validar CPF/CNPJ se informado
    if (partnerCpfCnpj && !isValidCPFCNPJ(partnerCpfCnpj)) {
      newErrors.cpfCnpj = 'CPF/CNPJ inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      // 1. Buscar ou criar parceiro
      const partnerId = await findOrCreatePartner(
        partnerName.trim() || undefined,
        partnerCpfCnpj.trim() || undefined
      );

      if (!partnerId) {
        throw new Error('Não foi possível criar ou encontrar o parceiro');
      }

      // 2. Criar documento financeiro
      const documentPayload: any = {
        partner_id: partnerId,
        direction,
        amount: parseCurrency(amount),
        issue_date: formatDateToISO(date),
        due_date: formatDateToISO(date), // Usar mesma data como padrão
        description: description || `${direction === 'receivable' ? 'Receita' : 'Despesa'} avulsa`,
        status: 'open',
        segment_id: segmentId || null,
      };

      const response = await createFinancialDocument(documentPayload);

      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: 'Lançamento criado!',
        description: 'Documento financeiro criado com sucesso.',
      });

      // Limpar formulário e fechar
      setPartnerName('');
      setPartnerCpfCnpj('');
      setAmount('');
      setDate('');
      setDescription('');
      setErrors({});
      
      onCreate(); // Recarregar lista
      onClose();
    } catch (error) {
      console.error('❌ Erro ao criar lançamento avulso:', error);
      toast({
        title: 'Erro ao criar lançamento',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-background border rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Lançamento Avulso</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                {/* Tipo */}
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo *</label>
                  <select
                    value={direction}
                    onChange={(e) => setDirection(e.target.value as 'receivable' | 'payable')}
                    className="w-full bg-muted border rounded-lg p-2"
                  >
                    <option value="receivable">Contas a Receber</option>
                    <option value="payable">Contas a Pagar</option>
                  </select>
                </div>

                {/* Nome/Razão Social */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nome/Razão Social {!partnerCpfCnpj && '*'}
                  </label>
                  <input
                    type="text"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    placeholder="Nome ou razão social"
                    className={`w-full bg-muted border rounded-lg p-2 ${
                      errors.partner ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.partner && (
                    <p className="text-sm text-red-500 mt-1">{errors.partner}</p>
                  )}
                </div>

                {/* CPF/CNPJ */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    CPF/CNPJ {!partnerName && '*'}
                  </label>
                  <input
                    type="text"
                    value={partnerCpfCnpj}
                    onChange={(e) => {
                      const masked = applyCpfCnpjMask(e.target.value);
                      setPartnerCpfCnpj(masked);
                    }}
                    placeholder="000.000.000-00 ou 00.000.000/0000-00"
                    maxLength={18}
                    className={`w-full bg-muted border rounded-lg p-2 ${
                      errors.cpfCnpj ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.cpfCnpj && (
                    <p className="text-sm text-red-500 mt-1">{errors.cpfCnpj}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Informe pelo menos nome OU CPF/CNPJ
                  </p>
                </div>

                {/* Valor */}
                <div>
                  <label className="block text-sm font-medium mb-1">Valor *</label>
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => {
                      const masked = applyCurrencyMask(e.target.value);
                      setAmount(masked);
                    }}
                    placeholder="0,00"
                    className={`w-full bg-muted border rounded-lg p-2 ${
                      errors.amount ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.amount && (
                    <p className="text-sm text-red-500 mt-1">{errors.amount}</p>
                  )}
                </div>

                {/* Data */}
                <div>
                  <label className="block text-sm font-medium mb-1">Data *</label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 2) {
                        value = value;
                      } else if (value.length <= 4) {
                        value = value.substring(0, 2) + '/' + value.substring(2);
                      } else {
                        value = value.substring(0, 2) + '/' + value.substring(2, 4) + '/' + value.substring(4, 8);
                      }
                      setDate(value);
                    }}
                    placeholder="DD/MM/AAAA"
                    maxLength={10}
                    className={`w-full bg-muted border rounded-lg p-2 ${
                      errors.date ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.date && (
                    <p className="text-sm text-red-500 mt-1">{errors.date}</p>
                  )}
                </div>

                {/* Descrição (opcional) */}
                <div>
                  <label className="block text-sm font-medium mb-1">Descrição</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descrição do lançamento (opcional)"
                    className="w-full bg-muted border rounded-lg p-2"
                  />
                </div>

                {/* Segmento (opcional) */}
                {segments.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Segmento</label>
                    <select
                      value={segmentId}
                      onChange={(e) => setSegmentId(e.target.value)}
                      className="w-full bg-muted border rounded-lg p-2"
                    >
                      <option value="">Selecione um segmento</option>
                      {segments.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.code ? `${s.code} - ` : ''}{s.name || s.id}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Botões */}
                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Criar Lançamento
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

