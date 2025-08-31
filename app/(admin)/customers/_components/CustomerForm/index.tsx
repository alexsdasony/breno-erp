'use client';

import React from 'react';
import { useCustomerForm } from '../../_hooks/useCustomerForm';
import { CustomerFormProps } from '../../../../../src/types/CustomerForm';
import { PersonalDataTab } from './PersonalDataTab';
import { ProfessionalDataTab } from './ProfessionalDataTab';
import { ContactDataTab } from './ContactDataTab';
import { AddressTab } from './AddressTab';
import { PatrimonyTab } from './PatrimonyTab';
import { DocumentsTab } from './DocumentsTab';
import { SystemTab } from './SystemTab';

const CustomerForm: React.FC<CustomerFormProps> = ({ customerId, onSave, onCancel }) => {
  const {
    data,
    activeTab,
    isLoading,
    isSaving,
    validation,
    updateFormData,
    setActiveTab,
    saveCustomer
  } = useCustomerForm(customerId);

  const tabs = [
    {
      id: 'dados-pessoais' as const,
      label: 'Dados Pessoais',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      component: PersonalDataTab
    },
    {
      id: 'dados-profissionais' as const,
      label: 'Dados Profissionais',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6.5" />
        </svg>
      ),
      component: ProfessionalDataTab
    },
    {
      id: 'contato' as const,
      label: 'Contato',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      component: ContactDataTab
    },
    {
      id: 'endereco' as const,
      label: 'Endereço',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      component: AddressTab
    },
    {
      id: 'patrimonio' as const,
      label: 'Patrimônio',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      component: PatrimonyTab
    },
    {
      id: 'documentos' as const,
      label: 'Documentos',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      component: DocumentsTab
    },
    {
      id: 'sistema' as const,
      label: 'Sistema',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      component: SystemTab
    }
  ];

  const currentTab = tabs.find(tab => tab.id === activeTab);
  const CurrentTabComponent = currentTab?.component || PersonalDataTab;

  const handleFormSave = async () => {
    const success = await saveCustomer();
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
    <div className="max-w-6xl mx-auto bg-card rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="border-b border-border pb-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-card-foreground">
              {customerId ? 'Editar Cliente' : 'Novo Cliente'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {customerId ? 'Atualize as informações do cliente' : 'Preencha os dados para cadastrar um novo cliente'}
            </p>
          </div>
          <div className="flex space-x-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-border rounded-md text-muted-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
              >
                Cancelar
              </button>
            )}
            <button
              type="button"
              onClick={handleFormSave}
              disabled={isSaving}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 flex items-center space-x-2"
            >
              {isSaving && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span>{isSaving ? 'Salvando...' : 'Salvar Cliente'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-border mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const hasErrors = validation.errors && Object.keys(validation.errors).length > 0;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-card-foreground hover:border-muted'
                } ${hasErrors && tab.id === 'dados-pessoais' ? 'text-destructive' : ''}`}
              >
                <span className={`mr-2 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-card-foreground'}`}>
                  {tab.icon as React.ReactNode}
                </span>
                {tab.label}
                {hasErrors && tab.id === 'dados-pessoais' && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
                    !
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="pb-6">
        <CurrentTabComponent
          data={data}
          onChange={updateFormData}
          validation={validation}
          isLoading={isSaving}
        />
      </div>

      {/* Validation Errors */}
      {validation.errors && Object.keys(validation.errors).length > 0 && (
        <div className="mt-6 bg-destructive/10 border border-destructive/20 rounded-md p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-destructive" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-destructive">Corrija os seguintes erros:</h3>
              <div className="mt-2 text-sm text-destructive/80">
                <ul className="list-disc pl-5 space-y-1">
                  {Object.entries(validation.errors).map(([field, error]) => (
                    <li key={field}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerForm;