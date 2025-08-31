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
import { User, Briefcase, Phone, MapPin, Banknote, FileText, Settings } from 'lucide-react';

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
      icon: <User className="w-5 h-5" />,
      component: PersonalDataTab
    },
    {
      id: 'dados-profissionais' as const,
      label: 'Dados Profissionais',
      icon: <Briefcase className="w-5 h-5" />,
      component: ProfessionalDataTab
    },
    {
      id: 'contato' as const,
      label: 'Contato',
      icon: <Phone className="w-5 h-5" />,
      component: ContactDataTab
    },
    {
      id: 'endereco' as const,
      label: 'Endereço',
      icon: <MapPin className="w-5 h-5" />,
      component: AddressTab
    },
    {
      id: 'patrimonio' as const,
      label: 'Patrimônio',
      icon: <Banknote className="w-5 h-5" />,
      component: PatrimonyTab
    },
    {
      id: 'documentos' as const,
      label: 'Documentos',
      icon: <FileText className="w-5 h-5" />,
      component: DocumentsTab
    },
    {
      id: 'sistema' as const,
      label: 'Sistema',
      icon: <Settings className="w-5 h-5" />,
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