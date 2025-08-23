'use client';

import CustomersView from './_components/CustomersView';

// Desabilitar prerender para esta página
export const dynamic = 'force-dynamic';

export default function Customers() {
  return <CustomersView />;
}
