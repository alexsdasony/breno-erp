'use client';

import React from 'react';
import { useSupplierForm } from '../../_hooks/useSupplierForm';
import { Supplier } from '../../../../../src/types';
import { IdentificationTab } from './IdentificationTab';
import { LocationTab } from './LocationTab';
import { ContactTab } from './ContactTab';
import { FinancialTab } from './FinancialTab';
import { OperationalTab } from './OperationalTab';
import { Building2, MapPin, Phone, CreditCard, Settings } from 'lucide-react';

interface SupplierFormProps {
  supplier?: Supplier | null;
  onSave?: (data: any) => void;
  onCancel?: () => void;
}

const SupplierForm: React.FC<SupplierFormProps> = ({ supplier, onSave, onCancel }) => {
  const {
    data,
    activeTab,
    isLoading,
    isSaving,
    validation,
    updateFormData,
    setActiveTab,
    saveSupplier
  } = useSupplierForm(supplier);

  const tabs = [
    {
      id: 'identificacao' as const,
      label: 'Identificação',
      icon: <Building2 className="w-5 h-5" />,
      component: IdentificationTab,
      fields: ['razao_social', 'tipo_contribuinte', 'cpf_cnpj', 'segment_id']
    },
    {
      id: 'localizacao' as const,
      label: 'Localização',
      icon: <MapPin className="w-5 h-5" />,
      component: LocationTab,
      fields: ['cep', 'uf', 'cidade', 'endereco', 'numero', 'bairro']
    },
    {
      id: 'contato' as const,
      label: 'Contato',
      icon: <Phone className="w-5 h-5" />,
      component: ContactTab,
      fields: ['pessoa_contato', 'email', 'telefone_celular', 'telefone_fixo']
    },
    {
      id: 'financeiro' as const,
      label: 'Financeiro',
      icon: <CreditCard className="w-5 h-5" />,
      component: FinancialTab,
      fields: ['banco_nome', 'agencia_numero', 'conta_numero', 'condicao_pagamento']
    },
    {
      id: 'operacional' as const,
      label: 'Operacional',
      icon: <Settings className="w-5 h-5" />,
      component: OperationalTab,
      fields: ['status', 'data_cadastro', 'observacoes']
    }
  ];

  // Função para contar erros por aba
  const getTabErrorCount = (tabFields: string[]) => {
    if (!validation.errors) return 0;
    return tabFields.filter(field => validation.errors[field]).length;
  };

  const currentTab = tabs.find(tab => tab.id === activeTab);
  const CurrentTabComponent = currentTab?.component || IdentificationTab;

  // Calcular progresso do formulário
  const requiredFields = ['razao_social', 'tipo_contribuinte', 'cpf_cnpj'];
  const filledRequiredFields = requiredFields.filter(field => {
    const value = data[field as keyof typeof data];
    return value && value.toString().trim() !== '';
  }).length;
  const progressPercentage = Math.round((filledRequiredFields / requiredFields.length) * 100);
  
  // Contar total de erros
  const totalErrors = validation.errors ? Object.keys(validation.errors).length : 0;

  const handleFormSave = async () => {
    const success = await saveSupplier();
    if (success && onSave) {
      onSave(data);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-card backdrop-blur-sm border border-border/50 rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-card-foreground">
                  {supplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {supplier ? 'Atualize as informações do fornecedor' : 'Preencha os dados para cadastrar um novo fornecedor'}
                </p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="bg-background/50 rounded-lg p-4 border border-border/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-card-foreground">Progresso do Formulário</span>
                <span className="text-sm font-bold text-primary">{progressPercentage}%</span>
              </div>
              <div className="w-full bg-muted/50 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-primary to-primary/80 h-full rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              
              {/* Status Indicators */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center space-x-3">
                  {/* Indicador de Erros */}
                  {totalErrors > 0 && (
                    <div className="flex items-center space-x-2 bg-destructive/10 text-destructive px-3 py-1.5 rounded-full border border-destructive/20">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs font-medium">{totalErrors} erro{totalErrors > 1 ? 's' : ''}</span>
                    </div>
                  )}
                  
                  {/* Status de Sucesso */}
                  {totalErrors === 0 && progressPercentage === 100 && (
                    <div className="flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-200">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs font-medium">Formulário Completo</span>
                    </div>
                  )}
                  
                  {/* Loading State */}
                  {isLoading && (
                    <div className="flex items-center space-x-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full border border-primary/20">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-xs font-medium">Carregando...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2.5 border border-border/50 rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200 font-medium"
              >
                Cancelar
              </button>
            )}
            <button
              type="button"
              onClick={handleFormSave}
              disabled={isSaving || isLoading}
              className="px-8 py-2.5 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-lg hover:from-primary/90 hover:to-primary/80 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium shadow-sm transition-all duration-200"
            >
              {isSaving && (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span>{isSaving ? 'Salvando...' : supplier ? 'Atualizar Fornecedor' : 'Salvar Fornecedor'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-card/50 rounded-xl p-1 mb-6 border border-border/30 shadow-sm">
        <nav className="flex space-x-1 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const errorCount = getTabErrorCount(tab.fields);
            const hasErrors = errorCount > 0;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative inline-flex items-center px-4 py-3 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-200 min-w-fit ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : hasErrors
                    ? 'text-destructive hover:bg-destructive/10 hover:text-destructive'
                    : 'text-muted-foreground hover:text-card-foreground hover:bg-muted/50'
                }`}
              >
                <span className={`mr-2.5 transition-colors ${
                  isActive 
                    ? 'text-primary-foreground' 
                    : hasErrors 
                    ? 'text-destructive' 
                    : 'text-muted-foreground group-hover:text-card-foreground'
                }`}>
                  {tab.icon as React.ReactNode}
                </span>
                <span className="font-medium">{tab.label}</span>
                {hasErrors && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold bg-destructive text-destructive-foreground shadow-sm animate-pulse">
                    {errorCount}
                  </span>
                )}
                {isActive && (
                  <div className="absolute inset-0 rounded-lg bg-primary/10 -z-10" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-card backdrop-blur-sm border border-border/30 rounded-xl p-6 mb-6 shadow-sm">
        <CurrentTabComponent
          data={data}
          onChange={updateFormData}
          validation={validation}
        />
      </div>

      {/* Validation Summary */}
      {validation.errors && Object.keys(validation.errors).length > 0 && (
        <div className="bg-gradient-to-r from-destructive/5 to-destructive/10 border border-destructive/20 rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="h-5 w-5 text-destructive" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold text-destructive">
                  {Object.keys(validation.errors).length} erro{Object.keys(validation.errors).length > 1 ? 's' : ''} encontrado{Object.keys(validation.errors).length > 1 ? 's' : ''}
                </h3>
                <span className="bg-destructive/20 text-destructive px-2 py-1 rounded-full text-xs font-medium">
                  Corrija antes de salvar
                </span>
              </div>
              
              {/* Resumo por aba */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {tabs.map((tab) => {
                  const tabErrors = tab.fields.filter(field => validation.errors[field]);
                  if (tabErrors.length === 0) return null;
                  
                  return (
                    <div key={tab.id} className="bg-background/60 backdrop-blur-sm border border-destructive/10 rounded-lg p-4 hover:bg-background/80 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-destructive">{tab.icon}</span>
                          <span className="font-medium text-destructive">{tab.label}</span>
                        </div>
                        <span className="bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                          {tabErrors.length}
                        </span>
                      </div>
                      <ul className="space-y-2 mb-3">
                        {tabErrors.map(field => (
                          <li key={field} className="flex items-start gap-2 text-sm">
                            <span className="w-1.5 h-1.5 bg-destructive rounded-full mt-2 flex-shrink-0"></span>
                            <span className="text-destructive/90">{validation.errors[field]}</span>
                          </li>
                        ))}
                      </ul>
                      {tab.id !== activeTab && (
                        <button
                          onClick={() => setActiveTab(tab.id)}
                          className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                        >
                          <span>Ir para aba</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierForm;
