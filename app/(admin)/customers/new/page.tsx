'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import CustomerForm from '../_components/CustomerForm';
import type { CustomerFormData } from '../../../../src/types/CustomerForm';

export default function NewCustomerPage() {
  const router = useRouter();

  const handleSave = (customerData: CustomerFormData) => {
    // Redirecionar para a lista de clientes após salvar
    router.push('/customers');
  };

  const handleCancel = () => {
    // Voltar para a lista de clientes
    router.push('/customers');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CustomerForm
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}