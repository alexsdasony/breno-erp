'use client';

import SuppliersView from './_components/SuppliersView';

// Desabilitar prerender para esta página
export const dynamic = 'force-dynamic';

export default function Suppliers() {
  return <SuppliersView />;
}
