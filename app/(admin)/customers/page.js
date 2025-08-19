'use client';

import CustomersModule from '@/modules/Customers/CustomersModule';

// Desabilitar prerender para esta página
export const dynamic = 'force-dynamic';

export default function Customers() {
  return <CustomersModule />;
}
