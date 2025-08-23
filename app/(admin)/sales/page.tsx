'use client';

import SalesView from './_components/SalesView';

// Desabilitar prerender para esta página
export const dynamic = 'force-dynamic';

export default function Sales() {
  return <SalesView />;
}
