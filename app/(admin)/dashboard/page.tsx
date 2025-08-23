'use client';

import DashboardView from './_components/DashboardView';

// Desabilitar prerender para esta página
export const dynamic = 'force-dynamic';

export default function Dashboard() {
  return <DashboardView />;
}
