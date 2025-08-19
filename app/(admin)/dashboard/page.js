'use client';

import DashboardModule from '@/modules/DashboardModule';

// Desabilitar prerender para esta página
export const dynamic = 'force-dynamic';

export default function Dashboard() {
  return <DashboardModule />;
}
