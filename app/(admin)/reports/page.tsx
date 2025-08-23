'use client';

import ReportsView from './_components/ReportsView';

// Desabilitar prerender para esta página
export const dynamic = 'force-dynamic';

export default function Reports() {
  return <ReportsView />;
}
