'use client';

import SegmentsModule from '@/modules/Segments/SegmentsModule';

// Desabilitar prerender para esta página
export const dynamic = 'force-dynamic';

export default function Segments() {
  return <SegmentsModule />;
}
