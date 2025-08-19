'use client';

import NFeModule from '@/modules/NFeModule';

// Desabilitar prerender para esta página
export const dynamic = 'force-dynamic';

export default function NFe() {
  return <NFeModule />;
}
