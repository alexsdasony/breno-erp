'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Supplier, SupplierPayload } from '../../../../src/types';

export type SupplierFormTab = 'identificacao' | 'localizacao' | 'contato' | 'financeiro' | 'operacional';

export interface SupplierFormValidation {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

export interface SupplierFormState {
  data: SupplierPayload;
  activeTab: SupplierFormTab;
  isLoading: boolean;
  isSaving: boolean;
  validation: SupplierFormValidation;
  isDirty: boolean;
}

const initialFormData: SupplierPayload = {
  razao_social: '',
  nome_fantasia: '',
  ramo_atividade: '',
  tipo_contribuinte: 'PJ',
  cpf_cnpj: '',
  inscricao_estadual: '',
  inscricao_municipal: '',
  uf: '',
  cidade: '',
  cep: '',
  endereco: '',
  numero: '',
  complemento: '',
  bairro: '',
  pessoa_contato: '',
  telefone_fixo: '',
  telefone_celular: '',
  email: '',
  site: '',
  banco_nome: '',
  banco_codigo: '',
  agencia_numero: '',
  agencia_digito: '',
  conta_numero: '',
  conta_digito: '',
  pix_chave: '',
  condicao_pagamento: '',
  status: 'ATIVO',
  data_cadastro: new Date().toISOString().split('T')[0],
  observacoes: '',
  segment_id: '',
};

const initialValidation: SupplierFormValidation = {
  isValid: true,
  errors: {},
  warnings: {}
};

export function useSupplierForm(supplier?: Supplier | null) {
  const [state, setState] = useState<SupplierFormState>({
    data: supplier ? { ...initialFormData, ...supplier } : initialFormData,
    activeTab: 'identificacao',
    isLoading: false,
    isSaving: false,
    validation: initialValidation,
    isDirty: false
  });

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

  // Validação do formulário
  const validateForm = useCallback((data: SupplierPayload): SupplierFormValidation => {
    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};

    // === ABA IDENTIFICAÇÃO ===
    if (!data.razao_social?.trim()) {
      errors.razao_social = 'Razão social é obrigatória';
    }

    if (!data.cpf_cnpj?.trim()) {
      errors.cpf_cnpj = data.tipo_contribuinte === 'PF' ? 'CPF é obrigatório' : 'CNPJ é obrigatório';
    } else {
      // Validação de CPF/CNPJ
      if (data.tipo_contribuinte === 'PF' && !validateCPF(data.cpf_cnpj)) {
        errors.cpf_cnpj = 'CPF inválido';
      } else if (data.tipo_contribuinte === 'PJ' && !validateCNPJ(data.cpf_cnpj)) {
        errors.cpf_cnpj = 'CNPJ inválido';
      }
    }

    if (!data.segment_id) {
      warnings.segment_id = 'Segmento não selecionado';
    }

    // === ABA CONTATO ===
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Email inválido';
    }

    if (!data.telefone_celular?.trim() && !data.telefone_fixo?.trim()) {
      warnings.telefone_celular = 'Pelo menos um telefone deve ser informado';
    }

    // === ABA LOCALIZAÇÃO ===
    if (data.cep && data.cep.replace(/\D/g, '').length !== 8) {
      warnings.cep = 'CEP deve ter 8 dígitos';
    }

    // === ABA FINANCEIRA ===
    if (data.banco_nome && !data.banco_codigo) {
      warnings.banco_codigo = 'Código do banco não informado';
    }

    if (data.agencia_numero && !data.agencia_digito) {
      warnings.agencia_digito = 'Dígito da agência não informado';
    }

    if (data.conta_numero && !data.conta_digito) {
      warnings.conta_digito = 'Dígito da conta não informado';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings
    };
  }, []);

  // Atualizar dados do formulário
  const updateFormData = useCallback((updates: Partial<SupplierPayload>) => {
    setState(prev => {
      const newData = { ...prev.data, ...updates };
      const newValidation = validateForm(newData);
      
      return {
        ...prev,
        data: newData,
        validation: newValidation,
        isDirty: true
      };
    });
  }, [validateForm]);

  // Definir aba ativa
  const setActiveTab = useCallback((tab: SupplierFormTab) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  // Salvar fornecedor
  const saveSupplier = useCallback(async (): Promise<boolean> => {
    const validation = validateForm(state.data);
    
    if (!validation.isValid) {
      setState(prev => ({ ...prev, validation }));
      toast({
        title: "Erro de validação",
        description: "Corrija os erros antes de salvar",
        variant: "destructive"
      });
      return false;
    }

    setState(prev => ({ ...prev, isSaving: true }));

    try {
      // Aqui você implementaria a lógica de salvamento
      // Por enquanto, apenas simula um delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Sucesso!",
        description: supplier ? "Fornecedor atualizado com sucesso" : "Fornecedor criado com sucesso",
      });

      setState(prev => ({ 
        ...prev, 
        isSaving: false, 
        isDirty: false,
        validation: initialValidation
      }));

      return true;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar fornecedor",
        variant: "destructive"
      });

      setState(prev => ({ ...prev, isSaving: false }));
      return false;
    }
  }, [state.data, supplier, validateForm]);

  // Carregar dados do fornecedor
  useEffect(() => {
    if (supplier) {
      setState(prev => ({
        ...prev,
        data: { ...initialFormData, ...supplier },
        validation: validateForm({ ...initialFormData, ...supplier })
      }));
    }
  }, [supplier, validateForm]);

  return {
    data: state.data,
    activeTab: state.activeTab,
    isLoading: state.isLoading,
    isSaving: state.isSaving,
    validation: state.validation,
    isDirty: state.isDirty,
    updateFormData,
    setActiveTab,
    saveSupplier
  };
}
