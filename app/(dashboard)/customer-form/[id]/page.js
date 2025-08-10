'use client';

import CustomerFormPage from '@/pages/CustomerFormPage';

export default function CustomerFormEdit({ params }) {
  return <CustomerFormPage id={params.id} />;
}
