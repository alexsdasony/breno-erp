'use client';

import FinancialView from './_components/FinancialView';

// Desabilitar prerender para esta página
export const dynamic = 'force-dynamic';

export default function Financial() {
  return <FinancialView />;
}
