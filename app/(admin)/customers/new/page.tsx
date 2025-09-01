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
    <CustomerForm
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}