'use client';

import CostCentersModule from '@/modules/CostCentersModule';

// Desabilitar prerender para esta página
export const dynamic = 'force-dynamic';

export default function CostCenters() {
  return <CostCentersModule />;
}
