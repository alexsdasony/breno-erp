'use client';

import SuppliersModule from '@/modules/Suppliers/SuppliersModule';

// Desabilitar prerender para esta página
export const dynamic = 'force-dynamic';

export default function Suppliers() {
  return <SuppliersModule />;
}
