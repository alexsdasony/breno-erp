'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import CustomerForm from '../../_components/CustomerForm';
import type { CustomerFormData } from '../../../../../src/types/CustomerForm';

interface EditCustomerPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditCustomerPage({ params }: EditCustomerPageProps) {
  const router = useRouter();
  const { id } = React.use(params);

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
      customerId={id}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}