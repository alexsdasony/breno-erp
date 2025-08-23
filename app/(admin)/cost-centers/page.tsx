'use client';

import CostCentersView from './_components/CostCentersView';

// Desabilitar prerender para esta página
export const dynamic = 'force-dynamic';

export default function CostCenters() {
  return <CostCentersView />;
}
