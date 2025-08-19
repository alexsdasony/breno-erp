'use client';

import CustomerFormPage from '../page';

// Desabilitar prerender para esta página
export const dynamic = 'force-dynamic';

export default function CustomerEditPage({ params }) {
  return <CustomerFormPage id={parseInt(params.id)} />;
}
