'use client';

import ReportsModule from '@/modules/ReportsModule';

// Desabilitar prerender para esta página
export const dynamic = 'force-dynamic';

export default function Reports() {
  return <ReportsModule />;
}
