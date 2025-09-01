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
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CustomerForm
          customerId={id}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}