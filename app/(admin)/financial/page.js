'use client';

import FinancialModule from '@/modules/FinancialModule';

// Desabilitar prerender para esta página
export const dynamic = 'force-dynamic';

export default function Financial() {
  return <FinancialModule />;
}
