'use client';

import SalesModule from '@/modules/SalesModule';

// Desabilitar prerender para esta página
export const dynamic = 'force-dynamic';

export default function Sales() {
  return <SalesModule />;
}
