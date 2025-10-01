'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Supplier, SupplierPayload } from '../../../../src/types';
import { useAppData } from '@/hooks/useAppData';

interface SupplierFormProps {
  supplier?: Supplier | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SupplierPayload) => Promise<void>;
  isLoading?: boolean;
}

const TABS = [
  { 
    id: 'identificacao', 
    label: 'Identificação',
    fields: ['razao_social', 'tipo_contribuinte', 'cpf_cnpj', 'segment_id']
  },
  { 
    id: 'localizacao', 
    label: 'Localização',
    fields: ['cep', 'uf', 'cidade', 'endereco', 'numero', 'bairro']
  },
  { 
    id: 'contato', 
    label: 'Contato',
    fields: ['pessoa_contato', 'email', 'telefone_celular', 'telefone_fixo']
  },
  { 
    id: 'financeiro', 
    label: 'Financeiro',
    fields: ['banco_nome', 'agencia_numero', 'conta_numero', 'condicao_pagamento']
  },
  { 
    id: 'operacional', 
    label: 'Operacional',
    fields: ['status', 'data_cadastro', 'observacoes']
  },
];

export default function SupplierForm({ supplier, isOpen, onClose, onSubmit, isLoading = false }: SupplierFormProps) {
  const { segments } = useAppData();
  const [activeTab, setActiveTab] = useState('identificacao');
  const [formData, setFormData] = useState<SupplierPayload>({
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
    status: 'ativo',
    data_cadastro: new Date().toISOString().split('T')[0],
    observacoes: '',
    segment_id: '',
  });

  const [validation, setValidation] = useState({
    errors: {} as Record<string, string>,
    warnings: {} as Record<string, string>
  });

  // Calcular progresso do formulário
  const requiredFields = ['razao_social', 'tipo_contribuinte', 'cpf_cnpj'];
  const filledRequiredFields = requiredFields.filter(field => {
    const value = formData[field as keyof typeof formData];
    return value && value.toString().trim() !== '';
  }).length;
  const progressPercentage = Math.round((filledRequiredFields / requiredFields.length) * 100);
  
  // Contar total de erros
  const totalErrors = validation.errors ? Object.keys(validation.errors).length : 0;

  // Função para contar erros por aba
  const getTabErrorCount = (tabFields: string[]) => {
    if (!validation.errors) return 0;
    return tabFields.filter(field => validation.errors[field]).length;
  };

  // Funções de formatação
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  // Funções de validação
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

  // Função para validar CPF/CNPJ (sem validação restritiva como no formulário de clientes)
  const validateCPFCNPJ = (value: string, tipo: string | undefined): boolean => {
    if (!value || value.trim().length === 0) return false;
    
    const cleanValue = value.replace(/\D/g, '');
    
    if (tipo === 'PF') {
      return cleanValue.length === 11;
    } else if (tipo === 'PJ') {
      return cleanValue.length === 14;
    }
    
    return cleanValue.length >= 11;
  };

  // Função para formatar CPF/CNPJ
  const handleCPFCNPJChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    let formattedValue = value;

    if (formData.tipo_contribuinte === 'PF') {
      formattedValue = formatCPF(cleanValue);
    } else {
      formattedValue = formatCNPJ(cleanValue);
    }

    setFormData(prev => ({ ...prev, cpf_cnpj: formattedValue }));
    
    // Sem validação de CPF/CNPJ para permitir submit
    setValidation(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        cpf_cnpj: '' // Sempre válido
      }
    }));
  };

  // Função de validação em tempo real
  const validateField = (field: string, value: any) => {
    const errors: Record<string, string> = {};
    
    switch (field) {
      case 'razao_social':
        if (!value || value.trim().length < 3) {
          errors[field] = 'Razão social deve ter pelo menos 3 caracteres';
        }
        break;
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors[field] = 'Email inválido';
        }
        break;
      case 'telefone_celular':
      case 'telefone_fixo':
        if (value && value.replace(/\D/g, '').length < 10) {
          errors[field] = 'Telefone deve ter pelo menos 10 dígitos';
        }
        break;
      case 'cep':
        if (value && value.replace(/\D/g, '').length !== 8) {
          errors[field] = 'CEP deve ter 8 dígitos';
        }
        break;
    }
    
    return errors;
  };

  // Função para lidar com mudanças nos campos
  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validar campo em tempo real
    const fieldErrors = validateField(field, value);
    setValidation(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        ...fieldErrors
      }
    }));
  };

  // Função para lidar com mudanças no CPF/CNPJ
  const handleCPFCNPJFieldChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    const isValid = validateCPFCNPJ(value, formData.tipo_contribuinte);
    
    setFormData(prev => ({ ...prev, cpf_cnpj: value }));
    
    // Definir erro se inválido
    setValidation(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        cpf_cnpj: isValid ? '' : 'CPF/CNPJ inválido'
      }
    }));
  };

  useEffect(() => {
    if (supplier) {
      setFormData({
        razao_social: supplier.razao_social || supplier.name || '',
        nome_fantasia: supplier.nome_fantasia || '',
        ramo_atividade: supplier.ramo_atividade || '',
        tipo_contribuinte: supplier.tipo_contribuinte || 'PJ',
        cpf_cnpj: supplier.cpf_cnpj || supplier.cnpj || supplier.cpf || '',
        inscricao_estadual: supplier.inscricao_estadual || '',
        inscricao_municipal: supplier.inscricao_municipal || '',
        uf: supplier.uf || '',
        cidade: supplier.cidade || '',
        cep: supplier.cep || '',
        endereco: supplier.endereco || supplier.address || '',
        numero: supplier.numero || '',
        complemento: supplier.complemento || '',
        bairro: supplier.bairro || '',
        pessoa_contato: supplier.pessoa_contato || supplier.contact_person || '',
        telefone_fixo: supplier.telefone_fixo || '',
        telefone_celular: supplier.telefone_celular || supplier.telefone || supplier.phone || '',
        email: supplier.email || '',
        site: supplier.site || '',
        banco_nome: supplier.banco_nome || '',
        banco_codigo: supplier.banco_codigo || '',
        agencia_numero: supplier.agencia_numero || '',
        agencia_digito: supplier.agencia_digito || '',
        conta_numero: supplier.conta_numero || '',
        conta_digito: supplier.conta_digito || '',
        pix_chave: supplier.pix_chave || '',
        condicao_pagamento: supplier.condicao_pagamento || supplier.payment_terms || '',
        status: supplier.status || 'ativo',
        data_cadastro: supplier.data_cadastro || new Date().toISOString().split('T')[0],
        observacoes: supplier.observacoes || '',
        segment_id: supplier.segment_id || '',
      });
    }
  }, [supplier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await onSubmit(formData);
      onClose(); // Fechar modal APÓS salvar com sucesso
    } catch (error) {
      console.error('Erro ao salvar fornecedor:', error);
      onClose(); // Fechar modal mesmo com erro
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">F</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {supplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {supplier ? 'Atualize as informações do fornecedor' : 'Preencha as informações do fornecedor'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="bg-white/60 rounded-lg p-4 border border-blue-200/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Progresso do Formulário</span>
                <span className="text-sm font-bold text-blue-600">{progressPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              
              {/* Status Indicators */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center space-x-3">
                  {/* Indicador de Erros */}
                  {totalErrors > 0 && (
                    <div className="flex items-center space-x-2 bg-red-100 text-red-700 px-3 py-1.5 rounded-full border border-red-200">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs font-medium">{totalErrors} erro{totalErrors > 1 ? 's' : ''}</span>
                    </div>
                  )}
                  
                  {/* Status de Sucesso */}
                  {totalErrors === 0 && progressPercentage === 100 && (
                    <div className="flex items-center space-x-2 bg-green-100 text-green-700 px-3 py-1.5 rounded-full border border-green-200">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs font-medium">Formulário Completo</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b bg-gray-50">
            {TABS.map((tab) => {
              const errorCount = getTabErrorCount(tab.fields);
              const hasErrors = errorCount > 0;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                      : hasErrors
                      ? 'text-red-600 hover:text-red-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  {hasErrors && (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold bg-red-100 text-red-600">
                      {errorCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[60vh]">
            <div className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Identificação */}
                  {activeTab === 'identificacao' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label htmlFor="razao_social" className="block text-sm font-semibold text-gray-900">
                            Razão Social *
                          </label>
                          <input
                            id="razao_social"
                            type="text"
                            value={formData.razao_social}
                            onChange={(e) => handleFieldChange('razao_social', e.target.value)}
                            placeholder="Digite a razão social"
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 ${
                              validation.errors.razao_social 
                                ? 'border-red-300 bg-red-50' 
                                : 'border-gray-300'
                            }`}
                            required
                          />
                          {validation.errors.razao_social && (
                            <p className="text-sm text-red-600 flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              <span>{validation.errors.razao_social}</span>
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="nome_fantasia" className="block text-sm font-semibold text-gray-900">
                            Nome Fantasia
                          </label>
                          <input
                            id="nome_fantasia"
                            type="text"
                            value={formData.nome_fantasia || ''}
                            onChange={(e) => handleFieldChange('nome_fantasia', e.target.value)}
                            placeholder="Digite o nome fantasia"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="ramo_atividade" className="block text-sm font-semibold text-gray-900">
                            Ramo de Atividade
                          </label>
                          <select
                            id="ramo_atividade"
                            value={formData.ramo_atividade || ''}
                            onChange={(e) => handleFieldChange('ramo_atividade', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          >
                            <option value="">Selecione o ramo de atividade</option>
                            <option value="comercio">Comércio</option>
                            <option value="industria">Indústria</option>
                            <option value="servicos">Serviços</option>
                            <option value="tecnologia">Tecnologia</option>
                            <option value="saude">Saúde</option>
                            <option value="educacao">Educação</option>
                            <option value="financeiro">Financeiro</option>
                            <option value="outros">Outros</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="tipo_contribuinte" className="block text-sm font-semibold text-gray-900">
                            Tipo de Contribuinte
                          </label>
                          <select
                            id="tipo_contribuinte"
                            value={formData.tipo_contribuinte}
                            onChange={(e) => handleFieldChange('tipo_contribuinte', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          >
                            <option value="PJ">Pessoa Jurídica</option>
                            <option value="PF">Pessoa Física</option>
                            <option value="MEI">MEI</option>
                            <option value="Outros">Outros</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="cpf_cnpj" className="block text-sm font-semibold text-gray-900">
                            CPF/CNPJ *
                          </label>
                          <input
                            id="cpf_cnpj"
                            type="text"
                            value={formData.cpf_cnpj}
                            onChange={(e) => handleCPFCNPJFieldChange(e.target.value)}
                            placeholder="Digite o CPF ou CNPJ"
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 ${
                              validation.errors.cpf_cnpj 
                                ? 'border-red-300 bg-red-50' 
                                : 'border-gray-300'
                            }`}
                            required
                          />
                          {validation.errors.cpf_cnpj && (
                            <p className="text-sm text-red-600 flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              <span>{validation.errors.cpf_cnpj}</span>
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="inscricao_estadual" className="block text-sm font-semibold text-gray-900">
                            Inscrição Estadual
                          </label>
                          <input
                            id="inscricao_estadual"
                            type="text"
                            value={formData.inscricao_estadual || ''}
                            onChange={(e) => handleFieldChange('inscricao_estadual', e.target.value)}
                            placeholder="Digite a inscrição estadual"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="inscricao_municipal" className="block text-sm font-semibold text-gray-900">
                            Inscrição Municipal
                          </label>
                          <input
                            id="inscricao_municipal"
                            type="text"
                            value={formData.inscricao_municipal || ''}
                            onChange={(e) => handleFieldChange('inscricao_municipal', e.target.value)}
                            placeholder="Digite a inscrição municipal"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="segment_id" className="block text-sm font-semibold text-gray-900">
                            Segmento
                          </label>
                          <select
                            id="segment_id"
                            value={formData.segment_id || ''}
                            onChange={(e) => handleFieldChange('segment_id', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          >
                            <option value="">Selecione o segmento</option>
                            {segments.map((segment: any) => (
                              <option key={segment.id} value={segment.id}>
                                {segment.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Localização */}
                  {activeTab === 'localizacao' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label htmlFor="uf" className="block text-sm font-semibold text-gray-900">
                            UF
                          </label>
                          <select
                            id="uf"
                            value={formData.uf || ''}
                            onChange={(e) => handleFieldChange('uf', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          >
                            <option value="">Selecione o estado</option>
                            <option value="AC">Acre</option>
                            <option value="AL">Alagoas</option>
                            <option value="AP">Amapá</option>
                            <option value="AM">Amazonas</option>
                            <option value="BA">Bahia</option>
                            <option value="CE">Ceará</option>
                            <option value="DF">Distrito Federal</option>
                            <option value="ES">Espírito Santo</option>
                            <option value="GO">Goiás</option>
                            <option value="MA">Maranhão</option>
                            <option value="MT">Mato Grosso</option>
                            <option value="MS">Mato Grosso do Sul</option>
                            <option value="MG">Minas Gerais</option>
                            <option value="PA">Pará</option>
                            <option value="PB">Paraíba</option>
                            <option value="PR">Paraná</option>
                            <option value="PE">Pernambuco</option>
                            <option value="PI">Piauí</option>
                            <option value="RJ">Rio de Janeiro</option>
                            <option value="RN">Rio Grande do Norte</option>
                            <option value="RS">Rio Grande do Sul</option>
                            <option value="RO">Rondônia</option>
                            <option value="RR">Roraima</option>
                            <option value="SC">Santa Catarina</option>
                            <option value="SP">São Paulo</option>
                            <option value="SE">Sergipe</option>
                            <option value="TO">Tocantins</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="cidade" className="block text-sm font-semibold text-gray-900">
                            Cidade
                          </label>
                          <input
                            id="cidade"
                            type="text"
                            value={formData.cidade || ''}
                            onChange={(e) => handleFieldChange('cidade', e.target.value)}
                            placeholder="Digite a cidade"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="cep" className="block text-sm font-semibold text-gray-900">
                            CEP
                          </label>
                          <input
                            id="cep"
                            type="text"
                            value={formData.cep || ''}
                            onChange={(e) => handleFieldChange('cep', e.target.value)}
                            placeholder="00000-000"
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 ${
                              validation.errors.cep 
                                ? 'border-red-300 bg-red-50' 
                                : 'border-gray-300'
                            }`}
                          />
                          {validation.errors.cep && (
                            <p className="text-sm text-red-600 flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              <span>{validation.errors.cep}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label htmlFor="endereco" className="block text-sm font-semibold text-gray-900">
                            Endereço
                          </label>
                          <input
                            id="endereco"
                            type="text"
                            value={formData.endereco || ''}
                            onChange={(e) => handleFieldChange('endereco', e.target.value)}
                            placeholder="Digite o endereço"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="numero" className="block text-sm font-semibold text-gray-900">
                            Número
                          </label>
                          <input
                            id="numero"
                            type="text"
                            value={formData.numero || ''}
                            onChange={(e) => handleFieldChange('numero', e.target.value)}
                            placeholder="Digite o número"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="complemento" className="block text-sm font-semibold text-gray-900">
                            Complemento
                          </label>
                          <input
                            id="complemento"
                            type="text"
                            value={formData.complemento || ''}
                            onChange={(e) => handleFieldChange('complemento', e.target.value)}
                            placeholder="Digite o complemento"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="bairro" className="block text-sm font-semibold text-gray-900">
                            Bairro
                          </label>
                          <input
                            id="bairro"
                            type="text"
                            value={formData.bairro || ''}
                            onChange={(e) => handleFieldChange('bairro', e.target.value)}
                            placeholder="Digite o bairro"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Contato */}
                  {activeTab === 'contato' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label htmlFor="pessoa_contato" className="block text-sm font-semibold text-gray-900">
                            Pessoa de Contato
                          </label>
                          <input
                            id="pessoa_contato"
                            type="text"
                            value={formData.pessoa_contato || ''}
                            onChange={(e) => handleFieldChange('pessoa_contato', e.target.value)}
                            placeholder="Digite o nome da pessoa de contato"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="telefone_fixo" className="block text-sm font-semibold text-gray-900">
                            Telefone Fixo
                          </label>
                          <input
                            id="telefone_fixo"
                            type="tel"
                            value={formData.telefone_fixo || ''}
                            onChange={(e) => handleFieldChange('telefone_fixo', e.target.value)}
                            placeholder="(00) 0000-0000"
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 ${
                              validation.errors.telefone_fixo 
                                ? 'border-red-300 bg-red-50' 
                                : 'border-gray-300'
                            }`}
                          />
                          {validation.errors.telefone_fixo && (
                            <p className="text-sm text-red-600 flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              <span>{validation.errors.telefone_fixo}</span>
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="telefone_celular" className="block text-sm font-semibold text-gray-900">
                            Telefone Celular
                          </label>
                          <input
                            id="telefone_celular"
                            type="tel"
                            value={formData.telefone_celular || ''}
                            onChange={(e) => handleFieldChange('telefone_celular', e.target.value)}
                            placeholder="(00) 00000-0000"
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 ${
                              validation.errors.telefone_celular 
                                ? 'border-red-300 bg-red-50' 
                                : 'border-gray-300'
                            }`}
                          />
                          {validation.errors.telefone_celular && (
                            <p className="text-sm text-red-600 flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              <span>{validation.errors.telefone_celular}</span>
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="email" className="block text-sm font-semibold text-gray-900">
                            Email
                          </label>
                          <input
                            id="email"
                            type="email"
                            value={formData.email || ''}
                            onChange={(e) => handleFieldChange('email', e.target.value)}
                            placeholder="Digite o email"
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 ${
                              validation.errors.email 
                                ? 'border-red-300 bg-red-50' 
                                : 'border-gray-300'
                            }`}
                          />
                          {validation.errors.email && (
                            <p className="text-sm text-red-600 flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              <span>{validation.errors.email}</span>
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="site" className="block text-sm font-semibold text-gray-900">
                            Site
                          </label>
                          <input
                            id="site"
                            type="url"
                            value={formData.site || ''}
                            onChange={(e) => handleFieldChange('site', e.target.value)}
                            placeholder="https://www.exemplo.com"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Financeiro */}
                  {activeTab === 'financeiro' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label htmlFor="banco_nome" className="block text-sm font-semibold text-gray-900">
                            Nome do Banco
                          </label>
                          <input
                            id="banco_nome"
                            type="text"
                            value={formData.banco_nome || ''}
                            onChange={(e) => handleFieldChange('banco_nome', e.target.value)}
                            placeholder="Digite o nome do banco"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="banco_codigo" className="block text-sm font-semibold text-gray-900">
                            Código do Banco
                          </label>
                          <input
                            id="banco_codigo"
                            type="text"
                            value={formData.banco_codigo || ''}
                            onChange={(e) => handleFieldChange('banco_codigo', e.target.value)}
                            placeholder="000"
                            maxLength={3}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="agencia_numero" className="block text-sm font-semibold text-gray-900">
                            Número da Agência
                          </label>
                          <input
                            id="agencia_numero"
                            type="text"
                            value={formData.agencia_numero || ''}
                            onChange={(e) => handleFieldChange('agencia_numero', e.target.value)}
                            placeholder="Digite o número da agência"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="agencia_digito" className="block text-sm font-semibold text-gray-900">
                            Dígito da Agência
                          </label>
                          <input
                            id="agencia_digito"
                            type="text"
                            value={formData.agencia_digito || ''}
                            onChange={(e) => handleFieldChange('agencia_digito', e.target.value)}
                            placeholder="0"
                            maxLength={1}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="conta_numero" className="block text-sm font-semibold text-gray-900">
                            Número da Conta
                          </label>
                          <input
                            id="conta_numero"
                            type="text"
                            value={formData.conta_numero || ''}
                            onChange={(e) => handleFieldChange('conta_numero', e.target.value)}
                            placeholder="Digite o número da conta"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="conta_digito" className="block text-sm font-semibold text-gray-900">
                            Dígito da Conta
                          </label>
                          <input
                            id="conta_digito"
                            type="text"
                            value={formData.conta_digito || ''}
                            onChange={(e) => handleFieldChange('conta_digito', e.target.value)}
                            placeholder="0"
                            maxLength={1}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="pix_chave" className="block text-sm font-semibold text-gray-900">
                            Chave PIX
                          </label>
                          <input
                            id="pix_chave"
                            type="text"
                            value={formData.pix_chave || ''}
                            onChange={(e) => handleFieldChange('pix_chave', e.target.value)}
                            placeholder="Digite a chave PIX"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="condicao_pagamento" className="block text-sm font-semibold text-gray-900">
                            Condição de Pagamento
                          </label>
                          <input
                            id="condicao_pagamento"
                            type="text"
                            value={formData.condicao_pagamento || ''}
                            onChange={(e) => handleFieldChange('condicao_pagamento', e.target.value)}
                            placeholder="Ex: 30 dias, 50% entrada"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Operacional */}
                  {activeTab === 'operacional' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label htmlFor="status" className="block text-sm font-semibold text-gray-900">
                            Status
                          </label>
                          <select
                            id="status"
                            value={formData.status}
                            onChange={(e) => handleFieldChange('status', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          >
                            <option value="ativo">Ativo</option>
                            <option value="inativo">Inativo</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="data_cadastro" className="block text-sm font-semibold text-gray-900">
                            Data de Cadastro
                          </label>
                          <input
                            id="data_cadastro"
                            type="date"
                            value={formData.data_cadastro}
                            onChange={(e) => handleFieldChange('data_cadastro', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="observacoes" className="block text-sm font-semibold text-gray-900">
                          Observações
                        </label>
                        <textarea
                          id="observacoes"
                          value={formData.observacoes || ''}
                          onChange={(e) => handleFieldChange('observacoes', e.target.value)}
                          placeholder="Digite observações adicionais"
                          rows={4}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-gray-700 font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    💾
                    <span>{supplier ? 'Atualizar' : 'Criar'} Fornecedor</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
