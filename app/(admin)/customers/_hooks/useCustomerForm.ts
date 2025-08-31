'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import { getCustomerById, createCustomer, updateCustomer } from '@/services/customersService';
import type { 
  CustomerFormData, 
  CustomerFormState, 
  CustomerFormTab, 
  CustomerFormValidation,
  AddressApiResponse 
} from '../../../../src/types/CustomerForm';

const initialFormData: CustomerFormData = {
  name: '',
  tipo_pessoa: 'fisica',
  tax_id: '',
  rg: '',
  data_nascimento: '',
  estado_civil: 'solteiro',
  profissao: '',
  empresa: '',
  cargo: '',
  data_admissao: '',
  telefone_comercial: '',
  email: '',
  phone: '',
  celular: '',
  address: '',
  numero: '',
  complemento: '',
  bairro: '',
  city: '',
  state: '',
  zip_code: '',
  tipo_imovel: 'proprio',
  possui_patrimonio: false,
  valor_patrimonio: 0,
  descricao_patrimonio: '',
  status: 'ativo',
  data_cadastro: new Date().toISOString().split('T')[0],
  responsavel_cadastro: '',
  observacoes: '',
  documents: []
};

const initialValidation: CustomerFormValidation = {
  isValid: true,
  errors: {},
  warnings: {}
};

export function useCustomerForm(customerId?: string) {
  const router = useRouter();
  const [state, setState] = useState<CustomerFormState>({
    data: initialFormData,
    activeTab: 'dados-pessoais',
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
  const validateForm = useCallback((data: CustomerFormData): CustomerFormValidation => {
    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};

    // Validações obrigatórias
    if (!data.name?.trim()) {
      errors.name = 'Nome é obrigatório';
    }

    if (!data.tax_id?.trim()) {
      errors.tax_id = data.tipo_pessoa === 'fisica' ? 'CPF é obrigatório' : 'CNPJ é obrigatório';
    } else {
      // Validação de CPF/CNPJ
      if (data.tipo_pessoa === 'fisica' && !validateCPF(data.tax_id)) {
        errors.tax_id = 'CPF inválido';
      } else if (data.tipo_pessoa === 'juridica' && !validateCNPJ(data.tax_id)) {
        errors.tax_id = 'CNPJ inválido';
      }
    }

    // Validação de email
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Email inválido';
    }

    // Validação de CEP
    if (data.zip_code && !/^\d{5}-?\d{3}$/.test(data.zip_code)) {
      errors.zip_code = 'CEP inválido';
    }

    // Validações condicionais
    if (data.possui_patrimonio && !data.valor_patrimonio) {
      warnings.valor_patrimonio = 'Valor do patrimônio não informado';
    }

    if (data.tipo_pessoa === 'fisica' && !data.rg?.trim()) {
      warnings.rg = 'RG não informado';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings
    };
  }, []);

  // Buscar CEP
  const fetchAddressByCEP = async (cep: string): Promise<AddressApiResponse | null> => {
    try {
      const cleanCEP = cep.replace(/\D/g, '');
      if (cleanCEP.length !== 8) return null;

      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const data = await response.json();
      
      if (data.erro) return null;
      
      return data;
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      return null;
    }
  };

  // Carregar dados do cliente
  const loadCustomer = useCallback(async (id: string) => {
    setState((prev: CustomerFormState) => ({ ...prev, isLoading: true }));
    
    try {
      const response = await getCustomerById(id);
      
      if (!response.success || !response.data?.customer) {
        throw new Error('Cliente não encontrado');
      }
      
      const customer = response.data.customer;

      if (customer) {
        const formData: CustomerFormData = {
          segment_id: customer.segment_id || undefined,
          name: customer.name || '',
          tipo_pessoa: (customer.tipo_pessoa === 'pf' ? 'fisica' : customer.tipo_pessoa === 'pj' ? 'juridica' : 'fisica') as 'fisica' | 'juridica',
          tax_id: customer.tax_id || '',
          rg: customer.rg || '',
          data_nascimento: customer.data_nascimento || '',
          estado_civil: (customer.estado_civil as any) || 'solteiro',
          profissao: customer.profissao || '',
          empresa: customer.empresa || '',
          cargo: customer.cargo || '',
          data_admissao: customer.data_admissao || '',
          telefone_comercial: customer.telefone_comercial || '',
          email: customer.email || '',
          phone: customer.phone || '',
          celular: customer.celular || '',
          address: customer.address || '',
          numero: customer.numero || '',
          complemento: customer.complemento || '',
          bairro: customer.bairro || '',
          city: customer.city || '',
          state: customer.state || '',
          zip_code: customer.zip_code || '',
          tipo_imovel: (customer.tipo_imovel as any) || 'proprio',
          possui_patrimonio: customer.possui_patrimonio || false,
          valor_patrimonio: customer.valor_patrimonio || 0,
          descricao_patrimonio: customer.descricao_patrimonio || '',
          status: (customer.status === 'pendente' ? 'ativo' : customer.status) as 'ativo' | 'inativo' | 'suspenso' || 'ativo',
          data_cadastro: customer.data_cadastro || '',
          responsavel_cadastro: customer.responsavel_cadastro || '',
          observacoes: customer.observacoes || '',
          documents: []
        };

        setState((prev: CustomerFormState) => ({
          ...prev,
          data: formData,
          validation: validateForm(formData),
          isLoading: false
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar cliente:', error);
      toast({ title: 'Erro', description: 'Erro ao carregar dados do cliente', variant: 'destructive' });
      setState((prev: CustomerFormState) => ({ ...prev, isLoading: false }));
    }
  }, [validateForm]);

  // Salvar cliente
  const saveCustomer = async (): Promise<boolean> => {
    setState((prev: CustomerFormState) => ({ ...prev, isSaving: true }));
    
    const validation = validateForm(state.data);
    setState((prev: CustomerFormState) => ({ ...prev, validation }));
    
    if (!validation.isValid) {
      setState((prev: CustomerFormState) => ({ ...prev, isSaving: false }));
      toast({ title: 'Erro', description: 'Corrija os erros antes de salvar', variant: 'destructive' });
      return false;
    }

    try {
      const customerData = {
        segment_id: state.data.segment_id,
        name: state.data.name,
        tipo_pessoa: (state.data.tipo_pessoa === 'fisica' ? 'pf' : 'pj') as 'pf' | 'pj',
        tax_id: state.data.tax_id,
        rg: state.data.rg,
        data_nascimento: state.data.data_nascimento,
        estado_civil: state.data.estado_civil,
        profissao: state.data.profissao,
        empresa: state.data.empresa,
        cargo: state.data.cargo,
        data_admissao: state.data.data_admissao,
        telefone_comercial: state.data.telefone_comercial,
        email: state.data.email,
        phone: state.data.phone,
        celular: state.data.celular,
        address: state.data.address,
        numero: state.data.numero,
        complemento: state.data.complemento,
        bairro: state.data.bairro,
        city: state.data.city,
        state: state.data.state,
        zip_code: state.data.zip_code,
        tipo_imovel: state.data.tipo_imovel,
        possui_patrimonio: state.data.possui_patrimonio,
        valor_patrimonio: state.data.valor_patrimonio,
        descricao_patrimonio: state.data.descricao_patrimonio,
        status: state.data.status,
        data_cadastro: state.data.data_cadastro,
        responsavel_cadastro: state.data.responsavel_cadastro,
        observacoes: state.data.observacoes
      };

      const response = customerId
        ? await updateCustomer(customerId, customerData)
        : await createCustomer(customerData);

      if (!response.success) {
        throw new Error(response.error || 'Erro ao salvar cliente');
      }

      toast({ title: 'Sucesso', description: customerId ? 'Cliente atualizado com sucesso!' : 'Cliente cadastrado com sucesso!' });
      setState((prev: CustomerFormState) => ({ ...prev, isSaving: false, isDirty: false }));
      
      // Redirecionar para lista de clientes
      router.push('/customers');
      return true;
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      toast({ title: 'Erro', description: 'Erro ao salvar cliente', variant: 'destructive' });
      setState((prev: CustomerFormState) => ({ ...prev, isSaving: false }));
      return false;
    }
  };

  // Atualizar dados do formulário
  const updateFormData = useCallback((updates: Partial<CustomerFormData>) => {
    setState((prev: CustomerFormState) => {
      const newData = { ...prev.data, ...updates };
      return {
        ...prev,
        data: newData,
        validation: validateForm(newData),
        isDirty: true
      };
    });
  }, [validateForm]);

  // Mudar aba ativa
  const setActiveTab = useCallback((tab: CustomerFormTab) => {
    setState((prev: CustomerFormState) => ({ ...prev, activeTab: tab }));
  }, []);

  // Buscar endereço por CEP
  const handleCEPChange = useCallback(async (cep: string) => {
    updateFormData({ zip_code: cep });
    
    if (cep.replace(/\D/g, '').length === 8) {
      const addressData = await fetchAddressByCEP(cep);
      if (addressData) {
        updateFormData({
          address: addressData.logradouro,
          bairro: addressData.bairro,
          city: addressData.localidade,
          state: addressData.uf
        });
        toast({ title: 'Sucesso', description: 'Endereço preenchido automaticamente' });
      }
    }
  }, [updateFormData]);

  // Carregar dados ao montar o componente
  useEffect(() => {
    if (customerId) {
      loadCustomer(customerId);
    }
  }, [customerId, loadCustomer]);

  return {
    ...state,
    updateFormData,
    setActiveTab,
    saveCustomer,
    handleCEPChange,
    validateForm: () => validateForm(state.data)
  };
}